//@target illustrator

/**
 * Resize Artboard by Height (Scale by Height, Set Width)
 * 
 * Automatically scales all content based on HEIGHT dimension, then sets artboard
 * width to exact value from filename without scaling width.
 * 
 * Usage:
 *   1. Name your file with format: "name_WIDTHxHEIGHT.ai" (dimensions in mm)
 *      Example: "poster_210x297.ai"
 *   2. Run this script
 *   3. Content scales uniformly to match HEIGHT (297mm)
 *      Artboard width sets to exact WIDTH (210mm) without additional scaling
 * 
 * Features:
 *   - Scales ALL objects uniformly by HEIGHT ratio (maintains aspect ratio)
 *   - Sets artboard WIDTH to exact filename value (no width scaling)
 *   - Artboard dimensions match filename exactly
 *   - Handles locked/hidden items
 *   - Silent operation (no dialogs)
 * 
 * @version 2.0
 * @date 2025-12-14
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

var CONFIG = {
    MIN_DIMENSION: 1,
    MAX_DIMENSION: 10000,
    DIMENSION_REGEX: /\b(\d+(?:\.\d+)?)[xX×](\d+(?:\.\d+)?)\b/,
    MM_TO_PT_RATIO: 72 / 25.4,
    SCALING_PRECISION: 0.0001, // Minimum scale difference to apply
    INCLUDE_LOCKED_HIDDEN: true, // Process locked/hidden items
    SHOW_SUCCESS_MESSAGE: false, // Silent operation
    USE_EXACT_DIMENSIONS: true  // Match both width AND height from filename
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
 * Converts millimeters to points
 */
function mmToPt(mm) {
    return mm * CONFIG.MM_TO_PT_RATIO;
}

/**
 * Extracts width and height from filename
 * @returns {Object|null} {width: number, height: number} in mm, or null
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
 * Validates dimensions are within acceptable range
 */
function validateDimensions(width, height) {
    return (
        !isNaN(width) && !isNaN(height) &&
        width >= CONFIG.MIN_DIMENSION && width <= CONFIG.MAX_DIMENSION &&
        height >= CONFIG.MIN_DIMENSION && height <= CONFIG.MAX_DIMENSION
    );
}

/**
 * Gets current artboard dimensions
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

// ============================================================================
// MAIN RESIZE FUNCTION
// ============================================================================

/**
 * Resizes artboard by scaling content to match HEIGHT, then adjusts width
 * Objects scale uniformly by height ratio, artboard width adjusts to filename value
 * 
 * @param {Document} doc - Active document
 * @param {number} targetWidthMM - Target artboard width in millimeters (no scaling)
 * @param {number} targetHeightMM - Target height in millimeters (scales content)
 */
