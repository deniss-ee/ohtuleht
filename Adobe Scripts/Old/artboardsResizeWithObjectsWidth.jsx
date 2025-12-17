//@target illustrator

/**
 * Artboard Resize by Width - Refactored
 * 
 * Scales content uniformly based on WIDTH, then sets artboard height to exact value.
 * Objects are centered on the artboard after transformation.
 *
 * Workflow:
 *   1. Parse dimensions from filename (format: "name_WIDTHxHEIGHT.ai")
 *   2. Scale all objects uniformly by width ratio
 *   3. Set artboard to exact dimensions from filename
 *   4. Center all objects on artboard
 *
 * Example:
 *   File: "banner_1200x300.ai"
 *   Current: 800mm × 400mm
 *   Result: Objects scaled by 150%, artboard = 1200mm × 300mm, centered
 *
 * @version 3.0
 * @date 2025-12-14
 * @author Refactored for improved structure and performance
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

var CONFIG = {
    // Dimension constraints
    MIN_DIMENSION: 1,
    MAX_DIMENSION: 10000,
    
    // Parsing
    DIMENSION_REGEX: /\b(\d+(?:\.\d+)?)[xX×](\d+(?:\.\d+)?)\b/,
    
    // Conversion constants
    MM_TO_PT_RATIO: 72 / 25.4,
    SCALING_PRECISION: 0.0001,
    
    // Behavior flags
    INCLUDE_LOCKED_HIDDEN: true,
    CENTER_OBJECTS: true,
    SILENT_MODE: true
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

var lockedItems = [];
var hiddenItems = [];

/**
 * Stores and unlocks/shows locked or hidden items for processing
 */
function saveItemsState(doc) {
    lockedItems = [];
    hiddenItems = [];
    
    for (var i = 0; i < doc.pageItems.length; i++) {
        var item = doc.pageItems[i];
        if (item.locked) {
            lockedItems.push(i);
            item.locked = false;
        }
        if (item.hidden) {
            hiddenItems.push(i);
            item.hidden = false;
        }
    }
}

/**
 * Restores original locked/hidden state
 */
