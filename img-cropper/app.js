/**
 * Image Resizer App - Modular Architecture
 * 1920x1080 Image Generator with Various Display Modes
 */

// ===== CONSTANTS =====
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const FIT_MODES = {
  FIT: 'fit',
  COVER: 'cover', 
  CENTER: 'center',
  CUSTOM: 'custom',
  AUTO: 'auto'
};

// ===== DOM ELEMENTS =====
const elements = {
  canvas: document.getElementById("canvas"),
  ctx: document.getElementById("canvas").getContext("2d"),
  dropzone: document.getElementById("dropzone"),
  uploadOverlay: document.getElementById("uploadOverlay"),
  fileInput: document.getElementById("file-input"),
  controlPanel: document.getElementById("control-panel"),
  downloadBtn: document.getElementById("download-btn"),
  reloadBtn: document.getElementById("reload-btn"),
  centerBtn: document.getElementById("center-btn"),
  customWidthInput: document.getElementById("custom-width"),
  fitModeRadios: document.querySelectorAll(".fitmode-radio")
};

// ===== APPLICATION STATE =====
const appState = {
  imageLoaded: false,
  currentImage: null,
  currentFitMode: FIT_MODES.FIT,
  isDragging: false,
  lastMouseX: 0,
  lastMouseY: 0,
  offsetX: 0,
  offsetY: 0
};

// ===== UI MANAGEMENT MODULE =====
const UIManager = {
  /**
   * Sets dropzone state
   * @param {boolean} loaded - whether image is loaded
   */
  setDropzoneState(loaded) {
    if (loaded) {
      elements.dropzone.classList.remove("border-2", "border-dashed", "border-gray-300");
      elements.dropzone.style.border = "none";
      elements.uploadOverlay.style.display = "none";
      elements.controlPanel.classList.remove("hidden");
    } else {
      elements.dropzone.classList.add("border-2", "border-dashed", "border-gray-300");
      elements.uploadOverlay.style.display = "";
      elements.controlPanel.classList.add("hidden");
      this.clearCanvas();
      DragManager.reset();
      elements.canvas.style.cursor = "default";
    }
  },

  /**
   * Clears canvas and fills with gray color
   */
  clearCanvas() {
    elements.ctx.fillStyle = "#e5e7eb";
    elements.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  },

  /**
   * Updates cursor depending on drag capability
   */
  updateCursor() {
    if (!appState.imageLoaded || !appState.currentImage) {
      elements.canvas.style.cursor = "default";
      return;
    }
    
    const canMoveX = MovementValidator.canMoveHorizontally(appState.currentImage, appState.currentFitMode);
    const canMoveY = MovementValidator.canMoveVertically(appState.currentImage, appState.currentFitMode);
    
    if (canMoveX || canMoveY) {
      elements.canvas.style.cursor = appState.isDragging ? "grabbing" : "grab";
    } else {
      elements.canvas.style.cursor = "default";
    }
  }
};

// ===== MOVEMENT VALIDATION MODULE =====
const MovementValidator = {
  /**
   * Checks possibility of horizontal movement
   * @param {Image} img - image
   * @param {string} fitMode - display mode
   * @returns {boolean}
   */
  canMoveHorizontally(img, fitMode) {
    if (!img) return false;
    
    switch (fitMode) {
      case FIT_MODES.COVER:
      case FIT_MODES.AUTO:
        return true;
      case FIT_MODES.FIT:
        return false;
      case FIT_MODES.CENTER:
        return img.width > CANVAS_WIDTH;
      case FIT_MODES.CUSTOM:
        const customWidth = parseInt(elements.customWidthInput.value) || 1080;
        const scale = customWidth / img.width;
        const scaledWidth = img.width * scale;
        return scaledWidth > CANVAS_WIDTH;
      default:
        return false;
    }
  },

  /**
   * Checks possibility of vertical movement
   * @param {Image} img - image
   * @param {string} fitMode - display mode
   * @returns {boolean}
   */
  canMoveVertically(img, fitMode) {
    if (!img) return false;
    
    switch (fitMode) {
      case FIT_MODES.COVER:
      case FIT_MODES.AUTO:
        return true;
      case FIT_MODES.FIT:
        return false;
      case FIT_MODES.CENTER:
        return img.height > CANVAS_HEIGHT;
      case FIT_MODES.CUSTOM:
        const customWidth = parseInt(elements.customWidthInput.value) || 1080;
        const scale = customWidth / img.width;
        const scaledHeight = img.height * scale;
        return scaledHeight > CANVAS_HEIGHT;
      default:
        return false;
    }
  }
};

