# Õhtuleht Piano Modals - Design System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Typography](#typography)
3. [Color Palette](#color-palette)
4. [Spacing System](#spacing-system)
5. [Border Radius](#border-radius)
6. [Border Widths](#border-widths)
7. [Components](#components)
8. [Layout Patterns](#layout-patterns)

---

## Overview

This design system is built with Tailwind CSS principles using CSS custom properties (CSS variables) defined in the `:root` selector. The system is designed for Piano modal dialogs and subscription flows for the Õhtuleht publication.

**Key Design Principles:**
- CSS Variable-based theming
- Component-first architecture
- Mobile-first responsive design
- Isolation from parent styles using scoped resets
- Consistent spacing and typography scales

---

## Typography

### Font Families

The design system uses two primary font families:

| Variable | Font Family | Usage |
|----------|-------------|-------|
| `--font__family__fira` | "Fira Sans Condensed", sans-serif | Headlines, titles, and prices |
| `--font__family__inter` | "Inter", sans-serif | Body text, buttons, and general UI |
| `--font__family__mono` | "Fira Mono", monospace | Code/monospace text (if needed) |
| `--font__family__serif` | "Georgia", serif | Serif text (if needed) |

**Import URL:**
```
https://fonts.googleapis.com/css2?family=Fira+Sans+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap
```

### Font Sizes

| Variable | Size | Usage Examples |
|----------|------|----------------|
| `--font__size__xs` | 12px | Footer text, disclaimers |
| `--font__size__sm` | 14px | Secondary text |
| `--font__size__base` | 16px | Body text, buttons, inputs |
| `--font__size__lg` | 18px | Emphasized body text |
| `--font__size__xl` | 20px | Subheadings |
| `--font__size__2xl` | 24px | Modal titles (mobile) |
| `--font__size__3xl` | 30px | - |
| `--font__size__4xl` | 36px | Large prices |
| `--font__size__5xl` | 48px | Extra large prices |
| `--font__size__6xl` | 60px | - |
| `--font__size__7xl` | 72px | - |
| `--font__size__8xl` | 96px | - |
| `--font__size__9xl` | 128px | - |

### Font Weights

| Variable | Value | Usage |
|----------|-------|-------|
| `--font__weight__thin` | 100 | - |
| `--font__weight__extralight` | 200 | - |
| `--font__weight__light` | 300 | - |
| `--font__weight__normal` | 400 | Normal text |
| `--font__weight__medium` | 500 | Body text, descriptions |
| `--font__weight__semibold` | 600 | - |
| `--font__weight__bold` | 700 | Titles, buttons, emphasis |
| `--font__weight__extrabold` | 800 | Prices, strong emphasis |
| `--font__weight__black` | 900 | - |

### Font Styles

| Variable | Value |
|----------|-------|
| `--font__style__italic` | italic |
| `--font__style__notitalic` | normal |

### Typography Components

#### `.pn-modal__title`
- **Font:** Fira Sans Condensed
- **Size:** 24px (mobile) / can scale up on desktop
- **Weight:** Bold (700)
- **Line Height:** 1.2
- **Color:** Red 700 (default), adapts to modal background

#### `.pn-modal__subtitle`
- **Font:** Inter
- **Size:** 16px
- **Weight:** Bold (700)
- **Line Height:** 1.35
- **Color:** Black

#### `.pn-modal__text`
- **Font:** Inter
- **Size:** 16px
- **Weight:** Medium (500)
- **Line Height:** 1.35
- **Color:** Monochrome 950 (default), adapts to background

#### `.pn-modal__footer`
- **Font:** Inter
- **Size:** 12px
- **Weight:** Medium (500)
- **Line Height:** 1.35
- **Color:** Monochrome 500 (default), adapts to background

---

## Color Palette

### Primary Colors - Red

The red palette is the primary brand color used for CTAs, titles, and emphasis.

| Variable | Hex Value | Usage |
|----------|-----------|-------|
| `--ol__red__50` | #fff0f1 | Lightest background |
| `--ol__red__100` | #ffdddf | Light background (sections) |
| `--ol__red__200` | #ffc1c5 | - |
| `--ol__red__300` | #ff959c | - |
| `--ol__red__400` | #ff5964 | - |
| `--ol__red__500` | #ff2634 | - |
| `--ol__red__600` | #fc0616 | - |
| `--ol__red__700` | #e3000f | **Primary red** - buttons, titles, links |
| `--ol__red__800` | #af0510 | Hover states |
| `--ol__red__900` | #900c15 | - |
| `--ol__red__950` | #500005 | Darkest red |

### Secondary Colors - Yellow

Yellow is used for backgrounds and secondary CTAs.

| Variable | Hex Value | Usage |
|----------|-----------|-------|
| `--ol__yellow__50` | #ffffe7 | - |
| `--ol__yellow__100` | #fdffc1 | - |
| `--ol__yellow__200` | #ffff86 | - |
| `--ol__yellow__300` | #fff641 | - |
| `--ol__yellow__400` | #ffe80d | Bright yellow (banner backgrounds) |
| `--ol__yellow__500` | #fcd700 | **Primary yellow** - modal backgrounds |
| `--ol__yellow__600` | #d1a000 | Hover states |
| `--ol__yellow__700` | #a67302 | - |
| `--ol__yellow__800` | #89590a | - |
| `--ol__yellow__900` | #74490f | Dark text on yellow |
| `--ol__yellow__950` | #442604 | Darkest text on yellow |

### Tertiary Colors - Cream/Orange

| Variable | Hex Value | Usage |
|----------|-----------|-------|
| `--ol__cream__50` | #fff8eb | - |
| `--ol__cream__100` | #ffebc4 | - |
| `--ol__cream__200` | #ffd688 | - |
| `--ol__cream__300` | #ffbc4a | - |
| `--ol__cream__400` | #ffa220 | - |
| `--ol__cream__500` | #f97d07 | - |
| `--ol__cream__600` | #dd5902 | - |
| `--ol__cream__700` | #b73a06 | - |
| `--ol__cream__800` | #942c0c | - |
| `--ol__cream__900` | #7a250d | - |
| `--ol__cream__950` | #461102 | - |

### Neutral Colors - Monochrome

Used for text, borders, and subtle backgrounds.

| Variable | Hex Value | Usage |
|----------|-----------|-------|
| `--ol__monochrome__50` | #f5f6f6 | Very light background |
| `--ol__monochrome__100` | #e5e8e8 | Borders, dividers |
| `--ol__monochrome__200` | #cdd3d4 | Input borders, placeholder text |
| `--ol__monochrome__300` | #aab3b6 | - |
| `--ol__monochrome__400` | #808d90 | - |
| `--ol__monochrome__500` | #657275 | Footer text |
| `--ol__monochrome__600` | #566064 | - |
| `--ol__monochrome__700` | #4a5254 | - |
| `--ol__monochrome__800` | #414749 | - |
| `--ol__monochrome__900` | #3a3e3f | Dark text, footer (dark variant) |
| `--ol__monochrome__950` | #17191a | Body text |

### Base Colors

| Variable | Hex Value |
|----------|-----------|
| `--white` | #ffffff |
| `--black` | #000000 |

---

## Spacing System

The spacing system follows a 4px base unit with a geometric scale.

| Variable | Value | Common Usage |
|----------|-------|--------------|
| `--spacing__0` | 0px | No spacing |
| `--spacing__1` | 4px | Minimal spacing, list gaps |
| `--spacing__2` | 8px | Form group gap, small padding |
| `--spacing__3` | 12px | Card padding, component gaps |
| `--spacing__4` | 16px | Section padding, medium gaps |
| `--spacing__5` | 20px | - |
| `--spacing__6` | 24px | Modal padding, large gaps |
| `--spacing__7` | 28px | - |
| `--spacing__8` | 32px | Button horizontal padding |
| `--spacing__9` | 36px | - |
| `--spacing__10` | 40px | - |
| `--spacing__11` | 44px | - |
| `--spacing__12` | 48px | - |
| `--spacing__14` | 56px | - |
| `--spacing__16` | 64px | - |
| `--spacing__20` | 80px | - |
| `--spacing__24` | 96px | - |
| `--spacing__28` | 112px | - |
| `--spacing__32` | 128px | - |
| `--spacing__36` | 144px | - |
| `--spacing__40` | 160px | - |
| `--spacing__44` | 176px | - |
| `--spacing__48` | 192px | - |
| `--spacing__52` | 208px | - |
| `--spacing__56` | 224px | - |
| `--spacing__60` | 240px | - |
| `--spacing__64` | 256px | - |
| `--spacing__72` | 288px | - |
| `--spacing__80` | 320px | - |
| `--spacing__96` | 384px | - |

---

## Border Radius

| Variable | Value | Usage |
|----------|-------|-------|
| `--radius__none` | 0px | No rounding |
| `--radius__xs` | 2px | - |
| `--radius__sm` | 4px | Buttons, badges |
| `--radius__md` | 6px | Price boxes |
| `--radius__lg` | 8px | Cards, inputs, banners |
| `--radius__xl` | 12px | - |
| `--radius__2xl` | 16px | Modal containers |
| `--radius__3xl` | 24px | - |
| `--radius__4xl` | 32px | - |
| `--radius__full` | 9999px | Fully rounded |

---

## Border Widths

| Variable | Value |
|----------|-------|
| `--borderwidth__0` | 0px |
| `--borderwidth__1` | 1px |
| `--borderwidth__2` | 2px |
| `--borderwidth__4` | 4px |
| `--borderwidth__8` | 8px |

---

## Components

### Modal Container (`.pn-modal`)

The main container for modal dialogs.

**Base Styles:**
- Display: Flex (column)
- Padding: `24px 16px 16px` (top, horizontal, bottom)
- Border Radius: 16px
- Background: White
- Gap: 12px

**Variants:**

| Class | Background Color | Usage |
|-------|-----------------|--------|
| `.pn-modal--white` | White | Default, clean modals |
| `.pn-modal--yellow` | Yellow 500 | Promotional modals |
| `.pn-modal--red` | Red 700 | High-emphasis CTAs |

**Alignment Modifiers:**

| Class | Alignment | Text Align |
|-------|-----------|------------|
| `.pn-modal--left` | Left | Left |
| `.pn-modal--center` | Center | Center |

**Responsive Behavior:**
- On desktop (648px+), some modals split into two columns:
  - `.pn-modal__container-left`: Left content (flex-basis: auto)
  - `.pn-modal__container`: Right content (fixed 350px width)

---

### Buttons (`.btn`)

**Base Styles:**
- Display: Inline-flex
- Height: 56px
- Padding: `0 32px`
- Border Radius: 4px
- Font: Inter, Bold (700), 16px
- Line Height: 1.35
- Transition: Background color (125ms ease-in-out)

**Variants:**

| Class | Background | Text Color | Hover |
|-------|------------|------------|-------|
| `.btn--red` | Red 700 | White | Red 800 |
| `.btn--yellow` | Yellow 500 | Yellow 950 | Yellow 600 |
| `.btn--black` | Monochrome 950 | White | Monochrome 900 |

**Modifiers:**
- `.btn--full`: Full width (100%)

**Context-Specific Variants:**
- Inside `.pn-modal--red`, `.btn--red` uses yellow background
- Inside `.riba`, buttons have reduced height (28px) and padding

---

### Cards (`.card`)

Cards are content containers used for pricing and feature displays.

**Base Styles:**
- Display: Flex (column)
- Width: 100%
- Padding: `12px 12px`
- Border Radius: 8px
- Background: White
- Gap: 12px

**Variants:**

| Class | Background | Text Color |
|-------|------------|------------|
| `.card--white` | White | Default |
| `.card--red` | Red 700 | White |

**Modifiers:**
- `.card--center`: Centered alignment and text

**Responsive:**
- On large screens (980px+), cards in `.section--red-light` display in a 3-column grid

---

### Inputs (`.input`)

**Base Styles:**
- Width: 100%
- Height: 56px
- Padding: `0 12px`
- Border: 1px solid Monochrome 200
- Border Radius: 8px
- Font: Inter, Medium (500), 16px
- Background: White
- Transition: Border color (125ms)

**States:**
- **Focus:** Border changes to Red 700
- **Error:** `.input--error` - Border Red 700
- **Placeholder:** Monochrome 200

---

### Form Group (`.form-group`)

Container for form inputs and buttons.

**Base Styles:**
- Display: Flex (column)
- Width: 100%
- Gap: 8px

---

### Lists (`.list`)

**Base Styles:**
- Display: Flex (column)
- Gap: 4px

**List Items (`.list__item`):**
- Display: Flex
- Align Items: Flex-start
- Gap: 8px
- Text Align: Left

**List Bullet (`.list__bullet`):**
- Size: 12px × 12px
- Margin Top: 4px
- Background: SVG checkmark icon (red or yellow depending on context)

**List Text (`.list__text`):**
- Font: Inter, Medium (500), 16px
- Line Height: 1.35
- Color: Adapts to background (Monochrome 950, Yellow 950, or White)
- Strong text uses Bold weight

---

### Prices

**`.price`:**
- Font: Inter, Bold (700), 16px
- Color: Monochrome 950
- Strong/value text uses Red 700 and Extrabold (800)

**`.price--lg`:**
- Font: Fira Sans Condensed, Bold (700), 36px
- Line Height: 1
- Text Align: Center
- Color: Red 700 (or Yellow 500 in red contexts)

**`.price--xl`:**
- Font: Fira Sans Condensed, Bold (700), 48px
- Line Height: 1.35
- Text Align: Center
- Color: Red 700 (or Yellow 500 in red contexts)

**`.price__period`:**
- Font: Fira Sans Condensed, Medium (500), 16px
- Color: Monochrome 900 (or White in red cards)

**`.price__original`:**
- Font: Inter, Medium (500), 12px
- Color: Monochrome 950
- Margin Top: -8px (to bring closer to main price)
- Text Align: Center

**`.price-group`:**
- Display: Flex (column)
- Gap: 0 (prices are stacked tightly)

**`.price-box`:**
- Display: Inline-flex
- Padding: `8px 16px`
- Border: 1px dashed Monochrome 100
- Border Radius: 6px
- Centered content

**`.price-box--featured`:**
- Border Color: Red 800

---

### Badge (`.badge`)

**Base Styles:**
- Display: Inline-flex
- Width: 100%
- Padding: 12px
- Border Radius: 4px
- Font: Inter, Bold (700), 16px
- Line Height: 1.2
- Text Transform: Uppercase
- Text Align: Center
- Background: White
- Color: Red 700

**Usage:** "TELLIJATE LEMMIK" (Subscriber's Favorite)

---

### Banner (`.banner`)

**Base Styles:**
- Display: Flex (column)
- Width: 100%
- Padding: 16px
- Border Radius: 8px
- Background: Yellow 400
- Text Align: Center
- Gap: 16px

**Banner Text (`.banner__text`):**
- Font: Inter, Medium (500), 16px
- Color: Yellow 900

**Banner Link (`.banner__link`):**
- Font: Inter, Bold (700)
- Color: Red 700
- Text Decoration: Underline
- Cursor: Pointer

---

### Riba (Top Banner Bar)

The Riba component is a compact horizontal bar for subscription CTAs.

**`.riba`:**
- Display: Flex
- Justify Content: Space-between
- Align Items: Center
- Width: 100%
- Padding: `4px 12px`
- Background: Yellow 500
- Gap: 12px
- Border Radius: 0 (mobile), 6px (desktop 680px+)

**`.riba__text`:**
- Font: Inter, Bold (700), 16px
- Color: Black
- Flex: 1

**`.riba .btn`:**
- Height: 28px (reduced from standard 56px)
- Padding: `0 8px`
- Font Size: 16px
- Text Transform: Uppercase

---

### Sections (`.section`)

**Base Styles:**
- Padding: 16px

**Variants:**

| Class | Background | Padding |
|-------|------------|---------|
| `.section--white` | White | 0 |
| `.section--red-light` | Red 100 | 16px |
| `.section--yellow-bright` | Yellow 400 | 16px |

**`.section--red-light`:**
- Display: Flex (column on mobile, row on desktop 980px+)
- Gap: 12px
- Used for pricing card grids

---

### Links (`.link`)

**Base Styles:**
- Font: Inter, Medium (500), 16px
- Line Height: 1.35
- Color: Red 700
- Text Decoration: Underline
- Cursor: Pointer
- Transition: Color (125ms ease-in-out)

**Hover:** Red 800

**Variants:**
- `.link--bold`: Bold weight

---

### FAQ Component (`.faq`)

**Base Styles:**
- Display: Flex (column)
- Gap: 16px

**`.faq__question`:**
- Font: Inter, Bold (700), 16px
- Color: Black

**`.faq__answer`:**
- Font: Inter, Medium (500), 16px
- Color: Monochrome 950

---

## Layout Patterns

### 1. Simple Centered Modal

**Structure:**
```html
<div class="pn-modal pn-modal--white pn-modal--center">
  <h1 class="pn-modal__title">Title</h1>
  <p class="pn-modal__text">Description</p>
  <button class="btn btn--red">CTA</button>
</div>
```

**Use Cases:** Simple messages, confirmations (retention, passive_churn)

---

### 2. Left-Aligned Modal

**Structure:**
```html
<div class="pn-modal pn-modal--white pn-modal--left">
  <h1 class="pn-modal__title">Title</h1>
  <p class="pn-modal__text">Description</p>
  <button class="btn btn--red">CTA</button>
  <p class="pn-modal__footer">Footer text</p>
</div>
```

**Use Cases:** Newsletter signup, simple CTAs

---

### 3. Two-Column Modal (Mobile: Stack, Desktop: Side-by-Side)

**Structure:**
```html
<div class="pn-modal pn-modal--yellow pn-modal--left">
  <div class="pn-modal__container-left">
    <h1 class="pn-modal__title">Title</h1>
    <h2 class="pn-modal__subtitle">Subtitle</h2>
    <ul class="list">
      <!-- List items -->
    </ul>
  </div>
  
  <div class="pn-modal__container">
    <div class="card card--white card--center">
      <!-- Price and CTA -->
    </div>
    <div class="banner">
      <!-- Login prompt -->
    </div>
    <p class="pn-modal__footer">Terms</p>
  </div>
</div>
```

**Responsive Breakpoint:** 648px

**Use Cases:** Promotional modals with benefits list and pricing card (join_digi-1, join_digi-2)

---

### 4. Multi-Section Landing Page

**Structure:**
```html
<!-- Header Section -->
<div class="section section--white">
  <div class="pn-modal pn-modal--white pn-modal--left">
    <!-- Header content -->
  </div>
</div>

<!-- Pricing Cards Section -->
<div class="section section--red-light">
  <div class="card card--red card--center">
    <!-- Featured card -->
  </div>
  <div class="card card--white card--center">
    <!-- Standard card -->
  </div>
  <div class="card card--white card--center">
    <!-- Annual card -->
  </div>
  <button class="btn btn--red">Business CTA</button>
</div>
```

**Responsive Breakpoint:** 980px
- Mobile: Single column
- Desktop: 3-column grid

**Use Cases:** Full landing pages with multiple pricing tiers (join_digi-landing)

---

### 5. Form with Input Validation

**Structure:**
```html
<div class="form-group">
  <div class="input-wrapper" id="email-wrapper">
    <input type="email" class="input" placeholder="Email">
    <label class="input-error" for="user-email"></label>
    <svg class="input-error-icon"><!-- Error icon --></svg>
  </div>
  <button class="btn btn--red">Submit</button>
</div>
```

**States:**
- Default: Monochrome 200 border
- Focus: Red 700 border
- Error: `.input-wrapper--bad` with Red 700 border and error icon

**Use Cases:** Email collection, phone number input (join_newsletter-input, buy_one)

---

### 6. Top Banner Bar (Riba)

**Structure:**
```html
<div class="riba">
  <div class="riba__text">Promotional text</div>
  <button class="btn btn--red">CTA</button>
</div>
```

**Use Cases:** Non-intrusive subscription prompts, top-of-page banners

---

## Theme Variants

### Color Theming System

Components automatically adapt their colors based on their parent container's background:

#### White Background (`.pn-modal--white`)
- Title: Red 700
- Text: Monochrome 950
- Footer: Monochrome 500
- Buttons: Standard variants

#### Yellow Background (`.pn-modal--yellow`)
- Title: Red 700
- Text: Yellow 950
- Footer: Yellow 900
- List bullets: Red checkmark

#### Red Background (`.pn-modal--red`)
- Title: Yellow 500
- Text: White
- Footer: White
- Buttons: `.btn--red` becomes yellow
- List bullets: Yellow checkmark

---

## Best Practices

### 1. Typography Hierarchy
- Use `.pn-modal__title` for main headings (Fira Sans Condensed)
- Use `.pn-modal__subtitle` for section headings (Inter Bold)
- Use `.pn-modal__text` for body content (Inter Medium)
- Use `.pn-modal__footer` for disclaimers and fine print

### 2. Spacing
- Maintain consistent gaps using the spacing scale
- Modal internal gap: 12px (`--spacing__3`)
- Section padding: 16px (`--spacing__4`)
- Button/input padding: Use predefined component padding

### 3. Color Usage
- Primary CTA: Red 700 (`.btn--red`)
- Secondary CTA: Yellow 500 (`.btn--yellow`)
- Text on colored backgrounds: Ensure sufficient contrast
- Links: Always Red 700 with underline

### 4. Responsive Design
- Mobile-first approach
- Key breakpoints: 648px (two-column modals), 680px (riba), 980px (landing page grid)
- Test on both mobile and desktop viewports

### 5. Accessibility
- Maintain color contrast ratios
- Provide hover states for interactive elements
- Use semantic HTML structure
- Ensure focus states are visible

---

## Maintenance Notes

### CSS Reset Strategy
The design system uses a scoped reset that only applies to `.pn-modal`, `.card`, and `.section` elements to prevent parent styles from interfering. Intentional spacing is then re-applied through component classes.

### Vendor Prefixes
The CSS includes vendor prefixes for cross-browser compatibility:
- `-webkit-` for Chrome/Safari
- `-moz-` for Firefox
- `-ms-` for IE/Edge
- `-o-` for Opera

### Font Smoothing
Applied globally to `body`:
```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

---

**Last Updated:** January 19, 2026
