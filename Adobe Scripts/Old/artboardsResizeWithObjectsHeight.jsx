//@target illustrator

/**
 * Resize Artboard by Height (Scale by Height, Adjust Width)
 * 
 * Automatically resizes artboard and scales all content based on HEIGHT dimension
 * extracted from filename. Width adjusts proportionally to maintain aspect ratio.
 * 
 * Usage:
 *   1. Name your file with format: "name_WIDTHxHEIGHT.ai" (dimensions in mm)
 *      Example: "poster_210x297.ai" (A4 dimensions)
 *   2. Run this script
 *   3. Artboard will resize to match HEIGHT (297mm), content scales proportionally
 *      Width adjusts to maintain original aspect ratio
 * 
 * Features:
 *   - Extracts HEIGHT from filename (e.g., 297 from "210x297")
 *   - Scales artboard and ALL objects by height ratio
 *   - Maintains aspect ratio (no clipping or distortion)
 *   - Handles locked/hidden items
 *   - Preserves object positions proportionally
 * 
 * @version 1.0
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
    SHOW_SUCCESS_MESSAGE: false // Silent operation
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
 * Resizes artboard by HEIGHT and scales all content proportionally
 * Width sets to exact value from filename
 * 
 * @param {Document} doc - Active document
 * @param {number} targetWidthMM - Target width in millimeters (exact)
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
    
    // Scale all objects proportionally
    var scalePercent = scaleRatio * 100;
    
    for (var i = 0; i < itemCount; i++) {
        var item = items[i];
        
        // Resize the item (uniform scaling)
        // Parameters: scaleX, scaleY, changePositions, changeFillPatterns, 
        //             changeFillGradients, changeStrokePattern, changeLineWidths, scaleAbout
        item.resize(
            scalePercent,  // Scale X
            scalePercent,  // Scale Y
            true,          // Change positions
            true,          // Change fill patterns
            true,          // Change fill gradients
            true,          // Change stroke patterns
            scalePercent,  // Scale line widths
            Transformation.TOPLEFT  // Scale from top-left
        );
        
        // Adjust position proportionally
        item.position = [
            item.position[0] * scaleRatio,
            item.position[1] * scaleRatio
        ];
    }
    
    // Adjust artboard width to exact dimension from filename
    var currentRect = artboard.artboardRect;
    artboard.artboardRect = [
        currentRect[0],
        currentRect[1],
        currentRect[0] + targetWidthPt,  // Exact width from filename
        currentRect[3]                   // Keep scaled height
    ];
    
    // Center all objects on the final artboard
    if (itemCount > 0) {
        var finalRect = artboard.artboardRect;
        var artboardCenterX = (finalRect[0] + finalRect[2]) / 2;
        
        // Calculate bounding box of all objects (horizontal only)
        var minX = items[0].position[0];
        var maxX = items[0].position[0] + items[0].width;
        
        for (var i = 0; i < itemCount; i++) {
            var left = items[i].position[0];
            var right = left + items[i].width;
            
            if (left < minX) minX = left;
            if (right > maxX) maxX = right;
        }
        
        // Calculate horizontal center of all objects
        var objectsCenterX = (minX + maxX) / 2;
        
        // Calculate horizontal centering offset
        var offsetX = artboardCenterX - objectsCenterX;
        
        // Apply horizontal centering to all objects
        for (var i = 0; i < itemCount; i++) {
            items[i].position = [
                items[i].position[0] + offsetX,
                items[i].position[1]
            ];
        }
    }
    
    // Restore locked/hidden states
    if (CONFIG.INCLUDE_LOCKED_HIDDEN) {
        restoreItemsState(doc);
    }
    
    // Restore original selection
    doc.selection = originalSelection;
    
    // Show results
    if (CONFIG.SHOW_SUCCESS_MESSAGE) {
        var oldHeightMM = (dims.height / CONFIG.MM_TO_PT_RATIO).toFixed(2);
        var oldWidthMM = (dims.width / CONFIG.MM_TO_PT_RATIO).toFixed(2);
        var newHeightMM = targetHeightMM.toFixed(2);
        var newWidthMM = (newWidthPt / CONFIG.MM_TO_PT_RATIO).toFixed(2);
        
        alert(
            'Artboard resized by HEIGHT (Scale: ' + (scaleRatio * 100).toFixed(2) + '%)\n\n' +
            'Original: ' + oldWidthMM + 'mm × ' + oldHeightMM + 'mm\n' +
            'New:      ' + newWidthMM + 'mm × ' + newHeightMM + 'mm\n\n' +
            'Objects scaled: ' + itemCount + '\n' +
            'Aspect ratio: MAINTAINED'
        );
    }
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
