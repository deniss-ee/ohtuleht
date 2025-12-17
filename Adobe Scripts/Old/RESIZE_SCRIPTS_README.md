# Artboard Resize Scripts - Documentation

## Overview

Two intelligent Adobe Illustrator scripts that automatically resize artboards and scale content based on dimensions extracted from filenames, while maintaining aspect ratios to **prevent clipping**.

---

## 📁 Files

1. **ResizeByHeight.jsx** - Scales by height, adjusts width proportionally
2. **ResizeByWidth.jsx** - Scales by width, adjusts height proportionally

---

## 🎯 Key Difference from ResizeArtboard2.jsx

### **ResizeArtboard2.jsx Issues:**
- ❌ Resizes artboard to EXACT dimensions from filename
- ❌ Does NOT scale objects
- ❌ **Results in clipping** when artboard shrinks smaller than content
- ❌ Objects can extend beyond artboard boundaries
- ✅ Only creates reference rectangle

### **New Scripts Approach (Inspired by artboardsResizeWithObjects.jsx):**
- ✅ Scales artboard AND all objects proportionally
- ✅ Maintains aspect ratio (no distortion)
- ✅ **Prevents clipping** by scaling content with artboard
- ✅ Handles locked/hidden items
- ✅ Preserves relative positions and sizes
- ✅ Uses proper coordinate system transformation

---

## 🚀 Usage

### Filename Format
```
name_WIDTHxHEIGHT.ai
```

**Examples:**
- `poster_210x297.ai` (A4 dimensions)
- `banner_1200x300.ai` (web banner)
- `business-card_85X55.ai` (standard business card)

### Which Script to Use?

#### Use **ResizeByHeight.jsx** when:
- Height is the critical dimension (e.g., posters, social media posts)
- Example: Social media post must be exactly 1080px tall
- Width can flex to accommodate content

#### Use **ResizeByWidth.jsx** when:
- Width is the critical dimension (e.g., web banners, letterheads)
- Example: Website banner must be exactly 1200px wide
- Height can flex to accommodate content

---

## 🔧 How It Works

### ResizeByHeight.jsx

```
Input: "poster_210x297.ai"
Current artboard: 400mm × 500mm

Process:
1. Extract HEIGHT from filename: 297mm
2. Calculate scale ratio: 297 ÷ 500 = 0.594 (59.4%)
3. Scale artboard: 400mm × 0.594 = 237.6mm wide, 297mm tall
4. Scale all objects by 59.4%
5. Adjust object positions by 59.4%

Result: 237.6mm × 297mm artboard (aspect ratio maintained)
```

### ResizeByWidth.jsx

```
Input: "banner_1200x300.ai"
Current artboard: 800mm × 400mm

Process:
1. Extract WIDTH from filename: 1200mm
2. Calculate scale ratio: 1200 ÷ 800 = 1.5 (150%)
3. Scale artboard: 1200mm wide × 400mm × 1.5 = 600mm tall
4. Scale all objects by 150%
5. Adjust object positions by 150%

Result: 1200mm × 600mm artboard (aspect ratio maintained)
```

---

## 🎨 Features

### Comprehensive Scaling
```jsx
// What gets scaled:
✓ Object dimensions (width/height)
✓ Object positions (x/y coordinates)
✓ Fill patterns
✓ Fill gradients
✓ Stroke patterns
✓ Line widths
✓ Text frames
✓ Groups
✓ Compound paths
```

### Locked/Hidden Items Handling
```jsx
// Automatically processes:
✓ Locked objects (temporarily unlocks → scales → re-locks)
✓ Hidden objects (temporarily shows → scales → re-hides)
✓ Preserves original visibility/lock states
```

### Coordinate System
```jsx
// Uses ARTBOARDCOORDINATESYSTEM for accurate transformations
app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
```

---

## 📊 Comparison Table

| Feature | ResizeArtboard2.jsx | ResizeByHeight.jsx | ResizeByWidth.jsx |
|---------|--------------------|--------------------|-------------------|
| **Scales Objects** | ❌ No | ✅ Yes | ✅ Yes |
| **Prevents Clipping** | ❌ No | ✅ Yes | ✅ Yes |
| **Maintains Aspect Ratio** | ❌ No | ✅ Yes | ✅ Yes |
| **Handles Locked Items** | ❌ No | ✅ Yes | ✅ Yes |
| **Handles Hidden Items** | ❌ No | ✅ Yes | ✅ Yes |
| **Scales Patterns** | ❌ N/A | ✅ Yes | ✅ Yes |
| **Scales Strokes** | ❌ N/A | ✅ Yes | ✅ Yes |
| **User Confirmation** | ❌ No | ✅ Yes | ✅ Yes |
| **Error Handling** | ⚠️ Silent | ✅ Comprehensive | ✅ Comprehensive |
| **Creates Reference Rect** | ✅ Yes | ❌ No | ❌ No |

