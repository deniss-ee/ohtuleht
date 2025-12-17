//@target illustrator
/*
    1. Selects all visible, unlocked objects on the active artboard.
    2. Creates a rectangle matching the current artboard size.
    3. Parses filename for WIDTHxHEIGHT in mm and resizes the artboard (center anchor).
    (No alert windows)
*/

function mmToPt(mm) {
    return mm * 2.8346456693;
}

if (app.documents.length) {
    var doc = app.activeDocument;
    var abIdx = doc.artboards.getActiveArtboardIndex();
    var ab = doc.artboards[abIdx];
    var abRect = ab.artboardRect; // [left, top, right, bottom]
    var left = abRect[0];
    var top = abRect[1];
    var right = abRect[2];
    var bottom = abRect[3];
    var width = right - left;
    var height = top - bottom;

    // Step 1: Select all visible/unlocked objects on the active artboard
    doc.artboards.setActiveArtboardIndex(abIdx);
    doc.selectObjectsOnActiveArtboard();

    // Step 2: Create a rectangle matching current artboard
    var rect = doc.pathItems.rectangle(top, left, width, height);
    rect.stroked = true;
    rect.filled = false;
    rect.strokeWidth = 1;
    rect.selected = true;

    // Step 3: Parse filename for WIDTHxHEIGHT in mm
    var fileName = doc.name;
    var match = fileName.match(/(\d+)x(\d+)/);
    if (match) {
        var widthMM = parseFloat(match[1]);
        var heightMM = parseFloat(match[2]);

        var widthPT = mmToPt(widthMM);
        var heightPT = mmToPt(heightMM);

        // Step 4: Resize artboard, anchor at CENTER
        var centerX = (left + right) / 2;
        var centerY = (top + bottom) / 2;

        var newLeft   = centerX - widthPT/2;
        var newRight  = centerX + widthPT/2;
        var newTop    = centerY + heightPT/2;
        var newBottom = centerY - heightPT/2;

        ab.artboardRect = [
            newLeft,
            newTop,
            newRight,
            newBottom
        ];
    }
}