function restoreItemsState(doc) {
    for (var i = 0; i < lockedItems.length; i++) {
        doc.pageItems[lockedItems[i]].locked = true;
    }
    for (var i = 0; i < hiddenItems.length; i++) {
        doc.pageItems[hiddenItems[i]].hidden = true;
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts millimeters to points (Illustrator's coordinate system)
 * @param {number} mm - Value in millimeters
 * @returns {number} Value in points
 */
function mmToPt(mm) {
    return mm * CONFIG.MM_TO_PT_RATIO;
}

/**
 * Extracts dimensions from filename using regex pattern
 * @param {string} fileName - Document filename
 * @returns {Object|null} {width, height} in mm, or null if no match
 */
function parseDimensionsFromFilename(fileName) {
    var match = fileName.match(CONFIG.DIMENSION_REGEX);
    if (!match) return null;
    
    return {
        width: parseFloat(match[1]),
        height: parseFloat(match[2])
    };
}

/**
 * Validates that dimensions are within acceptable range
 * @param {number} width - Width in millimeters
 * @param {number} height - Height in millimeters
 * @returns {boolean} True if dimensions are valid
 */
function validateDimensions(width, height) {
    return (
        !isNaN(width) && !isNaN(height) &&
        width >= CONFIG.MIN_DIMENSION && width <= CONFIG.MAX_DIMENSION &&
        height >= CONFIG.MIN_DIMENSION && height <= CONFIG.MAX_DIMENSION
    );
}

/**
 * Extracts artboard dimensions and position
 * @param {Artboard} artboard - Target artboard
 * @returns {Object} Artboard geometry data
 */
function getArtboardDimensions(artboard) {
    var rect = artboard.artboardRect;
    return {
        left: rect[0],
        top: rect[1],
        right: rect[2],
        bottom: rect[3],
        width: rect[2] - rect[0],
        height: rect[1] - rect[3]
    };
}

/**
 * Calculates bounding box encompassing all objects
 * @param {Array} items - Array of page items
 * @returns {Object} Bounding box with minX, maxX, minY, maxY
 */
function calculateBoundingBox(items) {
    if (items.length === 0) return null;
    
    var bounds = {
        minX: items[0].position[0],
        maxX: items[0].position[0] + items[0].width,
        minY: items[0].position[1] - items[0].height,
        maxY: items[0].position[1]
    };
    
    for (var i = 1; i < items.length; i++) {
        var left = items[i].position[0];
        var right = left + items[i].width;
        var top = items[i].position[1];
        var bottom = top - items[i].height;
        
        if (left < bounds.minX) bounds.minX = left;
        if (right > bounds.maxX) bounds.maxX = right;
        if (bottom < bounds.minY) bounds.minY = bottom;
        if (top > bounds.maxY) bounds.maxY = top;
    }
    
    return bounds;
}

/**
 * Centers objects on artboard by calculating and applying offset
 * @param {Array} items - Array of page items to center
 * @param {Artboard} artboard - Target artboard
 */
function centerObjectsOnArtboard(items, artboard) {
    if (items.length === 0) return;
    
    var artboardRect = artboard.artboardRect;
    var artboardCenterX = (artboardRect[0] + artboardRect[2]) / 2;
    var artboardCenterY = (artboardRect[1] + artboardRect[3]) / 2;
    
    var bounds = calculateBoundingBox(items);
    var objectsCenterX = (bounds.minX + bounds.maxX) / 2;
    var objectsCenterY = (bounds.minY + bounds.maxY) / 2;
    
    var offsetX = artboardCenterX - objectsCenterX;
    var offsetY = artboardCenterY - objectsCenterY;
    
    for (var i = 0; i < items.length; i++) {
        items[i].position = [
            items[i].position[0] + offsetX,
            items[i].position[1] + offsetY
        ];
    }
}

// ============================================================================
// MAIN RESIZE FUNCTION
// ============================================================================

/**
 * Scales objects uniformly by width, then sets exact artboard dimensions
 * 
 * Process:
 *   1. Calculate scale ratio from width
 *   2. Scale all objects uniformly
 *   3. Set artboard to exact dimensions from filename
 *   4. Center objects on artboard
 *
 * @param {Document} doc - Active document
 * @param {number} targetWidthMM - Target width for scaling (mm)
 * @param {number} targetHeightMM - Exact artboard height (mm)
 */
function resizeArtboardByWidth(doc, targetWidthMM, targetHeightMM) {
    // Set coordinate system for accurate transformations
    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
    
    var abIdx = doc.artboards.getActiveArtboardIndex();
    var artboard = doc.artboards[abIdx];
    var dims = getArtboardDimensions(artboard);
    
    // Convert target dimensions to points
    var targetWidthPt = mmToPt(targetWidthMM);
    var targetHeightPt = mmToPt(targetHeightMM);
    
    // Calculate uniform scale ratio based on WIDTH
    var scaleRatio = targetWidthPt / dims.width;
    
    // Skip if no significant scaling needed
    if (Math.abs(scaleRatio - 1.0) < CONFIG.SCALING_PRECISION) {
        return;
    }
    
    // Store original selection
    var originalSelection = doc.selection;
    doc.selection = null;
    
    // Handle locked/hidden items
    if (CONFIG.INCLUDE_LOCKED_HIDDEN) {
        saveItemsState(doc);
    }
    
    // Select all objects on active artboard
    doc.artboards.setActiveArtboardIndex(abIdx);
    doc.selectObjectsOnActiveArtboard();
    var items = doc.selection;
    
    // Scale objects uniformly by width ratio
    if (items.length > 0) {
        scaleObjects(items, scaleRatio);
    }
    
    // Set artboard to exact dimensions
    artboard.artboardRect = [
        dims.left,
        dims.top,
        dims.left + targetWidthPt,
        dims.top - targetHeightPt
    ];
    
    // Center objects on artboard
    if (CONFIG.CENTER_OBJECTS && items.length > 0) {
        centerObjectsOnArtboard(items, artboard);
    }
    
    // Restore locked/hidden states
    if (CONFIG.INCLUDE_LOCKED_HIDDEN) {
        restoreItemsState(doc);
    }
    
    // Restore original selection
    doc.selection = originalSelection;
}

/**
 * Scales multiple objects uniformly from top-left anchor
 * @param {Array} items - Array of page items
 * @param {number} ratio - Scale ratio (e.g., 1.5 = 150%)
 */
function scaleObjects(items, ratio) {
    var scalePercent = ratio * 100;
    
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        
        // Apply uniform scaling
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
        
        // Adjust position proportionally
        item.position = [
            item.position[0] * ratio,
            item.position[1] * ratio
        ];
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main execution function with validation pipeline
 */
function main() {
    // Validation: Document exists
    if (app.documents.length === 0) {
        if (!CONFIG.SILENT_MODE) alert('No document is open.');
        return;
    }
    
    var doc = app.activeDocument;
    var fileName = doc.name;
    
    // Validation: Parse dimensions from filename
    var dimensions = parseDimensionsFromFilename(fileName);
    if (!dimensions) {
        if (!CONFIG.SILENT_MODE) {
            alert('Could not parse dimensions from filename.\nExpected format: name_WIDTHxHEIGHT.ai');
        }
        return;
    }
    
    // Validation: Dimensions within acceptable range
    if (!validateDimensions(dimensions.width, dimensions.height)) {
        if (!CONFIG.SILENT_MODE) {
            alert('Invalid dimensions: ' + dimensions.width + 'mm × ' + dimensions.height + 'mm\n' +
                  'Must be between ' + CONFIG.MIN_DIMENSION + 'mm and ' + CONFIG.MAX_DIMENSION + 'mm');
        }
        return;
    }
    
    // Execute resize operation
    try {
        resizeArtboardByWidth(doc, dimensions.width, dimensions.height);
    } catch (error) {
        if (!CONFIG.SILENT_MODE) {
            alert('Error during resize: ' + error.message);
        }
    }
}

// Execute main function
main();
