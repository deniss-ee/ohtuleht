/**
 * Image Resizer App - Modular Architecture
 * 1920x1080 Image Generator with Various Display Modes
 */

// ===== CONSTANTS =====
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const FIT_MODES = {
  FIT: "fit",
  COVER: "cover",
  CENTER: "center",
  CUSTOM: "custom",
  AUTO: "auto",
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
  fitModeRadios: document.querySelectorAll(".fitmode-radio"),
  whiteBackgroundCheckbox: document.getElementById("white-background-checkbox"),
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
  offsetY: 0,
  originalFilename: "",
  renderRequestId: null,
  blurredBackgroundCache: null,
  whiteBackground: false,
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

      // Clear cache when resetting
      appState.blurredBackgroundCache = null;

      // Remove drag replace overlay if present on reset
      if (elements.dragReplaceOverlay) {
        elements.dragReplaceOverlay.remove();
        elements.dragReplaceOverlay = null;
      }

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
      this.updateTouchHint(false);
      return;
    }

    const canMoveX = MovementValidator.canMoveHorizontally(appState.currentImage, appState.currentFitMode);
    const canMoveY = MovementValidator.canMoveVertically(appState.currentImage, appState.currentFitMode);

    if (canMoveX || canMoveY) {
      elements.canvas.style.cursor = appState.isDragging ? "grabbing" : "grab";
      this.updateTouchHint(true);
    } else {
      elements.canvas.style.cursor = "default";
      this.updateTouchHint(false);
    }
  },

  /**
   * Shows/hides touch hint for mobile users
   * @param {boolean} canDrag - whether dragging is possible
   */
  updateTouchHint(canDrag) {
    // Check if device supports touch
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) return;

    let hint = document.getElementById("touch-hint");

    if (canDrag && !hint && !appState.isDragging) {
      // Create touch hint
      hint = document.createElement("div");
      hint.id = "touch-hint";
      hint.className = "fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm z-50 animate-pulse";
      hint.innerHTML = "👆 Touch and drag to move image";
      document.body.appendChild(hint);

      // Auto-hide after 3 seconds
      setTimeout(() => {
        if (hint && hint.parentNode) {
          hint.remove();
        }
      }, 3000);
    } else if (!canDrag && hint) {
      hint.remove();
    }
  },
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

    // Allow movement for exact canvas size images in all modes
    if (img.width === CANVAS_WIDTH && img.height === CANVAS_HEIGHT) {
      return true;
    }

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

    // Allow movement for exact canvas size images in all modes
    if (img.width === CANVAS_WIDTH && img.height === CANVAS_HEIGHT) {
      return true;
    }

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
  },
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
   * Updates position during dragging with throttling
   * @param {number} mouseX - X mouse coordinate
   * @param {number} mouseY - Y mouse coordinate
   */
  updateDrag(mouseX, mouseY) {
    if (!appState.isDragging || !appState.imageLoaded) return;

    const deltaX = mouseX - appState.lastMouseX;
    const deltaY = mouseY - appState.lastMouseY;

    // Skip small movements to reduce unnecessary renders
    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;

    const canMoveX = MovementValidator.canMoveHorizontally(appState.currentImage, appState.currentFitMode);
    const canMoveY = MovementValidator.canMoveVertically(appState.currentImage, appState.currentFitMode);

    if (canMoveX) {
      appState.offsetX += deltaX;
      appState.offsetX = this._constrainOffsetX(appState.currentImage, appState.currentFitMode);
    }
    if (canMoveY) {
      appState.offsetY += deltaY;
      appState.offsetY = this._constrainOffsetY(appState.currentImage, appState.currentFitMode);
    }

    appState.lastMouseX = mouseX;
    appState.lastMouseY = mouseY;

    // Use non-immediate rendering for smooth dragging
    ImageRenderer.draw(appState.currentImage, appState.currentFitMode, false);
  },

  /**
   * Ends dragging
   */
  endDrag() {
    if (appState.isDragging) {
      appState.isDragging = false;
      UIManager.updateCursor();

      // Hide touch hint when dragging ends
      const hint = document.getElementById("touch-hint");
      if (hint) {
        hint.remove();
      }
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
      ImageRenderer.draw(appState.currentImage, appState.currentFitMode, true);
    }
  },

  /**
   * Constrains horizontal offset within valid bounds
   * @param {Image} img - current image
   * @param {string} fitMode - current fit mode
   * @returns {number} constrained offset
   * @private
   */
  _constrainOffsetX(img, fitMode) {
    if (!img) return 0;

    // Handle exact canvas size - allow free movement within bounds
    if (img.width === CANVAS_WIDTH && img.height === CANVAS_HEIGHT) {
      // Allow movement within canvas bounds
      return Math.max(-CANVAS_WIDTH, Math.min(CANVAS_WIDTH, appState.offsetX));
    }

    switch (fitMode) {
      case FIT_MODES.COVER: {
        const scale = Math.max(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
        const drawW = img.width * scale;
        const maxOffset = Math.max(0, (drawW - CANVAS_WIDTH) / 2);
        return Math.max(-maxOffset, Math.min(maxOffset, appState.offsetX));
      }
      case FIT_MODES.CENTER: {
        if (img.width <= CANVAS_WIDTH) return 0;
        const maxOffset = (img.width - CANVAS_WIDTH) / 2;
        return Math.max(-maxOffset, Math.min(maxOffset, appState.offsetX));
      }
      case FIT_MODES.CUSTOM: {
        const customWidth = parseInt(elements.customWidthInput.value) || 1080;
        const scale = customWidth / img.width;
        const drawW = img.width * scale;
        if (drawW <= CANVAS_WIDTH) return 0;
        const maxOffset = (drawW - CANVAS_WIDTH) / 2;
        return Math.max(-maxOffset, Math.min(maxOffset, appState.offsetX));
      }
      case FIT_MODES.AUTO: {
        let targetSize, scale;
        if (img.width === img.height) {
          targetSize = 1080;
          scale = targetSize / img.width;
        } else if (img.width < img.height) {
          targetSize = 1080;
          scale = targetSize / img.width;
        } else {
          targetSize = 1080;
          scale = targetSize / img.height;
        }
        const drawW = img.width * scale;
        if (drawW <= CANVAS_WIDTH) return 0;
        const maxOffset = (drawW - CANVAS_WIDTH) / 2;
        return Math.max(-maxOffset, Math.min(maxOffset, appState.offsetX));
      }
      case FIT_MODES.FIT:
      default:
        return 0;
    }
  },

  /**
   * Constrains vertical offset within valid bounds
   * @param {Image} img - current image
   * @param {string} fitMode - current fit mode
   * @returns {number} constrained offset
   * @private
   */
  _constrainOffsetY(img, fitMode) {
    if (!img) return 0;

    // Handle exact canvas size - allow free movement within bounds
    if (img.width === CANVAS_WIDTH && img.height === CANVAS_HEIGHT) {
      // Allow movement within canvas bounds
      return Math.max(-CANVAS_HEIGHT, Math.min(CANVAS_HEIGHT, appState.offsetY));
    }

    switch (fitMode) {
      case FIT_MODES.COVER: {
        const scale = Math.max(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
        const drawH = img.height * scale;
        const maxOffset = Math.max(0, (drawH - CANVAS_HEIGHT) / 2);
        return Math.max(-maxOffset, Math.min(maxOffset, appState.offsetY));
      }
      case FIT_MODES.CENTER: {
        if (img.height <= CANVAS_HEIGHT) return 0;
        const maxOffset = (img.height - CANVAS_HEIGHT) / 2;
        return Math.max(-maxOffset, Math.min(maxOffset, appState.offsetY));
      }
      case FIT_MODES.CUSTOM: {
        const customWidth = parseInt(elements.customWidthInput.value) || 1080;
        const scale = customWidth / img.width;
        const drawH = img.height * scale;
        if (drawH <= CANVAS_HEIGHT) return 0;
        const maxOffset = (drawH - CANVAS_HEIGHT) / 2;
        return Math.max(-maxOffset, Math.min(maxOffset, appState.offsetY));
      }
      case FIT_MODES.AUTO: {
        let targetSize, scale;
        if (img.width === img.height) {
          targetSize = 1080;
          scale = targetSize / img.width;
        } else if (img.width < img.height) {
          targetSize = 1080;
          scale = targetSize / img.width;
        } else {
          targetSize = 1080;
          scale = targetSize / img.height;
        }
        const drawH = img.height * scale;
        if (drawH <= CANVAS_HEIGHT) return 0;
        const maxOffset = (drawH - CANVAS_HEIGHT) / 2;
        return Math.max(-maxOffset, Math.min(maxOffset, appState.offsetY));
      }
      case FIT_MODES.FIT:
      default:
        return 0;
    }
  },
};

// ===== IMAGE RENDERING MODULE =====
const ImageRenderer = {
  /**
   * Draws image on canvas with optimized rendering
   * @param {Image} img - image to draw
   * @param {string} fitMode - display mode
   * @param {boolean} immediate - skip debouncing for immediate render
   */
  draw(img, fitMode = FIT_MODES.AUTO, immediate = false) {
    // Cancel previous render request
    if (appState.renderRequestId) {
      cancelAnimationFrame(appState.renderRequestId);
    }

    const renderFunction = () => {
      this._performDraw(img, fitMode);
      appState.renderRequestId = null;
    };

    if (immediate || !appState.isDragging) {
      renderFunction();
    } else {
      // Use requestAnimationFrame for smooth dragging
      appState.renderRequestId = requestAnimationFrame(renderFunction);
    }
  },

  /**
   * Performs the actual drawing operation
   * @param {Image} img - image to draw
   * @param {string} fitMode - display mode
   * @private
   */
  _performDraw(img, fitMode) {
    elements.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background based on user preference
    if (appState.whiteBackground) {
      // Fill with white background
      elements.ctx.fillStyle = '#ffffff';
      elements.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      // Blurred background (cached for performance)
      this._drawBlurredBackground(img);
    }

    // Draw based on mode (removed early return for exact size match to allow manipulation)
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
   * Draws blurred background with caching
   * @param {Image} img - image
   * @private
   */
  _drawBlurredBackground(img) {
    // Use cached blurred background if available
    if (appState.blurredBackgroundCache) {
      elements.ctx.drawImage(appState.blurredBackgroundCache, 0, 0);
      return;
    }

    // Create and cache blurred background
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = CANVAS_WIDTH;
    offscreenCanvas.height = CANVAS_HEIGHT;
    const offscreenCtx = offscreenCanvas.getContext("2d");

    const scaleBg = Math.max(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height) * 1.1;
    const bgW = img.width * scaleBg;
    const bgH = img.height * scaleBg;
    const bgX = (CANVAS_WIDTH - bgW) / 2;
    const bgY = (CANVAS_HEIGHT - bgH) / 2;

    offscreenCtx.filter = "blur(48px) brightness(0.75)";
    offscreenCtx.drawImage(img, bgX, bgY, bgW, bgH);

    // Cache the result
    appState.blurredBackgroundCache = offscreenCanvas;

    // Draw to main canvas
    elements.ctx.drawImage(offscreenCanvas, 0, 0);
  },

  /**
   * "Original size centered" mode
   * @param {Image} img - image
   * @private
   */
  _drawCenterMode(img) {
    let drawW = img.width;
    let drawH = img.height;
    let sx = 0,
      sy = 0,
      sWidth = img.width,
      sHeight = img.height;

    // Handle exact canvas size - allow manipulation
    if (img.width === CANVAS_WIDTH && img.height === CANVAS_HEIGHT) {
      // Draw with offset support for exact size images
      let drawX = appState.offsetX;
      let drawY = appState.offsetY;
      elements.ctx.drawImage(img, drawX, drawY, CANVAS_WIDTH, CANVAS_HEIGHT);
      return;
    }

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
    // Handle exact canvas size - allow manipulation with offset
    if (img.width === CANVAS_WIDTH && img.height === CANVAS_HEIGHT) {
      let drawX = appState.offsetX;
      let drawY = appState.offsetY;
      elements.ctx.drawImage(img, drawX, drawY, CANVAS_WIDTH, CANVAS_HEIGHT);
      return;
    }

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
    // Handle exact canvas size - allow manipulation with offset
    if (img.width === CANVAS_WIDTH && img.height === CANVAS_HEIGHT) {
      let drawX = appState.offsetX;
      let drawY = appState.offsetY;
      elements.ctx.drawImage(img, drawX, drawY, CANVAS_WIDTH, CANVAS_HEIGHT);
      return;
    }

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

    // Handle exact canvas size case with custom scaling
    if (img.width === CANVAS_WIDTH && img.height === CANVAS_HEIGHT && scale === 1) {
      drawX = appState.offsetX;
      drawY = appState.offsetY;
      elements.ctx.drawImage(img, drawX, drawY, CANVAS_WIDTH, CANVAS_HEIGHT);
      return;
    }

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

    // Handle exact canvas size case
    if (img.width === CANVAS_WIDTH && img.height === CANVAS_HEIGHT) {
      drawX = appState.offsetX;
      drawY = appState.offsetY;
      elements.ctx.drawImage(img, drawX, drawY, CANVAS_WIDTH, CANVAS_HEIGHT);
      return;
    }

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
  },
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

    // Store original filename without extension
    const filename = file.name;
    const lastDotIndex = filename.lastIndexOf(".");
    appState.originalFilename = lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;

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

    // Clear cached background when new image loads
    appState.blurredBackgroundCache = null;

    // Enable/disable width input field
    elements.customWidthInput.disabled = appState.currentFitMode !== FIT_MODES.CUSTOM;

    DragManager.reset();
    UIManager.setDropzoneState(true);
    ImageRenderer.draw(img, appState.currentFitMode, true); // Immediate render for initial load
    UIManager.updateCursor();
    elements.fileInput.value = "";
  },

  /**
   * Downloads current image
   */
  downloadImage() {
    // Generate filename with original name + "_ol" suffix
    const filename = appState.originalFilename ? `${appState.originalFilename}_ol.jpg` : "resized-1920x1080_ol.jpg";

    const link = document.createElement("a");
    link.download = filename;
    // Convert to JPG format with 90% quality
    link.href = elements.canvas.toDataURL("image/jpeg", 1);
    link.click();
  },

  /**
   * Starts loading a new file
   */
  loadNewFile() {
    elements.fileInput.value = "";
    elements.fileInput.click();
  },
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

          // Clear background cache when mode changes
          appState.blurredBackgroundCache = null;

          DragManager.reset();
          ImageRenderer.draw(appState.currentImage, appState.currentFitMode, true);
          UIManager.updateCursor();
        }
      });
    });

    // Custom width change handler with debouncing
    let customWidthTimeout;
    elements.customWidthInput.addEventListener("input", () => {
      if (appState.imageLoaded && appState.currentImage && appState.currentFitMode === FIT_MODES.CUSTOM) {
        clearTimeout(customWidthTimeout);
        customWidthTimeout = setTimeout(() => {
          DragManager.reset();
          ImageRenderer.draw(appState.currentImage, appState.currentFitMode, true);
        }, 150); // 150ms debounce
      }
    });

    // White background toggle handler
    if (elements.whiteBackgroundCheckbox) {
      elements.whiteBackgroundCheckbox.addEventListener("change", (e) => {
        appState.whiteBackground = e.target.checked;
        
        // Clear cached blurred background when toggling to force redraw
        appState.blurredBackgroundCache = null;
        
        if (appState.imageLoaded && appState.currentImage) {
          ImageRenderer.draw(appState.currentImage, appState.currentFitMode, true);
        }
      });
    }
  },

  /**
   * Drag handlers (mouse and touch)
   * @private
   */
  _initDragHandlers() {
    // Mouse events
    elements.canvas.addEventListener("mousedown", (e) => {
      if (appState.imageLoaded) {
        e.preventDefault();
        DragManager.startDrag(e.clientX, e.clientY);
      }
    });

    elements.canvas.addEventListener("mousemove", (e) => {
      if (appState.imageLoaded) {
        DragManager.updateDrag(e.clientX, e.clientY);
      }
    });

    elements.canvas.addEventListener("mouseup", () => {
      if (appState.imageLoaded) {
        DragManager.endDrag();
      }
    });

    elements.canvas.addEventListener("mouseleave", () => {
      if (appState.imageLoaded) {
        DragManager.endDrag();
      }
    });

    // Touch events for mobile devices - only when image is loaded
    elements.canvas.addEventListener("touchstart", (e) => {
      if (appState.imageLoaded) {
        e.preventDefault();
        const touch = e.touches[0];
        DragManager.startDrag(touch.clientX, touch.clientY);
      }
    });

    elements.canvas.addEventListener("touchmove", (e) => {
      if (appState.imageLoaded) {
        e.preventDefault();
        const touch = e.touches[0];
        DragManager.updateDrag(touch.clientX, touch.clientY);
      }
    });

    elements.canvas.addEventListener("touchend", (e) => {
      if (appState.imageLoaded) {
        e.preventDefault();
        DragManager.endDrag();
      }
    });

    elements.canvas.addEventListener("touchcancel", (e) => {
      if (appState.imageLoaded) {
        e.preventDefault();
        DragManager.endDrag();
      }
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
    // Click on dropzone - improved mobile support
    elements.dropzone.addEventListener("click", (e) => {
      if (!appState.imageLoaded) {
        e.preventDefault();
        e.stopPropagation();
        elements.fileInput.click();
      }
    });

    // Mobile upload button
    const mobileUploadBtn = document.getElementById("mobile-upload-btn");
    if (mobileUploadBtn) {
      mobileUploadBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        elements.fileInput.click();
      });
    }

    // Touch events for mobile file selection
    elements.dropzone.addEventListener("touchend", (e) => {
      if (!appState.imageLoaded) {
        e.preventDefault();
        e.stopPropagation();
        elements.fileInput.click();
      }
    });

    // Drag & Drop
    elements.dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      // Always allow highlighting to indicate droppable area, even if an image is already loaded
      elements.dropzone.classList.add("border-blue-400", "bg-blue-50");
      elements.uploadOverlay.classList.add("text-blue-600");
      // Only show replace overlay if an image is already loaded (skip on first run)
      if (appState.imageLoaded) {
        this._ensureDragReplaceOverlay();
        if (elements.dragReplaceOverlay) {
          elements.dragReplaceOverlay.classList.remove("opacity-0", "invisible");
          elements.dragReplaceOverlay.classList.add("opacity-100", "visible");
        }
      }
    });

    elements.dropzone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      elements.dropzone.classList.remove("border-blue-400", "bg-blue-50");
      elements.uploadOverlay.classList.remove("text-blue-600");

      // Hide subtle overlay
      if (elements.dragReplaceOverlay) {
        elements.dragReplaceOverlay.classList.remove("opacity-100", "visible");
        elements.dragReplaceOverlay.classList.add("opacity-0", "invisible");
      }
    });

    elements.dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      // Always allow replacing the current image via drop
      elements.dropzone.classList.remove("border-blue-400", "bg-blue-50");
      elements.uploadOverlay.classList.remove("text-blue-600");
      FileManager.handleFiles(e.dataTransfer.files);

      // Hide subtle overlay after drop
      if (elements.dragReplaceOverlay) {
        elements.dragReplaceOverlay.classList.remove("opacity-100", "visible");
        elements.dragReplaceOverlay.classList.add("opacity-0", "invisible");
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
  },

  /**
   * Creates subtle drag-replace overlay if it doesn't exist
   * @private
   */
  _ensureDragReplaceOverlay() {
    if (elements.dragReplaceOverlay) return;
    const overlay = document.createElement("div");
    overlay.id = "drag-replace-overlay";
    overlay.className = "absolute inset-0 flex flex-col gap-3 items-center justify-center pointer-events-none rounded-lg bg-black/40 backdrop-blur-sm text-white text-xl font-semibold tracking-wide transition-opacity duration-150 opacity-0 invisible";
    overlay.textContent = "Release to replace image";
    // Insert above canvas but below any future controls
    elements.dropzone.appendChild(overlay);
    elements.dragReplaceOverlay = overlay;
  },
};

// ===== APPLICATION INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  UIManager.setDropzoneState(false);
  EventHandlers.init();
});
