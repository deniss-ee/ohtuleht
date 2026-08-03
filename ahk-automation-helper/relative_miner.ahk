#Requires AutoHotkey v2.0
#SingleInstance Force

CoordMode("Mouse", "Screen")
CoordMode("Pixel", "Screen")
SendMode("Event")
SetMouseDelay(40)

; ============================================================
; Relative Miner (standalone)
; ------------------------------------------------------------
; Hotkeys:
;   F7  - set or replace anchor (reference tile)
;   F10 - add one ore (FULL click, then EMPTY click)
;   F8  - start or stop mining
;   F11 - panic stop
;
; Profile:
;   relative_miner_profile.ini
; ============================================================

global ProfileFile := A_ScriptDir "\relative_miner_profile.ini"

global Miner := {
    Enabled: false,
    Training: false,
    TrainingStep: 0,
    ProfileLoaded: false,
    AnchorSet: false,
    AnchorX: 0,
    AnchorY: 0,
    ActiveOre: 0,
    LastClickTick: 0,
    ClickGuardMs: 400,
    PollInterval: 10,
    ColorTolerance: 18,
    MouseSettleMs: 30,
    ClickHoldMs: 120,
    OreRetryCooldownMs: 900,
    Ores: [],
    LastFullStates: [],
    LastOreClickTicks: [],
    PendingOre: {
        OffsetX: 0,
        OffsetY: 0,
        FullColor: 0x000000,
        EmptyColor: 0x000000
    }
}

LoadProfile()
SetTimer(MiningLoop, Miner.PollInterval)

F7::SetAnchor()
F10::HandleTrainingHotkey()
F8::ToggleMiner()
F11::PanicStop()

SetAnchor() {
    global Miner

    if Miner.Training
        AbortTraining(false)

    if Miner.Enabled
        StopMiner(false)

    MouseGetPos(&x, &y)
    Miner.AnchorX := x
    Miner.AnchorY := y
    Miner.AnchorSet := true
    SaveProfile()
    ShowTransientTip("Anchor set to " x "," y)
    ShowStatus()
}

HandleTrainingHotkey() {
    global Miner

    if !Miner.AnchorSet {
        ShowTransientTip("Set anchor first (F7)")
        return
    }

    if Miner.Enabled
        StopMiner(false)

    if Miner.Training {
        AbortTraining(true)
        return
    }

    StartTraining()
}

StartTraining() {
    global Miner

    Miner.Training := true
    Miner.TrainingStep := 1
    Miner.PendingOre := {
        OffsetX: 0,
        OffsetY: 0,
        FullColor: 0x000000,
        EmptyColor: 0x000000
    }
    SetTrainingCapture(true)
    ShowTrainingPrompt()
    ShowStatus()
}

AbortTraining(showTip := true) {
    global Miner

    wasTraining := Miner.Training
    Miner.Training := false
    Miner.TrainingStep := 0
    Miner.PendingOre := {
        OffsetX: 0,
        OffsetY: 0,
        FullColor: 0x000000,
        EmptyColor: 0x000000
    }
    SetTrainingCapture(false)

    if (showTip && wasTraining) {
        ShowTransientTip("Training canceled")
        ShowStatus()
    }
}

SetTrainingCapture(enabled) {
    ; ~LButton passes click through to game while we sample it.
    if enabled
        Hotkey("~LButton", CaptureTrainingClick, "On")
    else
        try Hotkey("~LButton", "Off")
}

CaptureTrainingClick(*) {
    global Miner

    if !Miner.Training
        return

    Sleep(Miner.MouseSettleMs)
    MouseGetPos(&x, &y)
    color := PixelGetColor(x, y, "RGB")

    switch Miner.TrainingStep {
        case 1:
            Miner.PendingOre.OffsetX := x - Miner.AnchorX
            Miner.PendingOre.OffsetY := y - Miner.AnchorY
            Miner.PendingOre.FullColor := color
            Miner.TrainingStep := 2
            ShowTrainingPrompt()

        case 2:
            absX := Miner.AnchorX + Miner.PendingOre.OffsetX
            absY := Miner.AnchorY + Miner.PendingOre.OffsetY
            Miner.PendingOre.EmptyColor := PixelGetColor(absX, absY, "RGB")

            Miner.Ores.Push({
                OffsetX: Miner.PendingOre.OffsetX,
                OffsetY: Miner.PendingOre.OffsetY,
                FullColor: Miner.PendingOre.FullColor,
                EmptyColor: Miner.PendingOre.EmptyColor
            })

            oreNumber := Miner.Ores.Length
            Miner.Training := false
            Miner.TrainingStep := 0
            Miner.PendingOre := {
                OffsetX: 0,
                OffsetY: 0,
                FullColor: 0x000000,
                EmptyColor: 0x000000
            }
            SetTrainingCapture(false)

            SaveProfile()
            LoadProfile()
            ShowTransientTip("Ore " oreNumber " saved (F10 add more, F8 mine)", 2200)
    }

    ShowStatus()
}