function resizeArtboardByHeight(doc, targetWidthMM, targetHeightMM) {
    // Switch to artboard coordinate system for accurate transformations
    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
    
    var abIdx = doc.artboards.getActiveArtboardIndex();
    var artboard = doc.artboards[abIdx];
    var dims = getArtboardDimensions(artboard);
    
    // Calculate target dimensions
    var targetWidthPt = mmToPt(targetWidthMM);
    var targetHeightPt = mmToPt(targetHeightMM);
    
    // Calculate scale ratio based on HEIGHT only (uniform scaling)
    var scaleRatio = targetHeightPt / dims.height;
    
    // Check if scaling is significant enough
    if (Math.abs(scaleRatio - 1.0) < CONFIG.SCALING_PRECISION) {
        return; // No scaling needed
    }
    
    // Calculate scaled width (after uniform scaling by height)
    var scaledWidthPt = dims.width * scaleRatio;
    var newHeightPt = targetHeightPt;
    
    // Store original selection
    var originalSelection = doc.selection;
    doc.selection = null;
    
    // Save locked/hidden states if needed
    if (CONFIG.INCLUDE_LOCKED_HIDDEN) {
        saveItemsState(doc);
    }
    
    // Select all objects on active artboard
    doc.artboards.setActiveArtboardIndex(abIdx);
    doc.selectObjectsOnActiveArtboard();
    
    var items = doc.selection;
    var itemCount = items.length;
    
    // First, resize artboard with uniform scaling by height
    artboard.artboardRect = [
        dims.left,
        dims.top,
        dims.left + scaledWidthPt,
        dims.top - newHeightPt
    ];
    
    // Scale all objects uniformly by HEIGHT ratio
    var scalePercent = scaleRatio * 100;
    
    for (var i = 0; i < itemCount; i++) {
        var item = items[i];
        
        // Resize the item uniformly
        // Parameters: scaleX, scaleY, changePositions, changeFillPatterns, 
        //             changeFillGradients, changeStrokePattern, changeLineWidths, scaleAbout
        item.resize(
            scalePercent,   // Scale X (uniform)
            scalePercent,   // Scale Y (uniform)
            true,           // Change positions
            true,           // Change fill patterns
            true,           // Change fill gradients
            true,           // Change stroke patterns
            scalePercent,   // Scale line widths
            Transformation.TOPLEFT  // Scale from top-left
        );
        
        // Adjust position proportionally (uniform scaling)
        item.position = [
            item.position[0] * scaleRatio,
            item.position[1] * scaleRatio
        ];
    }
    
    // Finally, adjust artboard width to exact target (without scaling objects)
    artboard.artboardRect = [
        dims.left,
        dims.top,
        dims.left + targetWidthPt,  // Set to exact width from filename
        dims.top - newHeightPt
    ];
    
    // Center all objects on the artboard
    if (itemCount > 0) {
        // Get updated artboard dimensions
        var finalArtboardRect = artboard.artboardRect;
        var artboardCenterX = (finalArtboardRect[0] + finalArtboardRect[2]) / 2;
        var artboardCenterY = (finalArtboardRect[1] + finalArtboardRect[3]) / 2;
        
        // Calculate bounding box of all objects
        var minX = items[0].position[0];
        var maxX = items[0].position[0] + items[0].width;
        var minY = items[0].position[1] - items[0].height;
        var maxY = items[0].position[1];
        
        for (var i = 0; i < itemCount; i++) {
            var itemLeft = items[i].position[0];
            var itemRight = itemLeft + items[i].width;
            var itemTop = items[i].position[1];
            var itemBottom = itemTop - items[i].height;
            
            if (itemLeft < minX) minX = itemLeft;
            if (itemRight > maxX) maxX = itemRight;
            if (itemBottom < minY) minY = itemBottom;
            if (itemTop > maxY) maxY = itemTop;
        }
        
        // Calculate center of all objects
        var objectsCenterX = (minX + maxX) / 2;
        var objectsCenterY = (minY + maxY) / 2;
        
        // Calculate offset to center objects
        var offsetX = artboardCenterX - objectsCenterX;
        var offsetY = artboardCenterY - objectsCenterY;
        
        // Move all objects to center
        for (var i = 0; i < itemCount; i++) {
            items[i].position = [
                items[i].position[0] + offsetX,
                items[i].position[1] + offsetY
            ];
        }
    }
    
    // Restore locked/hidden states
    if (CONFIG.INCLUDE_LOCKED_HIDDEN) {
        restoreItemsState(doc);
    }
    
    // Restore original selection
    doc.selection = originalSelection;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
    // Validate document is open
    if (app.documents.length === 0) {
        return; // Silent exit
    }
    
    var doc = app.activeDocument;
    var fileName = doc.name;
    
    // Parse dimensions from filename
    var dimensions = parseDimensionsFromFilename(fileName);
    if (!dimensions) {
        return; // Silent exit
    }
    
    // Validate dimensions
    if (!validateDimensions(dimensions.width, dimensions.height)) {
        return; // Silent exit
    }
    
    // Execute resize (no confirmation needed)
    try {
        resizeArtboardByHeight(doc, dimensions.width, dimensions.height);
    } catch (error) {
        // Silent error handling - script continues
    }
}

// Execute
main();
