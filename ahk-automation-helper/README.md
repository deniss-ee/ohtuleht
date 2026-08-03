# Beta Tester Automation Helper (AutoHotkey v2)

For mining, use `relative_miner.ahk`.
Use `automation.ahk` only if you also want optional custom task automation.

## Setup
1. Install [AutoHotkey v2](https://www.autohotkey.com/) (free, Windows only).
2. Keep scripts in the same folder as their profile files.
3. Double-click `relative_miner.ahk` to run the standalone miner.

## Zero-manual quick start (recommended)
You can run relative miner automation without editing any config files:
1. Press **F7** to set an anchor point.
2. Press **F10** and add one ore (FULL then EMPTY).
3. Press **F10** again any time to add another ore.
4. Press **F8** to start/stop mining.
5. Press **F11** for panic stop.

`relative_miner_profile.ini` is generated automatically from training.

## Relative miner controls
- **F7** - set or replace anchor
- **F10** - add one ore (two clicks: FULL, then EMPTY)
- **F8** - start/stop mining
- **F11** - panic stop

## Optional advanced tasks
You can ignore this section if you only want the miner.

Open `tasks.ini` in any text editor only if you want extra generic click tasks.
Each section is one independent automation. See the comments at the top of
`tasks.ini` for the available fields (timer-only clicks, pixel-gated clicks,
hotkeys, click types, etc.).

To find screen coordinates and colors for `X`, `Y`, `Color`, `ClickX`,
`ClickY`: right-click the AHK tray icon (green "H" icon near the clock)
and choose **Window Spy**. It shows the live mouse position and the pixel
color under the cursor.

## Runtime controls
- `automation.ahk` uses its own legacy controls and optional task engine.
- `relative_miner.ahk` uses the simpler miner-only hotkeys listed above.

## Auto miner workflow (relative multi-ore)
The miner stores anchor-relative ore data in `relative_miner_profile.ini` and
does not require manual editing. You can keep adding ores over time.

For each ore you add:
1. Press **F10**.
2. Left-click the ore when it is **FULL**.
3. Left-click again when the same ore is **EMPTY**.
4. Ore is saved immediately.
5. Repeat **F10** to add more ores, or press **F8** to start mining.

Runtime behavior:
- The miner watches the currently active ore.
- When that ore changes state (from full to not-full), the miner releases it.
- It then picks any ore that is currently FULL.
- If no ore is FULL, it waits.
- Press **F8** to stop miner mode.
- Press **F11** for panic stop (tasks + miner).

If colors stop matching after game/UI changes, run **F10** again to retrain and overwrite
the saved profile.

## Optional task config format
If you want extra non-miner automations, keep them in `tasks.ini`.
That file is optional and unrelated to ore training.

## Notes
- `Color` values are in `0xRRGGBB` hex format.
- `Tolerance` allows small color variation (anti-aliasing, compression) — start with 5-15.
- For `Mode=TimerOnly`, the `X`/`Y`/`Color`/`Tolerance` fields are ignored.
