# Image Resizer 1920x1080

A web application for resizing images to 1920x1080 format with various display modes and drag functionality for precise cropping adjustment.

## ✨ Features

- **4 display modes**: Fit Completely, Crop to Fit, Original Size, Custom Width
- **Interactive dragging** for precise image positioning
- **Smart movement logic** depending on mode and image orientation
- **Drag & Drop** file upload
- **Blurred background** for aesthetic filling of empty areas
- **Responsive design** for various screen sizes
- **Instant download** of result

## 🎯 Display Modes

### 1. Fit Completely
- Image scales to fit entirely within canvas
- Preserves aspect ratio
- Dragging disabled

### 2. Crop to Fit (Cover)
- Fills entire canvas, cropping excess
- Can drag in any direction
- Perfect for creating backgrounds

### 3. Original Size
- Displays without size changes
- Dragging available only if image is larger than canvas
- Shows central part for large images

### 4. Custom Width
- Scales by specified width (100-1920px)
- Preserves aspect ratio
- Dragging available if result is larger than canvas

## 🏗️ Code Architecture

The application is built with a modular approach for better maintainability:

### Main Modules:

#### 🎨 `UIManager`
User interface management
- `setDropzoneState()` - toggle dropzone state
- `updateCursor()` - update cursor
- `clearCanvas()` - clear canvas

#### 🎯 `MovementValidator` 
Image movement validation
- `canMoveHorizontally()` - check horizontal movement
- `canMoveVertically()` - check vertical movement

#### 🖱️ `DragManager`
Drag management
- `startDrag()` - start dragging
- `updateDrag()` - update position
- `endDrag()` - end dragging
- `center()` - center image

#### 🖼️ `ImageRenderer`
Image rendering
- `draw()` - main drawing method
- `_drawBlurredBackground()` - blurred background
- `_drawCenterMode()` - original size mode
- `_drawFitMode()` - fit completely mode
- `_drawCoverMode()` - crop mode
- `_drawCustomMode()` - custom width
- `_drawAutoMode()` - automatic mode (legacy)

#### 📁 `FileManager`
File operations
- `handleFiles()` - handle uploaded files
- `downloadImage()` - download result
- `loadNewFile()` - load new file

#### 🎮 `EventHandlers`
Event handler initialization
- `init()` - start all handlers
- `_initModeHandlers()` - mode switching
- `_initDragHandlers()` - dragging
- `_initUIHandlers()` - interface buttons
- `_initFileHandlers()` - file loading

## 📱 File Structure

```
img-cropper/
├── index.html          # Main page
├── app.js             # Main logic (modular architecture)
├── style.css          # Additional styles
└── README.md          # Documentation
```

## 🚀 Usage

1. Open `index.html` in browser
2. Drag image to upload area or click to select file
3. Choose display mode
4. Adjust image position by dragging (if mode allows)
5. Download result in JPG format

## 🎨 UI Elements

### Control Panel (Right)
- **Display Mode Selector**: Radio buttons for mode selection
- **Custom Width Input**: Number input for custom width mode
- **Action Buttons**: Download, Upload New, Center Image

### Canvas Area (Left)
- **Upload Overlay**: Visible when no image loaded
- **Image Canvas**: 1920x1080 canvas for image display
- **Drag Interaction**: Available in specific modes

## 🔧 Technical Details

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers with touch support
- File API and Canvas API required

### Performance Features
- Cached blurred background rendering
- Optimized drag event handling
- Efficient canvas operations
- Smart boundary calculations

### Mobile Optimizations
- Touch event support
- Responsive layout
- Mobile-friendly file input
- Touch-optimized controls

## 🎯 Mode Behavior

| Mode | Scaling | Dragging | Use Case |
|------|---------|----------|----------|
| Fit Completely | Fit to canvas | ❌ | Show entire image |
| Crop to Fit | Fill canvas | ✅ Always | Create backgrounds |
| Original Size | No scaling | ✅ If larger | Pixel-perfect editing |
| Custom Width | Custom scale | ✅ If larger | Specific dimensions |

## 🛠️ Customization

The modular architecture allows easy customization:

1. **Add new modes**: Extend `FIT_MODES` and add rendering logic
2. **Modify UI**: Update HTML structure and CSS
3. **Change output format**: Modify `downloadImage()` method
4. **Add filters**: Extend `ImageRenderer` class

## 📋 Requirements

- HTML5 Canvas support
- File API support
- Modern JavaScript (ES6+)
- Touch events (for mobile)

---

Ready to use! Just open `index.html` in your browser. 🎨