# Adobe Illustrator Scripts - AI Agent Instructions

## Project Architecture

This is a collection of Adobe Illustrator ExtendScript (.jsx) automation scripts. The codebase follows a **two-tier structure**:

1. **Production Scripts** (root): Active, refactored scripts for artboard resizing with object scaling
2. **JavaScript/** (examples): Adobe's reference library organized by feature category (MultiArtboards, Swatches, Text, etc.)
3. **Old/** (archive): Deprecated scripts and documentation

## Critical Knowledge

### Filename-Based Dimension Pattern
**All resize scripts** parse dimensions from document filename using this pattern:
```javascript
// Format: "name_WIDTHxHEIGHT.ai" (dimensions in millimeters)
// Example: "poster_210x297.ai" extracts width=210, height=297
DIMENSION_REGEX: /\b(\d+(?:\.\d+)?)[xX×](\d+(?:\.\d+)?)\b/
```

### Two Scaling Philosophies

**artboardsResizeWithObjectsHeight.jsx**:
- Scales objects **uniformly by HEIGHT** ratio
- Sets artboard WIDTH to exact filename value (no additional scaling)
- Use when: Height is critical dimension (posters, social media)

**artboardsResizeWithObjectsWidth.jsx**:
- Scales objects **uniformly by WIDTH** ratio  
- Sets artboard HEIGHT to exact filename value (no additional scaling)
- Use when: Width is critical dimension (banners, letterheads)

Both prevent clipping by scaling content proportionally, then center objects on artboard.

## Code Conventions

### Configuration Pattern
Every script starts with a CONFIG object:
```javascript
var CONFIG = {
    MIN_DIMENSION: 1,
    MAX_DIMENSION: 10000,
    DIMENSION_REGEX: /\b(\d+(?:\.\d+)?)[xX×](\d+(?:\.\d+)?)\b/,
    MM_TO_PT_RATIO: 72 / 25.4,  // Illustrator uses points
    INCLUDE_LOCKED_HIDDEN: true,
    CENTER_OBJECTS: true,
    SILENT_MODE: true  // No alert() dialogs
};
```

### State Management for Locked/Hidden Items
**Always** save and restore object states:
```javascript
saveItemsState(doc);      // Unlocks/shows items
// ... perform operations ...
restoreItemsState(doc);   // Restores original states
```
Uses module-level arrays: `lockedItems[]`, `hiddenItems[]`

### Coordinate System
**CRITICAL**: Set before any transformations:
```javascript
app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
```
Without this, scaling calculations will be incorrect.

### Scaling Operations
Uniform scaling requires **THREE steps**:
```javascript
1. item.resize(scalePercent, scalePercent, true, true, true, true, scalePercent, Transformation.TOPLEFT)
2. item.position = [item.position[0] * ratio, item.position[1] * ratio]
3. // Then optionally center on artboard
```

### Centering Algorithm
```javascript
1. Calculate artboard center: (left+right)/2, (top+bottom)/2
2. Calculate bounding box of all objects
3. Calculate objects center from bounds
4. Apply offset: artboardCenter - objectsCenter
```

## Function Naming Conventions

- `mmToPt()` - Unit conversion (always millimeters → points)
- `parseDimensionsFromFilename()` - Returns `{width, height}` or `null`
- `validateDimensions()` - Range checking (1mm - 10000mm)
- `getArtboardDimensions()` - Returns `{left, top, right, bottom, width, height}`
- `calculateBoundingBox()` - Returns `{minX, maxX, minY, maxY}` for item array
- `scaleObjects()` - Uniform scaling with position adjustment
- `centerObjectsOnArtboard()` - Centers items on artboard after resize
- `resizeArtboardByHeight()` / `resizeArtboardByWidth()` - Main orchestration

## Common Pitfalls

1. **Function naming mismatch**: `resizeArtboardByWidth()` in HEIGHT script is historical - it actually scales by height. Check the **scale ratio calculation** to determine behavior:
   ```javascript
   var scaleRatio = targetHeightPt / dims.height;  // Scales by HEIGHT
   var scaleRatio = targetWidthPt / dims.width;    // Scales by WIDTH
   ```

2. **Silent failures**: Scripts use `SILENT_MODE: true` - validation failures return without alerts. Check console for debugging.

3. **Artboard rect array**: `[left, top, right, bottom]` not `[x, y, width, height]`

4. **Y-axis inversion**: Illustrator Y-axis points DOWN. `top` > `bottom` in coordinates.

## Refactoring Principles

When creating new scripts from existing ones:
- Extract repeated logic into separate functions (e.g., `calculateBoundingBox()`)
- Keep functions < 30 lines for readability
- Use JSDoc comments with `@param` and `@returns`
- Group related functions under section headers with `// ===...===`
- Preserve the CONFIG → State → Utilities → Main → Execution structure

## JavaScript/Examples Library

The `JavaScript/` folder contains Adobe's reference scripts. These demonstrate API patterns but:
- Use older conventions (mixed naming, inline validation)
- Often create documents rather than operating on active document
- May show UI dialogs (not silent mode)
- Are examples, not production tools

**DO NOT modify these** - they serve as API reference. Create new scripts in root instead.

## Testing Workflow

No automated tests exist. Manual testing checklist:
1. Create test file with dimension in name (e.g., `test_100x200.ai`)
2. Add various objects (locked, hidden, grouped, text, paths)
3. Run script
4. Verify: Artboard matches filename dimensions exactly
5. Verify: All objects scaled uniformly (no distortion)
6. Verify: Objects centered on artboard
7. Verify: Locked/hidden states preserved

## Key Files Reference

- `artboardsResizeWithObjectsHeight.jsx` - Production height scaler (active development)
- `artboardsResizeWithObjectsWidth.jsx` - Production width scaler (active development)
- `Old/REFACTORING_DOCUMENTATION.md` - Explains refactoring from monolithic to modular design
- `Old/RESIZE_SCRIPTS_README.md` - User-facing documentation for resize scripts
