# Interactive Christmas Card

An interactive Christmas card featuring a Lottie animation with cursor-tracking eye effects and keyword selection functionality.

## Features

- **Interactive Lottie Animation**: Eye animation with three states (idle, transition, hat)
- **Cursor Tracking**: The iris and highlight follow the mouse cursor for a dynamic effect
- **Keyword Selection**: Choose 3 keywords to reveal a personalized Christmas message
- **Smooth Transitions**: Elegant fade animations with 1-second duration
- **Snow Effect**: Animated snowfall background with 300 particles
- **Responsive Messages**: 20 unique message combinations based on keyword selection

## Project Structure

```
joulukaart/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # All styles (reset, layout, animations)
├── js/
│   └── script.js       # Application logic and interactions
├── assets/
│   ├── 1920x1920.json  # Lottie animation data (100fps, 3 states)
│   └── logo.svg        # Ohtuleht logo
└── data/
    └── messages.json   # Keyword combination messages (easily editable)
```

## How to Use

1. **Open the card**: Open `index.html` in a modern web browser
2. **Move your cursor**: Watch the eye follow your movements
3. **Select keywords**: Click on 3 keywords that resonate with you
4. **Reveal message**: After selecting 3 keywords, a personalized message appears
5. **Final screen**: Logo and closing message display after 4 seconds

## Technical Details

### Technologies
- **HTML5**: Semantic structure
- **CSS3**: Custom properties (variables), animations, transitions
- **Vanilla JavaScript**: No frameworks, event-driven architecture
- **Lottie-web 5.12.2**: Animation player for interactive SVG animations

### Animation States
- **idleDefault** (frames 0-300): Character waiting, loops indefinitely
- **transitionToHat** (frames 400-425): Hat appearing animation, plays once
- **idleHat** (frames 500-800): Character with hat, loops indefinitely

### CSS Variables
Easily customize the design by editing CSS variables in `css/style.css`:

```css
:root {
  /* Colors */
  --color-white: #fff;
  --color-cream: #fdffc1;
  --color-red-dark: #900c15;
  --color-red-primary: #fc0616;
  --color-red-gradient: #e3000f;
  
  /* Timing */
  --fade-duration: 1000ms;
  --intro-duration: 0.8s;
  --keyword-intro-duration: 0.6s;
  
  /* Spacing */
  --section-padding: 32px;
  --card-width: 1280px;
  --card-height: 800px;
  --lottie-size: 600px;
  
  /* Typography */
  --font-primary: "Fira Sans";
  --font-secondary: "Inter";
}
```

### Message Customization
Edit `data/messages.json` to change or add messages:

```json
{
  "defaultMessage": "Vali kolm märksõna",
  "combinations": {
    "keyword1|keyword2|keyword3": "Your custom message here"
  }
}
```

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support

**Note**: Requires a modern browser with ES6+ support.

## Performance

- **Optimized animations**: CSS transitions and transforms (GPU-accelerated)
- **Efficient rendering**: SVG-based Lottie animations
- **Minimal dependencies**: Only Lottie-web library (loaded from CDN)
- **Small footprint**: ~172KB Lottie animation, minimal CSS/JS

## Development

### File Organization
- **CSS**: Organized with clear section comments (Variables, Reset, Layout, Animations)
- **JavaScript**: Well-commented with educational explanations
- **Data**: Separated content (messages) from code for easy editing

### Key Functions
- `makeSnow()`: Creates 300 animated snowflakes
- `switchAnimationState(stateName)`: Controls Lottie animation states
- `showElement()/hideElement()`: Manages fade transitions
- `handleKeywordClick()`: Keyword selection logic

### Iris Tracking Algorithm
```javascript
// Calculate angle from eye center to cursor
const angle = Math.atan2(deltaY, deltaX);

// Limit movement to 60px radius, scale by sensitivity (/8)
const distance = Math.min(60, Math.sqrt(deltaX² + deltaY²) / 8);

// Apply trigonometry to move iris and highlight
const moveX = Math.cos(angle) * distance;
const moveY = Math.sin(angle) * distance;
```

## Credits

- **Design & Development**: Ohtuleht Kirjastus
- **Animation**: LottieLab format (interactive Lottie)
- **Fonts**: Fira Sans, Inter (Google Fonts)

## License

© 2025 Ohtuleht Kirjastus. All rights reserved.
