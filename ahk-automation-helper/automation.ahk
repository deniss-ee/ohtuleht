#Requires AutoHotkey v2.0
#SingleInstance Force

; ============================================================
; Config-driven automation helper for beta testers
; ------------------------------------------------------------
; All tasks are defined in tasks.ini (same folder as this script).
; Edit tasks.ini, then press F12 to reload without restarting.
;
; Global hotkeys:
;   F12 - reload tasks.ini and rebuild all tasks
;   F11 - panic stop: turn OFF every task
;   F9  - show status tooltip (which tasks are active)
;
; Per-task hotkeys (set in tasks.ini) toggle that task on/off.
; ============================================================

global Tasks := []
global ConfigFile := A_ScriptDir "\tasks.ini"

LoadConfig()

F12::LoadConfig()
F11::StopAll()
F9::ShowStatus()

LoadConfig() {
    global Tasks, ConfigFile

    ; Turn off any existing timers and hotkeys before rebuilding
    for task in Tasks {
        SetTimer(task.BoundTick, 0)
        try Hotkey(task.Hotkey, "Off")
    }
    Tasks := []

    if !FileExist(ConfigFile) {
        MsgBox("tasks.ini not found next to the script:`n" ConfigFile, "Automation Helper", "Iconx")
        return
    }

    sections := StrSplit(IniRead(ConfigFile), "`n")
    for sectionName in sections {
        sectionName := Trim(sectionName)
        if (sectionName = "")
            continue

        task := {
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
            Active: false
        }

        task.Active := task.Enabled
        task.BoundTick := TickFactory(task)

        if (task.Active)
            SetTimer(task.BoundTick, task.Interval)

        if (task.Hotkey != "") {
            boundToggle := ToggleFactory(task)
            try Hotkey(task.Hotkey, boundToggle)
        }

        Tasks.Push(task)
    }

    ShowStatus()
}

; Returns a closure that performs one tick (pixel check + click) for this task
TickFactory(task) {
    return () => RunTick(task)
}

; Returns a closure that toggles this task on/off via its hotkey
ToggleFactory(task) {
    return (*) => ToggleTask(task)
}

RunTick(task) {
    if !task.Active
        return

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
    pr := (pixel >> 16) & 0xFF, pg := (pixel >> 8) & 0xFF, pb := pixel & 0xFF
    tr := (target >> 16) & 0xFF, tg := (target >> 8) & 0xFF, tb := target & 0xFF
    return Abs(pr - tr) <= tolerance && Abs(pg - tg) <= tolerance && Abs(pb - tb) <= tolerance
}

DoClick(task) {
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
    task.Active := !task.Active
    if (task.Active)
        SetTimer(task.BoundTick, task.Interval)
    else
        SetTimer(task.BoundTick, 0)
    ShowStatus()
}

StopAll() {
    global Tasks
    for task in Tasks {
        task.Active := false
        SetTimer(task.BoundTick, 0)
    }
    ShowStatus()
    ToolTip("All tasks stopped (F11)")
    SetTimer(() => ToolTip(), -1500)
}

ShowStatus() {
    global Tasks
    lines := ""
    for task in Tasks {
        state := task.Active ? "ON " : "off"
        hk := task.Hotkey != "" ? " (" task.Hotkey ")" : ""
        lines .= state " - " task.Name hk "`n"
    }
    if (lines = "")
        lines := "No tasks loaded"
    ToolTip(lines)
    SetTimer(() => ToolTip(), -2000)
}
