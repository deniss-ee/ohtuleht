(function () {
    // ✅ Configuration: Set base width (e.g., 600px = 100vw)
    let BASE_WIDTH_PX = 600;
    const BASE_VW = 100;

    function convertPxToVw(pxValue) {
        return (parseFloat(pxValue) / BASE_WIDTH_PX * BASE_VW).toFixed(4) + "vw"; // ✅ Ensures 4 decimal places
    }

    function processStyleSheet(sheet) {
        try {
            const rules = sheet.cssRules || sheet.rules; // Get CSS rules

            for (let rule of rules) {
                if (rule.style) {
                    for (let i = 0; i < rule.style.length; i++) {
                        let prop = rule.style[i];
                        let value = rule.style.getPropertyValue(prop);

                        if (value.includes("px")) {
                            let newValue = value.replace(/(-?\d*\.?\d+)px/g, (_, num) => convertPxToVw(num));
                            rule.style.setProperty(prop, newValue);
                        }
                    }
                }
            }
        } catch (e) {
            console.warn("Unable to process stylesheet:", sheet.href, e);
        }
    }

    function convertAllStyles() {
        for (let sheet of document.styleSheets) {
            if (sheet.href && sheet.href.includes(window.location.origin)) {
                processStyleSheet(sheet);
            }
        }
    }

    window.pxToVW = {
        convert: convertAllStyles, // Expose function to manually trigger conversion
        setBaseWidth: function (newWidth) {
            BASE_WIDTH_PX = newWidth;
        }
    };

    // ✅ Auto-run when page loads
    window.addEventListener("load", convertAllStyles);
})();