ShowTrainingPrompt() {
    global Miner

    oreNumber := Miner.Ores.Length + 1
    if (Miner.TrainingStep = 1)
        ShowTransientTip("Ore " oreNumber " 1/2: click ore when FULL", 2600)
    else if (Miner.TrainingStep = 2)
        ShowTransientTip("Ore " oreNumber " 2/2: click same ore when EMPTY", 2600)
}

ToggleMiner() {
    global Miner

    if Miner.Enabled {
        StopMiner(true)
        return
    }

    if Miner.Training {
        ShowTransientTip("Finish or cancel training first")
        return
    }

    if !Miner.ProfileLoaded
        LoadProfile()

    if !Miner.ProfileLoaded {
        ShowTransientTip("Need anchor + at least one ore (F7, then F10)", 2200)
        return
    }

    Miner.Enabled := true
    Miner.ActiveOre := 0
    ResetOreStateTracking()
    ResetOreClickCooldowns()
    Miner.LastClickTick := 0
    ShowTransientTip("Mining started (F8 stop, F11 panic)")
    ShowStatus()
}

StopMiner(showTip := true) {
    global Miner

    wasEnabled := Miner.Enabled
    Miner.Enabled := false
    Miner.ActiveOre := 0
    ResetOreStateTracking()
    ResetOreClickCooldowns()

    if (showTip && wasEnabled) {
        ShowTransientTip("Mining stopped")
        ShowStatus()
    }
}

PanicStop() {
    AbortTraining(false)
    StopMiner(false)
    ShowTransientTip("PANIC STOP", 1500)
    ShowStatus()
}

ResetOreStateTracking() {
    global Miner

    Miner.LastFullStates := []
    loop Miner.Ores.Length
        Miner.LastFullStates.Push(false)
}

ResetOreClickCooldowns() {
    global Miner

    Miner.LastOreClickTicks := []
    loop Miner.Ores.Length
        Miner.LastOreClickTicks.Push(0)
}

MiningLoop() {
    global Miner

    if !Miner.Enabled || Miner.Training
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

    ; Release active ore when it transitions from full to not-full.
    if (Miner.ActiveOre > 0) {
        prevFull := Miner.LastFullStates[Miner.ActiveOre]
        nowFull := fullStates[Miner.ActiveOre]
        if (prevFull && !nowFull)
            Miner.ActiveOre := 0
    }

    if (Miner.ActiveOre = 0) {
        for idx, isFull in fullStates {
            if (isFull && !OreOnCooldown(idx)) {
                MinerClickOre(idx)
                break
            }
        }
    }

    Miner.LastFullStates := fullStates
}

MinerClickOre(index) {
    global Miner

    if ((A_TickCount - Miner.LastClickTick) < Miner.ClickGuardMs)
        return

    if (Miner.ActiveOre = index)
        return

    if (index < 1 || index > Miner.Ores.Length)
        return

    ore := Miner.Ores[index]
    x := Miner.AnchorX + ore.OffsetX
    y := Miner.AnchorY + ore.OffsetY
    PerformMinerClick(x, y)

    Miner.ActiveOre := index
    Miner.LastClickTick := A_TickCount
    Miner.LastOreClickTicks[index] := A_TickCount
}

OreOnCooldown(index) {
    global Miner

    if (index < 1 || index > Miner.LastOreClickTicks.Length)
        return false

    lastTick := Miner.LastOreClickTicks[index]
    return (lastTick > 0 && (A_TickCount - lastTick) < Miner.OreRetryCooldownMs)
}

OreMatchesColor(index, targetState) {
    global Miner

    if (index < 1 || index > Miner.Ores.Length)
        return false

    ore := Miner.Ores[index]
    x := Miner.AnchorX + ore.OffsetX
    y := Miner.AnchorY + ore.OffsetY
    pixel := PixelGetColor(x, y, "RGB")
    target := (targetState = "Full") ? ore.FullColor : ore.EmptyColor
    return ColorMatches(pixel, target, Miner.ColorTolerance)
}

