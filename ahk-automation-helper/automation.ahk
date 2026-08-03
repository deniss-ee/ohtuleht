#Requires AutoHotkey v2.0
#SingleInstance Force

CoordMode("Mouse", "Screen")
CoordMode("Pixel", "Screen")
SendMode("Event")
SetMouseDelay(40)

; ============================================================
; Project overview
; ------------------------------------------------------------
; This script has two independent systems:
; 1. Miner automation trained live with F10 and run with F8.
; 2. Optional extra task automation from tasks.ini.
;
; The miner stores learned ore coordinates/colors in miner_profile.ini.
; ============================================================

; ============================================================
; Global state
; ------------------------------------------------------------
; ============================================================

global Tasks := []
global ConfigFile := A_ScriptDir "\tasks.ini"
global MinerProfileFile := A_ScriptDir "\miner_profile.ini"
global ShowTaskStatus := false

; Miner fields are grouped so the miner behaves like a tiny state machine.
; ActiveOre = currently mined ore index, or 0 if idle.
; LastFullStates = previous frame's full/empty state for each ore.
; LastOreClickTicks = per-ore cooldown to prevent duplicate clicks.
global Miner := {
    Enabled: false,
    Training: false,
    TrainingStep: 0,
    ProfileLoaded: false,
    ActiveOre: 0,
    LastClickTick: 0,
    ClickGuardMs: 400,
    PollInterval: 5,
    ColorTolerance: 18,
    MouseSettleMs: 30,
    ClickHoldMs: 120,
    OreRetryCooldownMs: 900,
    Ores: [],
    LastFullStates: [],
    LastOreClickTicks: [],
    PendingOre: { X: 0, Y: 0, FullColor: 0x000000, EmptyColor: 0x000000 }
}

; ============================================================
; Startup + hotkeys
; ============================================================

LoadConfig()
LoadMinerProfile()

F12::LoadConfig()
F11::StopAll()
F9::ShowStatus()
F8::ToggleMiner()
F10::HandleTrainingHotkey()

; ============================================================
; Task engine
; ============================================================

LoadConfig() {
    global Tasks, ConfigFile

    StopAllTasks()
    Tasks := []

    ; tasks.ini is optional. If it does not exist, the miner still works.
    if !FileExist(ConfigFile) {
        ShowStatus()
        return
    }

    sections := StrSplit(IniRead(ConfigFile), "`n")
    for sectionName in sections {
        sectionName := Trim(sectionName)
        if (sectionName = "")
            continue

        task := BuildTaskFromSection(sectionName)
        Tasks.Push(task)
        RegisterTask(task)
    }

    ; Reload the miner profile too, so changing ore data on disk is picked up.
    LoadMinerProfile()
    ShowStatus()
}

BuildTaskFromSection(sectionName) {
    global ConfigFile

    ; Each section is a self-contained task definition.
    return {
        Name: sectionName,
        Enabled: IniRead(ConfigFile, sectionName, "Enabled", "0") = "1",
        Hotkey: IniRead(ConfigFile, sectionName, "Hotkey", ""),
        Mode: IniRead(ConfigFile, sectionName, "Mode", "TimerOnly"),
        X: Integer(IniRead(ConfigFile, sectionName, "X", "0")),
        Y: Integer(IniRead(ConfigFile, sectionName, "Y", "0")),
        Color: Integer(IniRead(ConfigFile, sectionName, "Color", "0x000000")),
        Tolerance: Integer(IniRead(ConfigFile, sectionName, "Tolerance", "0")),
        Interval: Integer(IniRead(ConfigFile, sectionName, "Interval", "1000")),
        ClickX: Integer(IniRead(ConfigFile, sectionName, "ClickX", "0")),
        ClickY: Integer(IniRead(ConfigFile, sectionName, "ClickY", "0")),
        ClickType: IniRead(ConfigFile, sectionName, "ClickType", "Left"),
        Active: false,
        BoundTick: 0
    }
}

