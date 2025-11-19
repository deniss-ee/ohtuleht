(function () {
  function init() {
    const output = document.getElementById("centerOutput");
    const downloadBtn = document.getElementById("downloadBtn");
    const banner = document.getElementById("banner");
    if (!output || !downloadBtn || !banner) return;

    // Ensure empty editable keeps layout
    function plainify() {
      // Extract pure text (preserve line breaks) and reassign without formatting tags/styles.
      const text = output.textContent.replace(/\u200B/g, '');
      if (text.trim() === '') {
        output.innerHTML = '\u200B';
        return;
      }
      const html = text.split(/\n/).map(t => t.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))).join('<br>');
      output.innerHTML = html;
    }

    output.addEventListener('input', () => {
      plainify();
    });

    output.addEventListener('paste', e => {
      e.preventDefault();
      const data = (e.clipboardData || window.clipboardData).getData('text');
      // Insert plain text at caret
      const sel = window.getSelection();
      if (!sel.rangeCount) {
        output.textContent += data;
      } else {
        sel.deleteFromDocument();
        sel.getRangeAt(0).insertNode(document.createTextNode(data));
        // Move caret to end of inserted text
        sel.collapseToEnd();
      }
      plainify();
    });

    function buildFileName() {
      const d = new Date();
      const zp = (n) => (n < 10 ? "0" + n : "" + n);
      return d.getFullYear() + "-" + zp(d.getMonth() + 1) + "-" + zp(d.getDate()) + "_" + zp(d.getHours()) + "-" + zp(d.getMinutes()) + "-" + zp(d.getSeconds()) + ".png";
    }

    async function exportPNG() {
      try {
        // Clone banner to avoid flicker when removing scale
        const clone = banner.cloneNode(true);
        clone.classList.remove("scaled");
        clone.style.position = "fixed";
        clone.style.top = "-99999px";
        clone.style.left = "-99999px";
        clone.style.transform = "none";
        document.body.appendChild(clone);

        const canvas = await html2canvas(clone, {
          scale: 1,
          backgroundColor: null,
        });

        document.body.removeChild(clone);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const link = document.createElement("a");
          link.download = buildFileName();
          link.href = URL.createObjectURL(blob);
          link.click();
          setTimeout(() => URL.revokeObjectURL(link.href), 10000);
        }, "image/png");
      } catch (err) {
        console.error("Export failed:", err);
        alert("Export failed: " + err.message);
      }
    }

    downloadBtn.addEventListener("click", exportPNG);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
