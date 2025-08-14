class DragDropGame {
  constructor() {
    this.dragItems = document.querySelectorAll(".img-1, .img-2, .img-3, .img-4, .img-5");
    this.dropZone = document.querySelector(".backpack");
    this.slide1 = document.querySelector(".slide-1");
    this.slide2 = document.querySelector(".slide-2");
    this.collectedItems = new Set();
    this.totalItems = 5;

    this.touchEl = document.querySelector('.img.touch');
    this.touchVanished = false;

    this.isDragging = false;
    this.currentDragElement = null;
    this.offset = { x: 0, y: 0 };
    this.moveHandler = null;
    this.endHandler = null;

    this.init();
  }

  init() {
    this.dragItems.forEach((item) => this.setupDragEvents(item));
    this.setupDropZone();
  }

  setupDragEvents(element) {
    element.addEventListener("mousedown", (e) => this.startDrag(e, element));
    element.addEventListener("touchstart", (e) => this.startDrag(e, element), { passive: false });

    // Add visual feedback
    element.style.cursor = "grab";
    element.style.transition = "transform 0.2s ease";
  }

    vanishTouch() {
      if (!this.touchVanished && this.touchEl) {
        // Force reflow to ensure transition
        void this.touchEl.offsetWidth;
        this.touchEl.classList.add('vanish');
        this.touchVanished = true;
        const el = this.touchEl;
        let displayNoneSet = false;
        function handler(e) {
          if (e.propertyName === 'opacity') {
            el.style.display = 'none';
            displayNoneSet = true;
            el.removeEventListener('transitionend', handler);
          }
        }
        el.addEventListener('transitionend', handler);
        // Fallback: set display none after transition duration
        setTimeout(function() {
          if (!displayNoneSet) {
            el.style.display = 'none';
          }
        }, 600); // slightly longer than CSS transition
      }
    }

  setupDropZone() {
    this.dropZone.style.transition = "filter 0.2s ease";
  }

  getEventPosition(e) {
    return {
      x: e.type.startsWith("touch") ? e.touches?.[0]?.clientX || e.changedTouches[0].clientX : e.clientX,
      y: e.type.startsWith("touch") ? e.touches?.[0]?.clientY || e.changedTouches[0].clientY : e.clientY,
    };
  }

  startDrag(e, element) {
    e.preventDefault();

    this.vanishTouch();

    if (this.collectedItems.has(element)) return;

    this.isDragging = true;
    this.currentDragElement = element;

    const { x, y } = this.getEventPosition(e);
    const rect = element.getBoundingClientRect();
    this.offset.x = x - rect.left;
    this.offset.y = y - rect.top;

    this.setDraggingVisuals(element);
    this.addGlobalListeners(e.type.startsWith("touch"));
  }

  setDraggingVisuals(element) {
    element.style.cursor = "grabbing";
    element.style.transform = "scale(1.05)";
    element.style.zIndex = "1000";
  }

  resetDraggingVisuals(element) {
    element.style.cursor = "grab";
    element.style.transform = "scale(1)";
    element.style.zIndex = "";
  }

  addGlobalListeners(isTouchEvent) {
    this.moveHandler = this.handleMove.bind(this);
    this.endHandler = this.handleEnd.bind(this);

    if (isTouchEvent) {
      document.addEventListener("touchmove", this.moveHandler, { passive: false });
      document.addEventListener("touchend", this.endHandler);
    } else {
      document.addEventListener("mousemove", this.moveHandler);
      document.addEventListener("mouseup", this.endHandler);
    }
  }

  removeGlobalListeners() {
    if (this.moveHandler && this.endHandler) {
      document.removeEventListener("mousemove", this.moveHandler);
      document.removeEventListener("mouseup", this.endHandler);
      document.removeEventListener("touchmove", this.moveHandler);
      document.removeEventListener("touchend", this.endHandler);
      this.moveHandler = null;
      this.endHandler = null;
    }
  }

  handleMove(e) {
    if (!this.isDragging || !this.currentDragElement) return;

    e.preventDefault();

    const { x, y } = this.getEventPosition(e);
    const bannerRect = document.querySelector(".banner-wrapper").getBoundingClientRect();

    // Update element position
    this.currentDragElement.style.left = x - bannerRect.left - this.offset.x + "px";
    this.currentDragElement.style.top = y - bannerRect.top - this.offset.y + "px";

    // Update drop zone visual feedback
    this.updateDropZoneVisuals(x, y);
  }

  handleEnd(e) {
    if (!this.isDragging || !this.currentDragElement) return;

    const { x, y } = this.getEventPosition(e);

    // Check if dropped on backpack
    if (this.isOverDropZone(x, y)) {
      this.collectItem(this.currentDragElement);
    } else {
      this.resetItemPosition(this.currentDragElement);
    }

    this.cleanupDrag();
  }

  cleanupDrag() {
    if (this.currentDragElement) {
      this.resetDraggingVisuals(this.currentDragElement);
    }

    this.dropZone.style.filter = "brightness(1)";
    this.isDragging = false;
    this.currentDragElement = null;
    this.removeGlobalListeners();
  }

  updateDropZoneVisuals(clientX, clientY) {
    const isOver = this.isOverDropZone(clientX, clientY);
    this.dropZone.style.filter = isOver ? "brightness(1.2)" : "brightness(1)";
  }

  isOverDropZone(clientX, clientY) {
    const dropRect = this.dropZone.getBoundingClientRect();
    return clientX >= dropRect.left && clientX <= dropRect.right && clientY >= dropRect.top && clientY <= dropRect.bottom;
  }

  collectItem(element) {
    this.collectedItems.add(element);
    this.animateItemCollection(element);

    if (this.collectedItems.size === this.totalItems) {
      setTimeout(() => this.showSlide2(), 200);
    }
  }

  animateItemCollection(element) {
    element.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    element.style.opacity = "0";
    element.style.transform = "scale(0.5)";

    setTimeout(() => {
      element.style.display = "none";
    }, 500);
  }

  resetItemPosition(element) {
    const classList = Array.from(element.classList);
    const hasImageClass = classList.some((cls) => cls.startsWith("img-"));

    if (hasImageClass) {
      element.style.transition = "left 0.3s ease, top 0.3s ease";
      element.style.left = "";
      element.style.top = "";

      setTimeout(() => {
        element.style.transition = "transform 0.2s ease";
      }, 300);
    }
  }

  showSlide2() {
    this.animateSlideTransition();
  }

  animateSlideTransition() {
    // Fade out slide 1
    this.slide1.style.transition = "opacity 0.3s ease";
    this.slide1.style.opacity = "0";

    setTimeout(() => {
      this.slide1.style.display = "none";
      this.slide2.style.display = "block";
      this.slide2.style.opacity = "0";

      // Fade in slide 2
      setTimeout(() => {
        this.slide2.style.transition = "opacity 0.3s ease";
        this.slide2.style.opacity = "1";
      }, 25);
    }, 300);
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new DragDropGame();
});