PerformMinerClick(x, y) {
    global Miner

    MouseMove(x, y, 0)
    Sleep(Miner.MouseSettleMs)
    SendEvent("{LButton down}")
    Sleep(Miner.ClickHoldMs)
    SendEvent("{LButton up}")
    Sleep(Miner.MouseSettleMs)
}

ColorMatches(pixel, target, tolerance) {
    pr := (pixel >> 16) & 0xFF, pg := (pixel >> 8) & 0xFF, pb := pixel & 0xFF
    tr := (target >> 16) & 0xFF, tg := (target >> 8) & 0xFF, tb := target & 0xFF
    return Abs(pr - tr) <= tolerance && Abs(pg - tg) <= tolerance && Abs(pb - tb) <= tolerance
}

LoadProfile() {
    global Miner, ProfileFile

    Miner.Ores := []
    Miner.ActiveOre := 0
    Miner.AnchorSet := false
    Miner.AnchorX := 0
    Miner.AnchorY := 0

    if !FileExist(ProfileFile) {
        ResetOreStateTracking()
        ResetOreClickCooldowns()
        Miner.ProfileLoaded := false
        return false
    }

    anchorXRaw := IniRead(ProfileFile, "Anchor", "X", "__missing__")
    anchorYRaw := IniRead(ProfileFile, "Anchor", "Y", "__missing__")

    if (anchorXRaw = "__missing__" || anchorYRaw = "__missing__") {
        ResetOreStateTracking()
        ResetOreClickCooldowns()
        Miner.ProfileLoaded := false
        return false
    }

    Miner.AnchorX := Integer(anchorXRaw)
    Miner.AnchorY := Integer(anchorYRaw)
    Miner.AnchorSet := true

    oreCount := Integer(IniRead(ProfileFile, "Miner", "OreCount", "0"))
    if (oreCount > 0) {
        loop oreCount {
            idx := A_Index
            section := "Ore" idx
            ox := ReadProfileInt(section, "OffsetX")
            oy := ReadProfileInt(section, "OffsetY")
            full := ReadProfileInt(section, "FullColor")
            empty := ReadProfileInt(section, "EmptyColor")
            if (ox = "" || oy = "" || full = "" || empty = "")
                continue
            Miner.Ores.Push({ OffsetX: ox, OffsetY: oy, FullColor: full, EmptyColor: empty })
        }
    }

    ResetOreStateTracking()
    ResetOreClickCooldowns()
    Miner.ProfileLoaded := Miner.AnchorSet && (Miner.Ores.Length > 0)
    return Miner.ProfileLoaded
}

ReadProfileInt(section, key) {
    global ProfileFile

    val := IniRead(ProfileFile, section, key, "__missing__")
    if (val = "__missing__")
        return ""
    return Integer(val)
}

SaveProfile() {
    global Miner, ProfileFile

    if FileExist(ProfileFile)
        FileDelete(ProfileFile)

    if Miner.AnchorSet {
        IniWrite(Miner.AnchorX, ProfileFile, "Anchor", "X")
        IniWrite(Miner.AnchorY, ProfileFile, "Anchor", "Y")
    }

    IniWrite(Miner.Ores.Length, ProfileFile, "Miner", "OreCount")
    for idx, ore in Miner.Ores {
        section := "Ore" idx
        IniWrite(ore.OffsetX, ProfileFile, section, "OffsetX")
        IniWrite(ore.OffsetY, ProfileFile, section, "OffsetY")
        IniWrite(ore.FullColor, ProfileFile, section, "FullColor")
        IniWrite(ore.EmptyColor, ProfileFile, section, "EmptyColor")
    }

    Miner.ProfileLoaded := Miner.AnchorSet && (Miner.Ores.Length > 0)
}

ShowTransientTip(text, timeoutMs := 1500) {
    ToolTip(text)
    SetTimer(() => ToolTip(), -timeoutMs)
}

ShowStatus() {
    global Miner

    active := (Miner.ActiveOre = 0) ? "none" : Miner.ActiveOre
    state := Miner.Training ? "training" : (Miner.Enabled ? "mining" : "idle")
    anchor := Miner.AnchorSet ? (Miner.AnchorX "," Miner.AnchorY) : "not set"

    ToolTip("Anchor: " anchor " | Ores: " Miner.Ores.Length " | Active: " active " | State: " state "`nF7 anchor | F10 add ore | F8 mine | F11 stop")
    SetTimer(() => ToolTip(), -2500)
}
