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
3. Choose desired display mode
4. If needed, drag image for precise cropping
5. Click "Download Result" to save

## 🔧 Technical Details

- **Canvas size**: 1920x1080 pixels
- **Supported formats**: all standard image formats (JPEG, PNG, WebP, etc.)
- **Background blur**: 24px with 60% darkening
- **Output format**: JPEG (90% quality) with original filename + "_ol" suffix
- **Filename preservation**: Keeps original name with "_ol" postfix
- **Compatibility**: Modern browsers with HTML5 Canvas support

## 🎨 Styles and UI

- **Framework**: Tailwind CSS 4.0
- **Design**: Minimalist, modern
- **Responsiveness**: Mobile-first approach
- **Animations**: Smooth transitions and hover effects

## 📖 Changelog

### v2.0 - Modular Architecture
- ✅ Complete code refactor
- ✅ Separation into logical modules
- ✅ Improved readability and maintainability
- ✅ JSDoc documentation
- ✅ Modern development practices

### v1.0 - Initial Version
- ✅ 4 display modes
- ✅ Interactive dragging
- ✅ Drag & Drop upload
- ✅ Responsive design
- ✅ Blurred background

## 🤝 Contributing

The application is built using pure JavaScript (Vanilla JS) without external dependencies, making it lightweight and fast. The modular architecture allows for easy addition of new features and code maintenance.