// ===== DRAG MANAGEMENT MODULE =====
const DragManager = {
  /**
   * Starts dragging
   * @param {number} mouseX - X mouse coordinate
   * @param {number} mouseY - Y mouse coordinate
   */
  startDrag(mouseX, mouseY) {
    if (!appState.imageLoaded) return false;
    
    const canMoveX = MovementValidator.canMoveHorizontally(appState.currentImage, appState.currentFitMode);
    const canMoveY = MovementValidator.canMoveVertically(appState.currentImage, appState.currentFitMode);
    
    if (!canMoveX && !canMoveY) return false;
    
    appState.isDragging = true;
    appState.lastMouseX = mouseX;
    appState.lastMouseY = mouseY;
    UIManager.updateCursor();
    return true;
  },

  /**
   * Updates position during dragging
   * @param {number} mouseX - X mouse coordinate
   * @param {number} mouseY - Y mouse coordinate
   */
  updateDrag(mouseX, mouseY) {
    if (!appState.isDragging || !appState.imageLoaded) return;
    
    const deltaX = mouseX - appState.lastMouseX;
    const deltaY = mouseY - appState.lastMouseY;
    
    const canMoveX = MovementValidator.canMoveHorizontally(appState.currentImage, appState.currentFitMode);
    const canMoveY = MovementValidator.canMoveVertically(appState.currentImage, appState.currentFitMode);
    
    if (canMoveX) appState.offsetX += deltaX;
    if (canMoveY) appState.offsetY += deltaY;
    
    appState.lastMouseX = mouseX;
    appState.lastMouseY = mouseY;
    
    ImageRenderer.draw(appState.currentImage, appState.currentFitMode);
  },

  /**
   * Ends dragging
   */
  endDrag() {
    if (appState.isDragging) {
      appState.isDragging = false;
      UIManager.updateCursor();
    }
  },

  /**
   * Resets drag state
   */
  reset() {
    appState.offsetX = 0;
    appState.offsetY = 0;
    appState.isDragging = false;
  },

  /**
   * Centers the image
   */
  center() {
    if (appState.imageLoaded && appState.currentImage) {
      this.reset();
      ImageRenderer.draw(appState.currentImage, appState.currentFitMode);
    }
  }
};