RegisterTask(task) {
    ; Tasks are initially inactive unless Enabled=1.
    task.Active := task.Enabled
    task.BoundTick := TickFactory(task)

    if (task.Active)
        SetTimer(task.BoundTick, task.Interval)

    if (task.Hotkey != "")
        RegisterTaskHotkey(task)
}

RegisterTaskHotkey(task) {
    try Hotkey(task.Hotkey, ToggleFactory(task))
}

TickFactory(task) {
    ; Wrap the task object in a closure so SetTimer can call it later.
    return () => RunTick(task)
}

ToggleFactory(task) {
    ; Hotkeys need a callback with no parameters, so this closes over task.
    return (*) => ToggleTask(task)
}

RunTick(task) {
    ; Task disabled? Nothing to do.
    if !task.Active
        return

    ; TimerOnly = blind clicking. Pixel modes check a color first.
    if (task.Mode = "TimerOnly") {
        DoClick(task)
        return
    }

    ; PixelOnly / PixelTimer: only click if the pixel color matches
    pixel := PixelGetColor(task.X, task.Y, "RGB")
    if ColorMatches(pixel, task.Color, task.Tolerance)
        DoClick(task)
}

ColorMatches(pixel, target, tolerance) {
    ; Compare each RGB channel independently.
    pr := (pixel >> 16) & 0xFF, pg := (pixel >> 8) & 0xFF, pb := pixel & 0xFF
    tr := (target >> 16) & 0xFF, tg := (target >> 8) & 0xFF, tb := target & 0xFF
    return Abs(pr - tr) <= tolerance && Abs(pg - tg) <= tolerance && Abs(pb - tb) <= tolerance
}

DoClick(task) {
    ; Keep click types explicit so task definitions remain easy to read.
    switch task.ClickType {
        case "Right":
            Click(task.ClickX, task.ClickY, "Right")
        case "Double":
            Click(task.ClickX, task.ClickY, "Left", 2)
        default:
            Click(task.ClickX, task.ClickY, "Left")
    }
}

ToggleTask(task) {
    ; Per-task hotkey toggles that single task.
    task.Active := !task.Active
    if (task.Active)
        SetTimer(task.BoundTick, task.Interval)
    else
        SetTimer(task.BoundTick, 0)
    ShowStatus()
}

StopAll() {
    global Tasks
    ; Panic stop should cancel both systems.
    AbortTraining(false)
    StopMiner(false)
    StopAllTasks()
    ShowStatus()
    ToolTip("All tasks stopped (F11)")
    SetTimer(() => ToolTip(), -1500)
}

StopAllTasks() {
    global Tasks

    for task in Tasks {
        task.Active := false
        SetTimer(task.BoundTick, 0)
    }
}

; ============================================================
; Status UI
; ============================================================

ShowStatus() {
    global Tasks, Miner, ShowTaskStatus
    lines := ""

    minerState := ""
    if Miner.Training {
        oreNumber := Miner.Ores.Length + 1
        minerState := "MINER training ore " oreNumber " step " Miner.TrainingStep "/2"
    } else if Miner.Enabled {
        activeOre := Miner.ActiveOre = 0 ? "none" : Miner.ActiveOre
        minerState := "MINER ON (active ore " activeOre ", total " Miner.Ores.Length ")"
    } else if Miner.ProfileLoaded {
        minerState := "MINER off (" Miner.Ores.Length " ores ready; F10 add, F8 start)"
    } else {
        minerState := "MINER off (no ores; F10 to add first ore)"
    }
    lines .= minerState "`n"

    if ShowTaskStatus {
        for task in Tasks {
            state := task.Active ? "ON " : "off"
            hk := task.Hotkey != "" ? " (" task.Hotkey ")" : ""
            lines .= state " - " task.Name hk "`n"
        }
    }
    if (lines = "")
        lines := "No tasks loaded"
    ToolTip(lines)
    SetTimer(() => ToolTip(), -2000)
}

; ============================================================
; Miner training flow
; ============================================================

