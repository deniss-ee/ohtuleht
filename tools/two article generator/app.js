/**
 * Story Split Builder (Patched)
 * Fixes:
 * 1. Immediate file picker on zone click
 * 2. Fixed centered text area width (824px)
 * 3. Ensure visible semi-transparent white highlight
 */

(function() {

  // ---------- CONSTANTS ----------
  const CANVAS_W = 1080;
  const CANVAS_H = 1920;
  const HALF_H = CANVAS_H / 2;
  const TEXT_AREA_WIDTH = 824; // Fixed width requirement
  const DPR = window.devicePixelRatio || 1;

  // ---------- STATE ----------
  const State = {
    top: {
      img: null,
      naturalW: 0,
      naturalH: 0,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      maxOffsetX: 0,
      maxOffsetY: 0
    },
    bottom: {
      img: null,
      naturalW: 0,
      naturalH: 0,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      maxOffsetX: 0,
      maxOffsetY: 0
    },
    text: {
      content: '',
      fontSize: 48,
      fontWeight: 700,
      lineHeightFactor: 1.2,
      color: '#000000',
      highlightColor: '#FFFFFF',
      highlightOpacity: 0.5,
      highlightPadding: 48,
      offsetY: 0
    },
    interaction: {
      dragging: false,
      activeRegion: null,
      lastX: 0,
      lastY: 0
    },
    ready() {
      return !!(this.top.img || this.bottom.img);
    }
  };

  // ---------- ELEMENTS ----------
  const els = {
    canvas: document.getElementById('storyCanvas'),
    dropTop: document.getElementById('dropTop'),
    dropBottom: document.getElementById('dropBottom'),
    downloadBtn: document.getElementById('downloadBtn'),
    resetTop: document.getElementById('resetTop'),
    resetBottom: document.getElementById('resetBottom'),
    textArea: document.getElementById('storyText'),
    fontSize: document.getElementById('fontSize'),
    fontWeight: document.getElementById('fontWeight'),
    lineHeight: document.getElementById('lineHeight'),
    textOffsetY: document.getElementById('textOffsetY'),
    textColor: document.getElementById('textColor'),
    highlightColor: document.getElementById('highlightColor'),
    highlightOpacity: document.getElementById('highlightOpacity'),
    highlightPadding: document.getElementById('highlightPadding')
  };

  const ctx = els.canvas.getContext('2d');

  // ---------- REGION MATH ----------
  const RegionMath = {
    computeCover(regionWidth, regionHeight, imgWidth, imgHeight) {
      const scale = Math.max(regionWidth / imgWidth, regionHeight / imgHeight);
      const drawW = imgWidth * scale;
      const drawH = imgHeight * scale;
      const maxOffsetX = (drawW - regionWidth) / 2;
      const maxOffsetY = (drawH - regionHeight) / 2;
      return { scale, maxOffsetX, maxOffsetY };
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
      words.forEach(word => {
        const test = current ? current + ' ' + word : word;
        const width = ctx.measureText(test).width;
        if (width > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      });
      if (current) lines.push(current);
      return lines;
    },
    measureLines(lines, font) {
      ctx.font = font;
      return lines.map(l => ctx.measureText(l).width);
    }
  };

  // ---------- RENDERER ----------
  const Renderer = {
    clear() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0,0,CANVAS_W,CANVAS_H);
    },
    drawRegion(regionKey) {
      const r = State[regionKey];
      if (!r.img) return;
      const yBase = regionKey === 'top' ? 0 : HALF_H;
      const regionWidth = CANVAS_W;
      const regionHeight = HALF_H;
      const drawW = r.naturalW * r.scale;
      const drawH = r.naturalH * r.scale;
      const centerX = (regionWidth - drawW) / 2 + r.offsetX;
      const centerY = (regionHeight - drawH) / 2 + r.offsetY;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, yBase, regionWidth, regionHeight);
      ctx.clip();
      ctx.drawImage(r.img, centerX, yBase + centerY, drawW, drawH);
      ctx.restore();
    },
    drawText() {
      const t = State.text;
      if (!t.content.trim()) return;

      const font = `${t.fontWeight} ${t.fontSize}px "Fira Sans Condensed", sans-serif`;
      ctx.font = font;
      ctx.textBaseline = 'top';
      ctx.fillStyle = t.color;

      // We wrap within the inner width (fixed area minus horizontal padding *2)
      const innerWidth = TEXT_AREA_WIDTH - t.highlightPadding * 2;
      const lines = TextManager.wrapLines(t.content.trim(), innerWidth, font);
      const lineHeights = t.fontSize * t.lineHeightFactor;
      const lineWidths = TextManager.measureLines(lines, font);

      const blockHeight = lines.length * lineHeights;
      const highlightX = (CANVAS_W - TEXT_AREA_WIDTH) / 2;
      const highlightYCenter = CANVAS_H / 2 + t.offsetY;
      const highlightY = highlightYCenter - blockHeight / 2 - t.highlightPadding * 0.6;
      const highlightHeight = blockHeight + t.highlightPadding * 1.2;

      // Highlight
      ctx.save();
      ctx.fillStyle = this._rgbaFromHex(t.highlightColor, t.highlightOpacity);
      ctx.fillRect(highlightX, highlightY, TEXT_AREA_WIDTH, highlightHeight);
      ctx.restore();

      // Draw each line centered within the 824px area
      lines.forEach((line, i) => {
        const lw = lineWidths[i];
        const lineX = highlightX + (TEXT_AREA_WIDTH - lw) / 2;
        const lineY = highlightY + t.highlightPadding * 0.6 + i * lineHeights;
        ctx.fillText(line, lineX, lineY);
      });
    },
    _rgbaFromHex(hex, opacityPercent) {
      const o = Math.max(0, Math.min(100, opacityPercent)) / 100;
      let c = hex.replace('#','');
      if (c.length === 3) c = c.split('').map(ch => ch+ch).join('');
      const r = parseInt(c.substring(0,2),16);
      const g = parseInt(c.substring(2,4),16);
      const b = parseInt(c.substring(4,6),16);
      return `rgba(${r},${g},${b},${o})`;
    },
    render() {
      this.clear();
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
      img.onload = () => {
        const target = State[region];
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
        Renderer.render();
        UI.enableReset(region, true);
      };
      img.src = URL.createObjectURL(file);
    },
    initDropZone(zoneEl, region) {
      // Drag events
      zoneEl.addEventListener('dragover', e => {
        e.preventDefault();
        zoneEl.classList.add('drag-over');
      });
      zoneEl.addEventListener('dragleave', () => {
        zoneEl.classList.remove('drag-over');
      });
      zoneEl.addEventListener('drop', e => {
        e.preventDefault();
        zoneEl.classList.remove('drag-over');
        if (!e.dataTransfer.files[0]) return;
        this.handleFile(e.dataTransfer.files[0], region);
      });

      // Reliable click -> file dialog
      const input = zoneEl.querySelector('.dz-input');
      zoneEl.addEventListener('click', () => {
        input.click();
      });
      input.addEventListener('click', e => {
        // Allow immediate open even if previously used
        e.stopPropagation();
      });
      input.addEventListener('change', e => {
        const file = e.target.files[0];
        this.handleFile(file, region);
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
      const constrained = RegionMath.constrainOffset(r.offsetX, r.offsetY, r.maxOffsetX, r.maxOffsetY);
      r.offsetX = constrained.x;
      r.offsetY = constrained.y;
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
      const target = document.getElementById('canvasWrapper');
      ['mousedown','touchstart'].forEach(ev =>
        target.addEventListener(ev, this.pointerDown.bind(this), { passive: false }));
      ['mousemove','touchmove'].forEach(ev =>
        target.addEventListener(ev, this.pointerMove.bind(this), { passive: false }));
      ['mouseleave','mouseup','touchend','touchcancel'].forEach(ev =>
        target.addEventListener(ev, this.pointerUp.bind(this)));
    }
  };

  // ---------- EXPORTER ----------
  const Exporter = {
    exportPNG() {
      els.canvas.toBlob(blob => {
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

      els.textArea.addEventListener('input', () => {
        State.text.content = els.textArea.value;
        Renderer.render();
      });
      els.fontSize.addEventListener('input', () => {
        State.text.fontSize = parseInt(els.fontSize.value,10) || 48;
        Renderer.render();
      });
      els.fontWeight.addEventListener('change', () => {
        State.text.fontWeight = els.fontWeight.value;
        Renderer.render();
      });
      els.lineHeight.addEventListener('input', () => {
        State.text.lineHeightFactor = (parseInt(els.lineHeight.value,10) || 120) / 100;
        Renderer.render();
      });
      els.textOffsetY.addEventListener('input', () => {
        State.text.offsetY = parseInt(els.textOffsetY.value,10) || 0;
        Renderer.render();
      });
      els.textColor.addEventListener('input', () => {
        State.text.color = els.textColor.value;
        Renderer.render();
      });
      els.highlightColor.addEventListener('input', () => {
        State.text.highlightColor = els.highlightColor.value;
        Renderer.render();
      });
      els.highlightOpacity.addEventListener('input', () => {
        State.text.highlightOpacity = parseInt(els.highlightOpacity.value,10) || 50;
        Renderer.render();
      });
      els.highlightPadding.addEventListener('input', () => {
        State.text.highlightPadding = parseInt(els.highlightPadding.value,10) || 48;
        Renderer.render();
      });

      els.downloadBtn.addEventListener('click', () => Exporter.exportPNG());
      els.resetTop.addEventListener('click', () => this.resetRegion('top'));
      els.resetBottom.addEventListener('click', () => this.resetRegion('bottom'));

      DragController.init();
      Renderer.render();
    },
    resetRegion(region) {
      const r = State[region];
      if (!r.img) return;
      const { scale, maxOffsetX, maxOffsetY } =
        RegionMath.computeCover(CANVAS_W, HALF_H, r.naturalW, r.naturalH);
      r.scale = scale;
      r.offsetX = 0;
      r.offsetY = 0;
      r.maxOffsetX = maxOffsetX;
      r.maxOffsetY = maxOffsetY;
      Renderer.render();
    },
    markZoneFilled(region) {
      if (region === 'top') els.dropTop.classList.add('filled');
      if (region === 'bottom') els.dropBottom.classList.add('filled');
    },
    enableReset(region, enabled) {
      if (region === 'top') els.resetTop.disabled = !enabled;
      if (region === 'bottom') els.resetBottom.disabled = !enabled;
    },
    updateDownloadState() {
      els.downloadBtn.disabled = !State.ready();
    }
  };

  document.addEventListener('DOMContentLoaded', UI.init);

})();