// ===== IMAGE RENDERING MODULE =====
const ImageRenderer = {
  /**
   * Draws image on canvas
   * @param {Image} img - image to draw
   * @param {string} fitMode - display mode
   */
  draw(img, fitMode = FIT_MODES.AUTO) {
    elements.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Blurred background (110% to cover edges)
    this._drawBlurredBackground(img);

    // Check for exact size match
    if (img.width === CANVAS_WIDTH && img.height === CANVAS_HEIGHT) {
      elements.ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      return;
    }

    // Draw based on mode
    switch (fitMode) {
      case FIT_MODES.CENTER:
        this._drawCenterMode(img);
        break;
      case FIT_MODES.FIT:
        this._drawFitMode(img);
        break;
      case FIT_MODES.COVER:
        this._drawCoverMode(img);
        break;
      case FIT_MODES.CUSTOM:
        this._drawCustomMode(img);
        break;
      case FIT_MODES.AUTO:
        this._drawAutoMode(img);
        break;
    }
  },

  /**
   * Draws blurred background
   * @param {Image} img - image
   * @private
   */
  _drawBlurredBackground(img) {
    const scaleBg = Math.max(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height) * 1.1;
    const bgW = img.width * scaleBg;
    const bgH = img.height * scaleBg;
    const bgX = (CANVAS_WIDTH - bgW) / 2;
    const bgY = (CANVAS_HEIGHT - bgH) / 2;
    
    elements.ctx.save();
    elements.ctx.filter = "blur(24px) brightness(0.6)";
    elements.ctx.drawImage(img, bgX, bgY, bgW, bgH);
    elements.ctx.restore();
  },

  /**
   * "Original size centered" mode
   * @param {Image} img - image
   * @private
   */
  _drawCenterMode(img) {
    let drawW = img.width;
    let drawH = img.height;
    let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

    if (drawW > CANVAS_WIDTH) {
      sx = Math.floor((img.width - CANVAS_WIDTH) / 2) - appState.offsetX;
      sx = Math.max(0, Math.min(sx, img.width - CANVAS_WIDTH));
      sWidth = CANVAS_WIDTH;
      drawW = CANVAS_WIDTH;
    }
    
    if (drawH > CANVAS_HEIGHT) {
      sy = Math.floor((img.height - CANVAS_HEIGHT) / 2) - appState.offsetY;
      sy = Math.max(0, Math.min(sy, img.height - CANVAS_HEIGHT));
      sHeight = CANVAS_HEIGHT;
      drawH = CANVAS_HEIGHT;
    }
    
    const drawX = (CANVAS_WIDTH - drawW) / 2;
    const drawY = (CANVAS_HEIGHT - drawH) / 2;
    
    elements.ctx.drawImage(img, sx, sy, sWidth, sHeight, drawX, drawY, drawW, drawH);
  },

  /**
   * "Fit completely" mode
   * @param {Image} img - image
   * @private
   */
  _drawFitMode(img) {
    const scale = Math.min(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    let drawX = (CANVAS_WIDTH - drawW) / 2 + appState.offsetX;
    let drawY = (CANVAS_HEIGHT - drawH) / 2 + appState.offsetY;
    
    // Offset constraints
    const maxOffsetX = (CANVAS_WIDTH - drawW) / 2;
    const maxOffsetY = (CANVAS_HEIGHT - drawH) / 2;
    drawX = Math.max(-maxOffsetX, Math.min(drawX, CANVAS_WIDTH - drawW + maxOffsetX));
    drawY = Math.max(-maxOffsetY, Math.min(drawY, CANVAS_HEIGHT - drawH + maxOffsetY));
    
    elements.ctx.drawImage(img, drawX, drawY, drawW, drawH);
  },

  /**
   * "Crop to fit" mode
   * @param {Image} img - image
   * @private
   */
  _drawCoverMode(img) {
    const scale = Math.max(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    let drawX = (CANVAS_WIDTH - drawW) / 2 + appState.offsetX;
    let drawY = (CANVAS_HEIGHT - drawH) / 2 + appState.offsetY;
    
    // Constraints so image doesn't go outside bounds
    drawX = Math.max(CANVAS_WIDTH - drawW, Math.min(0, drawX));
    drawY = Math.max(CANVAS_HEIGHT - drawH, Math.min(0, drawY));
    
    elements.ctx.drawImage(img, drawX, drawY, drawW, drawH);
  },

  /**
   * "Custom width" mode
   * @param {Image} img - image
   * @private
   */
  _drawCustomMode(img) {
    const customWidth = parseInt(elements.customWidthInput.value) || 1080;
    const scale = customWidth / img.width;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    let drawX = (CANVAS_WIDTH - drawW) / 2 + appState.offsetX;
    let drawY = (CANVAS_HEIGHT - drawH) / 2 + appState.offsetY;
    
    // Offset constraints
    if (drawW > CANVAS_WIDTH) {
      drawX = Math.max(CANVAS_WIDTH - drawW, Math.min(0, drawX));
    }
    if (drawH > CANVAS_HEIGHT) {
      drawY = Math.max(CANVAS_HEIGHT - drawH, Math.min(0, drawY));
    }
    
    elements.ctx.drawImage(img, drawX, drawY, drawW, drawH);
  },

  /**
   * Automatic mode (legacy)
   * @param {Image} img - image
   * @private
   */
  _drawAutoMode(img) {
    let targetSize, scale, drawW, drawH, drawX, drawY;
    
    if (img.width === img.height) {
      // Square images
      targetSize = 1080;
      scale = targetSize / img.width;
    } else if (img.width < img.height) {
      // Vertical - by width
      targetSize = 1080;
      scale = targetSize / img.width;
    } else {
      // Horizontal - by height
      targetSize = 1080;
      scale = targetSize / img.height;
    }
    
    drawW = img.width * scale;
    drawH = img.height * scale;
    drawX = (CANVAS_WIDTH - drawW) / 2 + appState.offsetX;
    drawY = (CANVAS_HEIGHT - drawH) / 2 + appState.offsetY;
    
    // Offset constraints
    if (drawW > CANVAS_WIDTH) {
      drawX = Math.max(CANVAS_WIDTH - drawW, Math.min(0, drawX));
    }
    if (drawH > CANVAS_HEIGHT) {
      drawY = Math.max(CANVAS_HEIGHT - drawH, Math.min(0, drawY));
    }
    
    elements.ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }
};

// ===== FILE LOADING MODULE =====
const FileManager = {
  /**
   * Handles uploaded files
   * @param {FileList} files - file list
   */
  handleFiles(files) {
    if (!files || !files[0]) return;
    
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image");
      return;
    }
    
    const img = new Image();
    img.onload = () => this._onImageLoad(img);
    img.onerror = () => alert("Image loading error");
    img.src = URL.createObjectURL(file);
  },

  /**
   * Handler for successful image loading
   * @param {Image} img - loaded image
   * @private
   */
  _onImageLoad(img) {
    appState.imageLoaded = true;
    appState.currentImage = img;
    appState.currentFitMode = document.querySelector(".fitmode-radio:checked").value;
    
    // Enable/disable width input field
    elements.customWidthInput.disabled = appState.currentFitMode !== FIT_MODES.CUSTOM;
    
    DragManager.reset();
    UIManager.setDropzoneState(true);
    ImageRenderer.draw(img, appState.currentFitMode);
    UIManager.updateCursor();
    elements.fileInput.value = "";
  },

  /**
   * Downloads current image
   */
  downloadImage() {
    const link = document.createElement("a");
    link.download = "resized-1920x1080.png";
    link.href = elements.canvas.toDataURL("image/png");
    link.click();
  },

  /**
   * Starts loading a new file
   */
  loadNewFile() {
    elements.fileInput.value = "";
    elements.fileInput.click();
  }
};

// ===== EVENT HANDLERS =====
const EventHandlers = {
  /**
   * Initializes all event handlers
   */
  init() {
    this._initModeHandlers();
    this._initDragHandlers();
    this._initUIHandlers();
    this._initFileHandlers();
  },

  /**
   * Mode switching handlers
   * @private
   */
  _initModeHandlers() {
    elements.fitModeRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (appState.imageLoaded && appState.currentImage) {
          appState.currentFitMode = document.querySelector(".fitmode-radio:checked").value;
          elements.customWidthInput.disabled = appState.currentFitMode !== FIT_MODES.CUSTOM;
          DragManager.reset();
          ImageRenderer.draw(appState.currentImage, appState.currentFitMode);
          UIManager.updateCursor();
        }
      });
    });

    // Custom width change handler
    elements.customWidthInput.addEventListener("input", () => {
      if (appState.imageLoaded && appState.currentImage && appState.currentFitMode === FIT_MODES.CUSTOM) {
        DragManager.reset();
        ImageRenderer.draw(appState.currentImage, appState.currentFitMode);
      }
    });
  },

  /**
   * Drag handlers
   * @private
   */
  _initDragHandlers() {
    elements.canvas.addEventListener("mousedown", (e) => {
      DragManager.startDrag(e.clientX, e.clientY);
    });

    elements.canvas.addEventListener("mousemove", (e) => {
      DragManager.updateDrag(e.clientX, e.clientY);
    });

    elements.canvas.addEventListener("mouseup", () => {
      DragManager.endDrag();
    });

    elements.canvas.addEventListener("mouseleave", () => {
      DragManager.endDrag();
    });
  },

  /**
   * UI button handlers
   * @private
   */
  _initUIHandlers() {
    elements.downloadBtn.addEventListener("click", () => {
      FileManager.downloadImage();
    });

    elements.reloadBtn.addEventListener("click", () => {
      FileManager.loadNewFile();
    });

    elements.centerBtn.addEventListener("click", () => {
      DragManager.center();
    });
  },

  /**
   * File loading handlers
   * @private
   */
  _initFileHandlers() {
    // Click on dropzone
    elements.dropzone.addEventListener("click", () => {
      if (!appState.imageLoaded) elements.fileInput.click();
    });

    // Drag & Drop
    elements.dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!appState.imageLoaded) {
        elements.dropzone.classList.add("border-blue-400", "bg-blue-50");
        elements.uploadOverlay.classList.add("text-blue-600");
      }
    });

    elements.dropzone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      if (!appState.imageLoaded) {
        elements.dropzone.classList.remove("border-blue-400", "bg-blue-50");
        elements.uploadOverlay.classList.remove("text-blue-600");
      }
    });

    elements.dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!appState.imageLoaded) {
        elements.dropzone.classList.remove("border-blue-400", "bg-blue-50");
        elements.uploadOverlay.classList.remove("text-blue-600");
        FileManager.handleFiles(e.dataTransfer.files);
      }
    });

    // File selection through input
    elements.fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        FileManager.handleFiles(e.target.files);
        appState.imageLoaded = true;
        UIManager.setDropzoneState(true);
        elements.fileInput.value = "";
      }
    });
  }
};

// ===== APPLICATION INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  UIManager.setDropzoneState(false);
  EventHandlers.init();
});