HandleTrainingHotkey() {
    global Miner

    ; If mining is already running, stop it first so training is always safe.
    if Miner.Enabled
        StopMiner(false)

    ; One F10 press adds one ore; pressing it again during training cancels.
    if Miner.Training {
        AbortTraining(true)
        return
    }

    StartTraining()
}

StartTraining() {
    global Miner

    ; Training captures one ore in two clicks: FULL then EMPTY.
    Miner.Training := true
    Miner.TrainingStep := 1
    Miner.ActiveOre := 0
    Miner.LastClickTick := 0
    Miner.PendingOre := { X: 0, Y: 0, FullColor: 0x000000, EmptyColor: 0x000000 }
    Miner.LastOreClickTicks := []
    SetTrainingCapture(true)
    ShowTrainingPrompt()
    ShowStatus()
}

AbortTraining(showTip := true) {
    global Miner

    ; Clear the temporary capture state, but keep already saved ores.
    wasTraining := Miner.Training
    Miner.Training := false
    Miner.TrainingStep := 0
    Miner.PendingOre := { X: 0, Y: 0, FullColor: 0x000000, EmptyColor: 0x000000 }
    Miner.LastOreClickTicks := []
    SetTrainingCapture(false)

    if (showTip && wasTraining) {
        ShowTransientTip("Miner training canceled")
        ShowStatus()
    }
}

SetTrainingCapture(enabled) {
    ; ~LButton lets the click go through to the game while we also record it.
    if enabled
        Hotkey("~LButton", CaptureTrainingClick, "On")
    else
        try Hotkey("~LButton", "Off")
}

CaptureTrainingClick(*) {
    global Miner

    if !Miner.Training
        return

    ; Record the actual clicked screen position and the sampled pixel color.
    MouseGetPos(&x, &y)
    color := PixelGetColor(x, y, "RGB")

    switch Miner.TrainingStep {
        case 1:
            ; Step 1: remember the ore's FULL state at the clicked position.
            Miner.PendingOre := { X: x, Y: y, FullColor: color, EmptyColor: 0x000000 }
            Miner.TrainingStep := 2
            ShowTransientTip("Saved ore FULL at " x "," y)
            ShowTrainingPrompt()

        case 2:
            ; Step 2: sample the same coordinates again while the ore is EMPTY.
            Miner.PendingOre.EmptyColor := PixelGetColor(Miner.PendingOre.X, Miner.PendingOre.Y, "RGB")

            ; Commit the ore into the in-memory list.
            Miner.Ores.Push({
                X: Miner.PendingOre.X,
                Y: Miner.PendingOre.Y,
                FullColor: Miner.PendingOre.FullColor,
                EmptyColor: Miner.PendingOre.EmptyColor
            })

            oreNumber := Miner.Ores.Length
            Miner.Training := false
            Miner.TrainingStep := 0
            Miner.PendingOre := { X: 0, Y: 0, FullColor: 0x000000, EmptyColor: 0x000000 }
            SetTrainingCapture(false)

            SaveMinerProfile()
            LoadMinerProfile()
            ShowTransientTip("Ore " oreNumber " saved. F10 add more, F8 start mining.", 2200)
    }

    ShowStatus()
}

ShowTrainingPrompt() {
    global Miner

    text := ""
    oreNumber := Miner.Ores.Length + 1
    switch Miner.TrainingStep {
        case 1:
            text := "Add ore " oreNumber " 1/2: Left-click ore when FULL"
        case 2:
            text := "Add ore " oreNumber " 2/2: Click again when EMPTY"
    }
    if (text != "")
        ShowTransientTip(text, 2600)
}

; ============================================================
; Miner runtime loop
; ============================================================

ToggleMiner() {
    global Miner

    ; F8 toggles runtime, but never starts mining while training is active.
    if Miner.Enabled {
        StopMiner(true)
        return
    }

    if Miner.Training {
        ShowTransientTip("Cannot start miner during training")
        return
    }

    if !Miner.ProfileLoaded
        LoadMinerProfile()

    if !Miner.ProfileLoaded {
        ShowTransientTip("No miner profile found. Press F10 to train first.", 2200)
        return
    }

    Miner.Enabled := true
    Miner.ActiveOre := 0
    ResetOreStateTracking()
    ResetOreClickCooldowns()
    Miner.LastClickTick := 0
    SetTimer(MinerTick, Miner.PollInterval)
    ShowTransientTip("Miner started (F8 to stop)")
    ShowStatus()
}

