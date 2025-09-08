/**
 * Story Split Builder (Remove Buttons Fix)
 * Fixes:
 * - "Remove Top/Bottom Photo" now fully clears region and re-enables upload
 * - Uses in-place mutation instead of object replacement
 * - Updates download button state after removals
 * - Ensures pointer events restored
 */

(function() {

  // ---------- CONSTANTS ----------
  const CANVAS_W = 1080;
  const CANVAS_H = 1920;
  const HALF_H = CANVAS_H / 2;
  const TEXT_AREA_WIDTH = 952;
  const FIXED_LINE_HEIGHT_FACTOR = 1.25;
  const FIXED_HIGHLIGHT_PADDING = 48;
  const HIGHLIGHT_RADIUS = 32;

  function initialRegionState() {
    return {
      img: null,
      naturalW: 0,
      naturalH: 0,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      maxOffsetX: 0,
      maxOffsetY: 0,
      _blobUrl: null // keep reference if we want to revoke
    };
  }

  // ---------- STATE ----------
  const State = {
    top: initialRegionState(),
    bottom: initialRegionState(),
    text: {
      content: '',
      fontSize: 72,              // default size per last request
      fontWeight: 700,
      color: '#000000',          // always black default
      highlightColor: '#FFFFFF', // always white default
      highlightOpacity: 1        // 100%
    },
    interaction: { dragging: false, activeRegion: null, lastX: 0, lastY: 0 },
    ready() { return !!(this.top.img || this.bottom.img); }
  };

  // ---------- ELEMENTS ----------
  const els = {
    canvas: document.getElementById('storyCanvas'),
    dropTop: document.getElementById('dropTop'),
    dropBottom: document.getElementById('dropBottom'),
    downloadBtn: document.getElementById('downloadBtn'),
    removeTop: document.getElementById('removeTop'),
    removeBottom: document.getElementById('removeBottom'),
    textArea: document.getElementById('storyText'),
    fontSize: document.getElementById('fontSize'),
    fontSizeValue: document.getElementById('fontSizeValue'),
    textColor: document.getElementById('textColor'),
    highlightColor: document.getElementById('highlightColor'),
    highlightOpacity: document.getElementById('highlightOpacity'),
    highlightOpacityValue: document.getElementById('highlightOpacityValue')
  };

  const ctx = els.canvas.getContext('2d');

  // ---------- REGION MATH ----------
  const RegionMath = {
    computeCover(regionWidth, regionHeight, imgWidth, imgHeight) {
      const scale = Math.max(regionWidth / imgWidth, regionHeight / imgHeight);
      const drawW = imgWidth * scale;
      const drawH = imgHeight * scale;
      return {
        scale,
        maxOffsetX: (drawW - regionWidth) / 2,
        maxOffsetY: (drawH - regionHeight) / 2
      };
    },
    constrainOffset(x, y, maxX, maxY) {
      return {
        x: Math.min(maxX, Math.max(-maxX, x)),
        y: Math.min(maxY, Math.max(-maxY, y))
      };
    }
  };

  // ---------- TEXT MANAGER ----------
  const TextManager = {
    wrapLines(text, maxWidth, font) {
      ctx.font = font;
      const words = text.split(/\s+/);
      const lines = [];
      let current = '';
      for (const word of words) {
        const test = current ? current + ' ' + word : word;
        if (ctx.measureText(test).width > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
      return lines;
    },
    measureWidths(lines, font) {
      ctx.font = font;
      return lines.map(l => ctx.measureText(l).width);
    }
  };

  // ---------- RENDERER ----------
  const Renderer = {
    clearAll() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    },
    drawRegion(regionKey) {
      const r = State[regionKey];
      if (!r.img) return;
      const yBase = regionKey === 'top' ? 0 : HALF_H;
      const regionW = CANVAS_W;
      const regionH = HALF_H;
      const drawW = r.naturalW * r.scale;
      const drawH = r.naturalH * r.scale;
      const imgX = (regionW - drawW) / 2 + r.offsetX;
      const imgY = (regionH - drawH) / 2 + r.offsetY + yBase;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, yBase, regionW, regionH);
      ctx.clip();
      ctx.drawImage(r.img, imgX, imgY, drawW, drawH);
      ctx.restore();
    },
    drawRoundedRect(x,y,w,h,r) {
      const rr = Math.min(r, w/2, h/2);
      ctx.beginPath();
      ctx.moveTo(x+rr,y);
      ctx.lineTo(x+w-rr,y);
      ctx.quadraticCurveTo(x+w,y,x+w,y+rr);
      ctx.lineTo(x+w,y+h-rr);
      ctx.quadraticCurveTo(x+w,y+h,x+w-rr,y+h);
      ctx.lineTo(x+rr,y+h);
      ctx.quadraticCurveTo(x,y+h,x,y+h-rr);
      ctx.lineTo(x,y+rr);
      ctx.quadraticCurveTo(x,y,x+rr,y);
      ctx.closePath();
    },
    drawText() {
      const t = State.text;
      if (!t.content.trim()) return;
      const font = `${t.fontWeight} ${t.fontSize}px "Fira Sans Condensed", sans-serif`;
      const innerWidth = TEXT_AREA_WIDTH - FIXED_HIGHLIGHT_PADDING * 2;
      const lines = TextManager.wrapLines(t.content.trim(), innerWidth, font);
      const lineHeightPx = t.fontSize * FIXED_LINE_HEIGHT_FACTOR;
      const lineWidths = TextManager.measureWidths(lines, font);
      const totalHeight = lines.length * lineHeightPx;

      const highlightX = (CANVAS_W - TEXT_AREA_WIDTH)/2;
      const highlightY = (CANVAS_H/2) - totalHeight/2 - FIXED_HIGHLIGHT_PADDING * 0.6;
      const highlightH = totalHeight + FIXED_HIGHLIGHT_PADDING * 1.2;

      ctx.save();
      ctx.fillStyle = this._rgba(State.text.highlightColor, State.text.highlightOpacity);
      this.drawRoundedRect(highlightX, highlightY, TEXT_AREA_WIDTH, highlightH, HIGHLIGHT_RADIUS);
      ctx.fill();
      ctx.restore();

      ctx.font = font;
      ctx.textBaseline = 'top';
      ctx.fillStyle = t.color;

      lines.forEach((line,i) => {
        const lw = lineWidths[i];
        const lineX = highlightX + (TEXT_AREA_WIDTH - lw)/2;
        const lineY = highlightY + FIXED_HIGHLIGHT_PADDING * 0.6 + i * lineHeightPx;
        ctx.fillText(line, lineX, lineY);
      });
    },
    _rgba(hex, opacityFraction) {
      const o = Math.max(0, Math.min(1, opacityFraction));
      let c = hex.replace('#','');
      if (c.length === 3) c = c.split('').map(ch=>ch+ch).join('');
      const r = parseInt(c.slice(0,2),16);
      const g = parseInt(c.slice(2,4),16);
      const b = parseInt(c.slice(4,6),16);
      return `rgba(${r},${g},${b},${o})`;
    },
    render() {
      this.clearAll();
      this.drawRegion('top');
      this.drawRegion('bottom');
      this.drawText();
      UI.updateDownloadState();
    }
  };

  // ---------- LOADER ----------
  const Loader = {
    handleFile(file, region) {
      if (!file || !file.type.startsWith('image/')) return;
      const img = new Image();
      const blobUrl = URL.createObjectURL(file);
      img.onload = () => {
        const target = State[region];
        // revoke previous if existed
        if (target._blobUrl && target._blobUrl !== blobUrl) {
          try { URL.revokeObjectURL(target._blobUrl); } catch {}
        }
        target._blobUrl = blobUrl;
        target.img = img;
        target.naturalW = img.naturalWidth;
        target.naturalH = img.naturalHeight;
        const { scale, maxOffsetX, maxOffsetY } =
          RegionMath.computeCover(CANVAS_W, HALF_H, img.naturalWidth, img.naturalHeight);
        target.scale = scale;
        target.offsetX = 0;
        target.offsetY = 0;
        target.maxOffsetX = maxOffsetX;
        target.maxOffsetY = maxOffsetY;
        UI.markZoneFilled(region);
        UI.enableRemove(region, true);
        Renderer.render();
      };
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        alert('Failed to load image');
      };
      img.src = blobUrl;
    },
    initDropZone(zoneEl, region) {
      zoneEl.addEventListener('dragover', e => {
        e.preventDefault();
        if (!zoneEl.classList.contains('filled')) {
          zoneEl.classList.add('drag-over');
        }
      });
      zoneEl.addEventListener('dragleave', () => {
        zoneEl.classList.remove('drag-over');
      });
      zoneEl.addEventListener('drop', e => {
        e.preventDefault();
        zoneEl.classList.remove('drag-over');
        if (zoneEl.classList.contains('filled')) return;
        if (e.dataTransfer.files[0]) this.handleFile(e.dataTransfer.files[0], region);
      });

      const input = zoneEl.querySelector('.dz-input');
      zoneEl.addEventListener('click', () => {
        if (zoneEl.classList.contains('filled')) return;
        input.click();
      });
      input.addEventListener('change', e => {
        if (e.target.files[0]) this.handleFile(e.target.files[0], region);
        input.value = '';
      });
    }
  };

  // ---------- DRAG CONTROLLER ----------
  const DragController = {
    pointerDown(e) {
      const rect = els.canvas.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
      const normY = y / rect.height * CANVAS_H;
      const region = normY < HALF_H ? 'top' : 'bottom';
      if (!State[region].img) return;
      State.interaction.dragging = true;
      State.interaction.activeRegion = region;
      State.interaction.lastX = x;
      State.interaction.lastY = y;
      e.preventDefault();
    },
    pointerMove(e) {
      if (!State.interaction.dragging) return;
      const rect = els.canvas.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
      const dx = x - State.interaction.lastX;
      const dy = y - State.interaction.lastY;
      const region = State.interaction.activeRegion;
      const r = State[region];
      r.offsetX += dx * (CANVAS_W / rect.width);
      r.offsetY += dy * (CANVAS_H / rect.height);
      const c = RegionMath.constrainOffset(r.offsetX, r.offsetY, r.maxOffsetX, r.maxOffsetY);
      r.offsetX = c.x;
      r.offsetY = c.y;
      State.interaction.lastX = x;
      State.interaction.lastY = y;
      Renderer.render();
      e.preventDefault();
    },
    pointerUp() {
      State.interaction.dragging = false;
      State.interaction.activeRegion = null;
    },
    init() {
      const wrap = document.getElementById('canvasWrapper');
      ['mousedown','touchstart'].forEach(ev => wrap.addEventListener(ev, this.pointerDown.bind(this), { passive:false }));
      ['mousemove','touchmove'].forEach(ev => wrap.addEventListener(ev, this.pointerMove.bind(this), { passive:false }));
      ['mouseup','mouseleave','touchend','touchcancel'].forEach(ev => wrap.addEventListener(ev, this.pointerUp.bind(this)));
    }
  };

  // ---------- EXPORTER ----------
  const Exporter = {
    exportPNG() {
      els.canvas.toBlob(blob => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'story-split.png';
        a.click();
        setTimeout(()=>URL.revokeObjectURL(a.href), 400);
      }, 'image/png', 1);
    }
  };

  // ---------- UI ----------
  const UI = {
    init() {
      Loader.initDropZone(els.dropTop, 'top');
      Loader.initDropZone(els.dropBottom, 'bottom');

      // Initialize controls with defaults
      els.fontSize.value = State.text.fontSize;
      els.fontSizeValue.textContent = State.text.fontSize + 'px';
      els.highlightOpacity.value = 100;
      els.highlightOpacityValue.textContent = '100%';
      els.textColor.value = State.text.color;
      els.highlightColor.value = State.text.highlightColor;

      // Text input
      els.textArea.addEventListener('input', () => {
        State.text.content = els.textArea.value;
        Renderer.render();
      });
      // Font size slider
      els.fontSize.addEventListener('input', () => {
        State.text.fontSize = parseInt(els.fontSize.value,10) || 72;
        els.fontSizeValue.textContent = State.text.fontSize + 'px';
        Renderer.render();
      });
      // (Color controls kept for flexibility)
      els.textColor.addEventListener('input', () => {
        State.text.color = els.textColor.value;
        Renderer.render();
      });
      els.highlightColor.addEventListener('input', () => {
        State.text.highlightColor = els.highlightColor.value;
        Renderer.render();
      });
      els.highlightOpacity.addEventListener('input', () => {
        State.text.highlightOpacity = (parseInt(els.highlightOpacity.value,10) || 100) / 100;
        els.highlightOpacityValue.textContent = Math.round(State.text.highlightOpacity * 100) + '%';
        Renderer.render();
      });

      // Remove buttons
      els.removeTop.addEventListener('click', () => this.removeRegion('top'));
      els.removeBottom.addEventListener('click', () => this.removeRegion('bottom'));

      // Download
      els.downloadBtn.addEventListener('click', () => Exporter.exportPNG());

      DragController.init();
      Renderer.render();
    },
    markZoneFilled(region) {
      const dz = region === 'top' ? els.dropTop : els.dropBottom;
      dz.classList.add('filled');
      dz.style.pointerEvents = 'none';
    },
    enableRemove(region, enabled) {
      if (region === 'top') els.removeTop.disabled = !enabled;
      else els.removeBottom.disabled = !enabled;
    },
    removeRegion(region) {
      this._mutateResetRegion(region);
      const dz = region === 'top' ? els.dropTop : els.dropBottom;
      dz.classList.remove('filled','drag-over');
      dz.style.pointerEvents = 'auto';

      this.enableRemove(region, false);
      // After removal update download state & re-render cleanly
      Renderer.clearAll();
      Renderer.render();
    },
    _mutateResetRegion(region) {
      const target = State[region];
      // Revoke old blob URL if present
      if (target._blobUrl) {
        try { URL.revokeObjectURL(target._blobUrl); } catch {}
      }
      const fresh = initialRegionState();
      // Mutate in place (avoid replacing object reference)
      for (const k in fresh) {
        target[k] = fresh[k];
      }
    },
    updateDownloadState() {
      els.downloadBtn.disabled = !State.ready();
    }
  };

  document.addEventListener('DOMContentLoaded', UI.init);

})();