---

## ⚙️ Configuration

Both scripts include configurable settings at the top:

```jsx
var CONFIG = {
    MIN_DIMENSION: 1,              // Minimum dimension in mm
    MAX_DIMENSION: 10000,          // Maximum dimension in mm
    DIMENSION_REGEX: /\b(\d+(?:\.\d+)?)[xX×](\d+(?:\.\d+)?)\b/,
    MM_TO_PT_RATIO: 72 / 25.4,    // Conversion ratio
    SCALING_PRECISION: 0.0001,     // Minimum scale to apply
    INCLUDE_LOCKED_HIDDEN: true,   // Process locked/hidden items
    SHOW_SUCCESS_MESSAGE: true     // Show completion dialog
};
```

### Customization Examples

**Disable success message:**
```jsx
SHOW_SUCCESS_MESSAGE: false
```

**Don't process locked items:**
```jsx
INCLUDE_LOCKED_HIDDEN: false
```

**Change dimension limits:**
```jsx
MIN_DIMENSION: 10,    // At least 10mm
MAX_DIMENSION: 5000   // Max 5 meters
```

---

## 🔍 Technical Details

### Transformation Method

Inspired by **artboardsResizeWithObjects.jsx**, these scripts use proper transformation techniques:

```jsx
// 1. Set coordinate system
app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

// 2. Resize artboard (top-left anchor)
artboard.artboardRect = [left, top, left + newWidth, top - newHeight];

// 3. Scale each object
item.resize(
    scalePercent,           // Scale X
    scalePercent,           // Scale Y
    true,                   // Change positions
    true,                   // Change fill patterns
    true,                   // Change fill gradients
    true,                   // Change stroke patterns
    scalePercent,           // Scale line widths
    Transformation.TOPLEFT  // Anchor point
);

// 4. Adjust position
item.position = [item.position[0] * ratio, item.position[1] * ratio];
```

### Why This Prevents Clipping

**Problem with ResizeArtboard2.jsx:**
```
Original: 600mm × 800mm artboard with 500mm × 700mm object
Filename: "card_85x55.ai"

Result: 85mm × 55mm artboard, but object remains 500mm × 700mm
        → Object extends 415mm beyond artboard edges! 🚫
```

**Solution in New Scripts:**
```
Original: 600mm × 800mm artboard with 500mm × 700mm object
Filename: "card_85x55.ai" (using ResizeByHeight)

Scale ratio: 55 ÷ 800 = 0.06875 (6.875%)
Result: 41.25mm × 55mm artboard
        Object scales to: 34.375mm × 48.125mm
        → Object fits perfectly within artboard! ✅
```

---

## 🎯 Use Case Examples

### Example 1: Social Media Graphics

**Scenario:** Designing Instagram post, need 1080px height

```
File: "instagram_1080x1080.ai"
Current: 2000px × 2000px artboard

Run: ResizeByHeight.jsx
Result: 1080px × 1080px (scaled 54%)
All graphics scaled proportionally
```

### Example 2: Print Materials

**Scenario:** Creating A4 poster from US Letter design

```
File: "poster_210x297.ai" (A4 in mm)
Current: 612pt × 792pt (US Letter)

Run: ResizeByHeight.jsx
Result: ~211pt × 297mm (A4 height matched)
Width adjusts for aspect ratio
```

### Example 3: Web Banners

**Scenario:** Need exact 1200px width banner

```
File: "banner_1200x300.ai"
Current: 800px × 400px design

Run: ResizeByWidth.jsx
Result: 1200px × 600px (scaled 150%)
Height adjusts, banner fits perfectly
```

---

## ⚠️ Important Notes

### Aspect Ratio Preservation

**Key Concept:** These scripts DO NOT force exact dimensions for both width and height.

```
❌ WRONG EXPECTATION:
"If my file is banner_1200x300.ai, I'll get exactly 1200×300"

✅ CORRECT BEHAVIOR:
ResizeByWidth: Target 1200mm width, height adjusts proportionally
ResizeByHeight: Target 300mm height, width adjusts proportionally
```