StopMiner(showTip := true) {
    global Miner

    ; Reset all runtime state, but keep the saved ore profile.
    wasEnabled := Miner.Enabled
    Miner.Enabled := false
    Miner.ActiveOre := 0
    ResetOreStateTracking()
    ResetOreClickCooldowns()
    SetTimer(MinerTick, 0)

    if (showTip && wasEnabled) {
        ShowTransientTip("Miner stopped")
        ShowStatus()
    }
}

ResetOreStateTracking() {
    global Miner

    ; Track previous full/empty state for every ore.
    Miner.LastFullStates := []
    loop Miner.Ores.Length
        Miner.LastFullStates.Push(false)
}

ResetOreClickCooldowns() {
    global Miner

    ; Prevent the same ore from being clicked again too quickly.
    Miner.LastOreClickTicks := []
    loop Miner.Ores.Length
        Miner.LastOreClickTicks.Push(0)
}

MinerTick() {
    global Miner

    ; The miner loop is intentionally tiny: sample states, react, repeat.
    if !Miner.Enabled
        return

    if Miner.Training
        return

    oreCount := Miner.Ores.Length
    if (oreCount = 0)
        return

    if (Miner.LastFullStates.Length != oreCount)
        ResetOreStateTracking()

    if (Miner.LastOreClickTicks.Length != oreCount)
        ResetOreClickCooldowns()

    fullStates := []
    loop oreCount {
        idx := A_Index
        fullStates.Push(OreMatchesColor(idx, "Full"))
    }

    if (Miner.ActiveOre > oreCount)
        Miner.ActiveOre := 0

    if (Miner.ActiveOre > 0) {
        ; If the active ore changed from FULL to not-FULL, release it.
        prevFull := Miner.LastFullStates[Miner.ActiveOre]
        nowFull := fullStates[Miner.ActiveOre]
        if (prevFull && !nowFull)
            Miner.ActiveOre := 0
    }

    if (Miner.ActiveOre = 0) {
        ; No active ore: pick the first ore that is currently FULL.
        for idx, isFull in fullStates {
            if isFull && !OreOnCooldown(idx) {
                MinerClickOre(idx)
                break
            }
        }
    }

    ; Store this frame for the next tick's edge detection.
    Miner.LastFullStates := fullStates
}

MinerClickOre(index) {
    global Miner

    ; Guard against accidental re-click spam.
    if ((A_TickCount - Miner.LastClickTick) < Miner.ClickGuardMs)
        return

    ; Never click the ore that is already marked active.
    if (Miner.ActiveOre = index)
        return

    if (index < 1 || index > Miner.Ores.Length)
        return

    ore := Miner.Ores[index]
    PerformMinerClick(ore.X, ore.Y)
    Miner.ActiveOre := index
    Miner.LastClickTick := A_TickCount
    Miner.LastOreClickTicks[index] := A_TickCount
}

OreOnCooldown(index) {
    global Miner

    ; An ore can stay visually FULL for a short time after a click.
    ; This cooldown prevents the miner from selecting it again too soon.
    if (index < 1 || index > Miner.LastOreClickTicks.Length)
        return false

    lastTick := Miner.LastOreClickTicks[index]
    return lastTick > 0 && (A_TickCount - lastTick) < Miner.OreRetryCooldownMs
}

PerformMinerClick(x, y) {
    global Miner

    ; Use a real mouse-down / mouse-up sequence with small delays so games
    ; are more likely to register the click.
    MouseMove(x, y, 0)
    Sleep(Miner.MouseSettleMs)
    SendEvent("{LButton down}")
    Sleep(Miner.ClickHoldMs)
    SendEvent("{LButton up}")
    Sleep(Miner.MouseSettleMs)
}

