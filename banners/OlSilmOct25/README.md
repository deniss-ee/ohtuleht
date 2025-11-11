# Simple Banner Animation System

Everything in one file! No external dependencies.

## ⭐ **Where to Change Settings**

**Edit `index.html`** - Look for the `BANNER_CONFIG` section at the top of the `<script>` tag:

```javascript
const BANNER_CONFIG = {
  videoTime: 3500,    // ← Change this to control video display time
  fadeIn: 600,        // ← Change this to control fade speed  
  pulseCount: 3,      // ← Change this to control button pulses
  rotation: 0,        // ← Change this to rotate the video
  scale: 0.8,         // ← Change this to resize the video
  // ... and more!
};
```

## Configuration Options

| Setting | Description | Example Values |
|---------|-------------|----------------|
| `videoTime` | How long video plays before content appears | `3500` (3.5 seconds) |
| `fadeIn` | How fast content fades in | `600` (smooth) |
| `fadeOut` | How fast content fades out | `400` (quick) |
| `contentTime` | How long content stays visible | `4000` (4 seconds) |
| `pulseDelay` | Delay before button starts pulsing | `800` (0.8 seconds) |
| `pulseCount` | Number of button pulses | `3` |
| `pulseDuration` | Length of each pulse | `600` |
| `pulsePause` | Pause between pulses | `700` |
| `rotation` | Video rotation in degrees | `0`, `90`, `180`, `-45` |
| `scale` | Video size multiplier | `0.8` (smaller), `1.0` (normal), `1.2` (bigger) |

## File Structure

```
├── index.html          # ⭐ EDIT THIS FILE ⭐ (everything is here!)
├── style.css          # Banner styles (don't edit)  
└── README.md          # This file
```

## Quick Examples

**Make animation faster:**
```javascript
videoTime: 2000,      // Shorter video time
fadeIn: 300,          // Faster fade
contentTime: 3000,    // Less content time
```

**More dramatic pulses:**
```javascript
pulseCount: 5,        // More pulses
pulseDuration: 800,   // Longer pulses
```

**Rotate and resize video:**
```javascript
rotation: 90,         // Rotate 90 degrees
scale: 1.2,          // Make 20% bigger
```

## Testing Controls

Open browser console and try:
```javascript
bannerControls.stop();     // Stop animation
bannerControls.restart();  // Restart animation
```

## That's It! 

Just edit the `BANNER_CONFIG` section in `index.html` and refresh the page!