### When to Use Each Script

| Situation | Script | Reason |
|-----------|--------|--------|
| Must fit in fixed height | ResizeByHeight | Height constraint critical |
| Must fit in fixed width | ResizeByWidth | Width constraint critical |
| Need exact both dimensions | ⚠️ Manual resize | Use Transform panel instead |
| Scaling prototype | Either | Choose dominant dimension |
| Print with height standard | ResizeByHeight | A4, Letter heights fixed |
| Web with width standard | ResizeByWidth | Browser widths fixed |

---

## 🐛 Error Handling

Both scripts include comprehensive validation:

### 1. No Document Open
```
Alert: "No document is open. Please open an Illustrator document..."
```

### 2. Invalid Filename
```
Alert: "Could not find dimensions in filename..."
Shows: Expected format and examples
```

### 3. Invalid Dimensions
```
Alert: "Invalid dimensions: 50000mm × 60000mm
Dimensions must be between 1mm and 10000mm"
```

### 4. No Scaling Needed
```
Alert: "Artboard width already matches target dimension.
No scaling needed."
```

### 5. Runtime Errors
```
Alert: "Error during resize: [error details]"
```

---

## 🔧 Troubleshooting

### Issue: "Dimensions must be between 1mm and 10000mm"
**Solution:** Check filename has reasonable dimensions
```jsx
// Adjust limits in CONFIG if needed:
MAX_DIMENSION: 20000  // Allow up to 20 meters
```

### Issue: Objects not scaling
**Solution:** Ensure objects are on active artboard
```jsx
// Script only scales objects on ACTIVE artboard
// Switch to correct artboard before running
```

### Issue: Locked items not processing
**Solution:** Enable locked item processing
```jsx
INCLUDE_LOCKED_HIDDEN: true  // Set in CONFIG
```

### Issue: Scale too extreme (objects too small/large)
**Solution:** Check current artboard size vs. target
```jsx
// Example problem:
// Current: 10mm × 10mm → Target: 1000mm
// Scale: 100× (too extreme!)

// Fix: Start with closer dimensions
```

---

## 💡 Alternative Approaches

### Approach 1: Exact Dimensions (No Aspect Ratio)

If you need EXACT dimensions from filename (may distort):

```jsx
// Modify resizeArtboard function:
var targetWidthPt = mmToPt(widthMM);   // Use both
var targetHeightPt = mmToPt(heightMM); // dimensions

var scaleX = targetWidthPt / dims.width;
var scaleY = targetHeightPt / dims.height;

// Use different X/Y scales (non-uniform)
item.resize(scaleX * 100, scaleY * 100, ...);
```

### Approach 2: Center-Anchored Scaling

If you want to scale from center instead of top-left:

```jsx
// Change transformation anchor:
Transformation.TOPLEFT     // Current (top-left)
→ Transformation.CENTER    // Alternative (center)
```

### Approach 3: Interactive Mode

If you want user to choose dimension:

```jsx
var choice = confirm("Scale by WIDTH? (Cancel = scale by HEIGHT)");
if (choice) {
    resizeArtboardByWidth(doc, dimensions.width);
} else {
    resizeArtboardByHeight(doc, dimensions.height);
}
```

---

## 📝 Summary

### Key Improvements Over ResizeArtboard2.jsx

1. **No Clipping:** Objects scale with artboard
2. **Aspect Ratio:** Maintains proportions (no distortion)
3. **Comprehensive:** Handles all object types and states
4. **Predictable:** Clear scaling behavior
5. **Professional:** Proper error handling and user feedback

### When to Use What

- **ResizeArtboard2.jsx:** Quick artboard dimension change, don't care about objects
- **ResizeByHeight.jsx:** Height is critical constraint, width can adjust
- **ResizeByWidth.jsx:** Width is critical constraint, height can adjust
- **artboardsResizeWithObjects.jsx:** Need UI dialog with custom scale factors

---

## 📄 License

Based on concepts from:
- **artboardsResizeWithObjects.jsx** by Alexander Ladygin & Sergey Osokin
- **ResizeArtboard2.jsx** (original reference)

Created: 2025-12-14

---

## 🔗 Quick Reference

```
Filename Format:  name_WIDTHxHEIGHT.ai
Units:            Millimeters (mm)
Scaling:          Proportional (maintains aspect ratio)
Anchor:           Top-left
Objects Scaled:   All on active artboard
Locked/Hidden:    Processed by default
```