OreMatchesColor(index, targetState) {
    global Miner

    ; Read the current pixel color at the ore coordinates and compare it to
    ; either the FULL or EMPTY sample captured during training.
    if (index < 1 || index > Miner.Ores.Length)
        return false

    ore := Miner.Ores[index]
    pixel := PixelGetColor(ore.X, ore.Y, "RGB")
    target := targetState = "Full" ? ore.FullColor : ore.EmptyColor
    return ColorMatches(pixel, target, Miner.ColorTolerance)
}

; ============================================================
; Miner profile persistence
; ============================================================

LoadMinerProfile() {
    global Miner, MinerProfileFile

    if !FileExist(MinerProfileFile) {
        Miner.Ores := []
        Miner.ActiveOre := 0
        ResetOreStateTracking()
        Miner.ProfileLoaded := false
        return false
    }

    ores := []
    oreCount := Integer(IniRead(MinerProfileFile, "Miner", "OreCount", "0"))

    if (oreCount > 0) {
        ; Current format: [Miner] OreCount=N, then [Ore1], [Ore2], ...
        loop oreCount {
            idx := A_Index
            section := "Ore" idx
            x := ReadMinerValue(section, "X")
            y := ReadMinerValue(section, "Y")
            full := ReadMinerValue(section, "FullColor")
            empty := ReadMinerValue(section, "EmptyColor")
            if (x = "" || y = "" || full = "" || empty = "")
                continue
            ores.Push({ X: x, Y: y, FullColor: full, EmptyColor: empty })
        }
    } else {
        ; Legacy migration from 2-vein profile format
        ; This keeps older saved profiles usable without manual conversion.
        v1x := ReadMinerValue("Vein1", "X")
        v1y := ReadMinerValue("Vein1", "Y")
        v1full := ReadMinerValue("Vein1", "FullColor")
        v1empty := ReadMinerValue("Vein1", "EmptyColor")
        v2x := ReadMinerValue("Vein2", "X")
        v2y := ReadMinerValue("Vein2", "Y")
        v2full := ReadMinerValue("Vein2", "FullColor")
        v2empty := ReadMinerValue("Vein2", "EmptyColor")

        if !(v1x = "" || v1y = "" || v1full = "" || v1empty = "")
            ores.Push({ X: v1x, Y: v1y, FullColor: v1full, EmptyColor: v1empty })
        if !(v2x = "" || v2y = "" || v2full = "" || v2empty = "")
            ores.Push({ X: v2x, Y: v2y, FullColor: v2full, EmptyColor: v2empty })
    }

    if (ores.Length = 0) {
        Miner.Ores := []
        Miner.ActiveOre := 0
        ResetOreStateTracking()
        Miner.ProfileLoaded := false
        return false
    }

    Miner.Ores := ores
    Miner.ActiveOre := 0
    ResetOreStateTracking()
    Miner.ProfileLoaded := true
    return true
}

ReadMinerValue(section, key) {
    global MinerProfileFile

    val := IniRead(MinerProfileFile, section, key, "__missing__")
    if (val = "__missing__")
        return ""
    return Integer(val)
}

SaveMinerProfile() {
    global Miner, MinerProfileFile

    ; Rebuild the profile file from scratch so it always matches Miner.Ores.
    if FileExist(MinerProfileFile)
        FileDelete(MinerProfileFile)

    IniWrite(Miner.Ores.Length, MinerProfileFile, "Miner", "OreCount")
    for idx, ore in Miner.Ores {
        ; Each ore gets its own section to keep the file easy to inspect.
        section := "Ore" idx
        IniWrite(ore.X, MinerProfileFile, section, "X")
        IniWrite(ore.Y, MinerProfileFile, section, "Y")
        IniWrite(ore.FullColor, MinerProfileFile, section, "FullColor")
        IniWrite(ore.EmptyColor, MinerProfileFile, section, "EmptyColor")
    }
}

ShowTransientTip(text, timeoutMs := 1500) {
    ToolTip(text)
    SetTimer(() => ToolTip(), -timeoutMs)
}
