# Story Split Builder (Basic Prototype)

A 1080x1920 (9:16) composition tool divided into two 1080x960 halves (top + bottom) with an editable highlighted text block centered over the seam.

## ✨ Core Features

- Two independent image slots (top & bottom), drag-and-drop or click to upload
- Cover fit with constrained panning via drag
- Centered multiline text with:
  - Adjustable font size, weight, line height
  - Highlight rectangle (color, opacity, padding)
  - Max width (% of canvas)
  - Vertical offset for fine positioning
- Fira Sans Condensed (Google Fonts)
- Semi-transparent highlight (default 50% white) for readability
- Responsive UI (control panel below on mobile)
- Export to PNG at exact 1080x1920
- Accessible-ish layering with distinct drop zones

## 🧱 Architecture Overview

Inspired by your existing modular approach in the Image Resizer tool:

| Module | Responsibility |
|--------|----------------|
| State | Central app state (images, text, interaction) |
| Loader | File and drag-and-drop ingestion |
| RegionMath | Cover scaling + offset constraint calculations |
| TextManager | Line wrapping + measurement |
| Renderer | Canvas composition (two halves + highlight + text) |
| DragController | Pointer events for panning each half |
| Exporter | PNG download |
| UI | DOM binding and state updates |

## 🖼 Image Positioning

- Each half computes a “cover” scale: `scale = max(halfWidth / imgW, halfHeight / imgH)`
- Offset constraints derived from extended draw size
- Dragging updates offsets and re-renders

## 📝 Text Rendering

1. User text is split into words
2. Greedy wrapping against max width
3. Metrics used to calculate highlight rectangle
4. Highlight = padded rect with configurable color + opacity
5. Text drawn over highlight, centered horizontally

## 🔧 Extensibility Ideas

- Per-region blur / overlay filters
- Optional per-region independent zoom (wheel to scale)
- Template save/load (localStorage)
- Brand palettes and presets
- Multi-text blocks (stack / draggable)
- Undo / redo (state snapshots)

## 📱 Mobile Considerations

- File inputs (no forced camera capture)
- Drag works with touch (pointer events bound to wrapper)
- Scales preview smaller while keeping internal resolution intact

## 🚀 Usage

1. Open `index.html` in a browser
2. Click or drop an image onto the top half
3. Repeat for bottom half
4. Add / edit centered text
5. Adjust typography + highlight settings
6. Drag images inside their halves to reposition
7. Download PNG

## 🧪 Testing Checklist

| Item | Check |
|------|-------|
| Different aspect ratios (very tall, very wide) | ✅ |
| Long text wrapping | ✅ |
| Highlight opacity extremes (0–100%) | ✅ |
| Mobile drag (touch) | ✅ |
| Export with only one half populated | ✅ (empty half renders black) |

## ⚠️ Notes

- Currently no zoom control; images always cover-fit
- Off-canvas drag friction not implemented (hard constraints)
- No memory revocation for object URLs (OK for simple usage; can be added)

---

Feel free to expand this baseline into a full internal production tool.