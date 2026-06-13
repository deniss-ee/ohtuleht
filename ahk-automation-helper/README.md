# Beta Tester Automation Helper (AutoHotkey v2)

## Setup
1. Install [AutoHotkey v2](https://www.autohotkey.com/) (free, Windows only).
2. Keep `automation.ahk` and `tasks.ini` in the same folder.
3. Double-click `automation.ahk` to run it.

## Configuring tasks
Open `tasks.ini` in any text editor. Each `[TaskN]` section is one
independent automation. See the comments at the top of `tasks.ini`
for all available fields (timer-only clicks, pixel-color-gated clicks,
hotkeys, click types, etc.).

To find screen coordinates and colors for `X`, `Y`, `Color`, `ClickX`,
`ClickY`: right-click the AHK tray icon (green "H" icon near the clock)
and choose **Window Spy**. It shows the live mouse position and the pixel
color under the cursor.

## Runtime controls
- **F12** – reload `tasks.ini` (edit the file, save, press F12 — no restart needed)
- **F11** – panic stop (turns every task off immediately)
- **F9** – show a tooltip with each task's on/off state
- Each task's own `Hotkey` (set in `tasks.ini`) toggles just that task

## Adding more tasks
Copy a `[TaskN]` block, rename it (e.g. `[Task3]`), adjust the values,
save, and press F12.

## Notes
- `Color` values are in `0xRRGGBB` hex format.
- `Tolerance` allows small color variation (anti-aliasing, compression) — start with 5-15.
- For `Mode=TimerOnly`, the `X`/`Y`/`Color`/`Tolerance` fields are ignored.
