# Profile Pages Design System Migration Plan

## Overview

This document outlines the comprehensive plan for migrating the Piano ID profile pages (login and registration) to align with the Õhtuleht design system while preserving existing functionality.

**Files to Migrate:**
- `piano-id-login-page.html` (1039 lines)
- `piano-id-register-page.html` (1107 lines)  
- `piano-id-layout-old.css` (2332 lines) - **KEEP INTACT**

**Strategy:** Create a new overlay CSS file (`piano-id-design-system.css`) that uses the design system tokens to override/supplement the existing styles without removing `piano-id-layout-old.css`.

---

## Phase 1: Analysis & Inventory

### 1.1 Current CSS Structure Analysis

The existing `piano-id-layout-old.css` contains:

**Font Definitions:**
- Roboto (300, 400, 500 weights, italic variants)
- Fira Sans Condensed (600 weight)
- Uses Roboto as primary font vs Design System's Inter

**Current Color Palette:**
- Primary CTA: `#e3000f` (matches design system Red 700!)
- Primary CTA Hover: `#b6000c`
- Link Blue: `#3b67b2`
- Text: `#3e4148`, `#151515`, `#0f0f15`
- Social Media branded colors (Facebook, Google, Twitter, LinkedIn, Apple)
- Error: `#f14e1b`, `#f23d3d`

**Component Patterns Identified:**
1. `.pane` - Main container
2. `.logo` - Logo display (80x80px, white bg, border)
3. `.input`, `input[type]` - Form inputs (48px height, 6px radius)
4. `.btn` - Buttons (Red primary, variations for social, outline)
5. `.checkbox` - Custom checkbox with SVG checkmark
6. `.social-buttons-wrapper` - Social login grid
7. `.custom-field` - Custom form fields with icons
8. `.error-message`, `.validation-error` - Error states
9. Preloader skeleton states (`.p-*` classes)
10. Dark mode support (@media prefers-color-scheme: dark)

### 1.2 Design System Comparison

| Element | Current | Design System | Migration Action |
|---------|---------|---------------|------------------|
| **Primary Font** | Roboto | Inter | Override with Inter |
| **Heading Font** | Roboto | Fira Sans Condensed | Align (already uses Fira) |
| **Primary CTA** | #e3000f | Red 700 (#e3000f) | ✅ Already aligned! |
| **CTA Hover** | #b6000c | Red 800 (#af0510) | Update to design system |
| **Input Height** | 48px | 56px | Update to 56px for consistency |
| **Border Radius (Cards)** | 10px | 16px (2xl) | Update modal radius |
| **Border Radius (Inputs)** | 6px | 8px (lg) | Update to 8px |
| **Border Radius (Buttons)** | 6px | 4px (sm) | Update to 4px |
| **Spacing Scale** | Fixed pixels | Design tokens | Map to tokens |
| **Error Color** | #f14e1b | Red 700 (#e3000f) | Align with DS |

---

## Phase 2: Design System Token Mapping

### 2.1 Typography Mappings

```css
/* Current → Design System */
.lead → Use .pn-modal__title styles (Fira, 24px, Bold)
.sub-lead, .agreement → Use .pn-modal__text styles (Inter, 14px, Medium)
body text → Inter 14px → 16px (align with DS base size)
```

### 2.2 Color Mappings

```css
/* Primary Actions */
--btn-bg: #e3000f → var(--ol__red__700)
--btn-hover: #b6000c → var(--ol__red__800)

/* Text Colors */
--text-primary: #3e4148 → var(--ol__monochrome__950)
--text-secondary: rgba(15, 15, 21, 0.5) → var(--ol__monochrome__500)
--text-placeholder: rgba(15, 15, 21, 0.3) → var(--ol__monochrome__200)

/* Borders */
--border-color: rgba(15, 15, 21, 0.1) → var(--ol__monochrome__200)
--border-focused: rgba(15, 15, 21, 0.3) → var(--ol__red__700)

/* Links */
--link-color: #3b67b2 → var(--ol__red__700)
--link-hover: #345a9a → var(--ol__red__800)

/* Errors */
--error-color: #f14e1b → var(--ol__red__700)
--error-border: rgba(242, 61, 61, 0.3) → var(--ol__red__700) with 0.3 opacity
```

### 2.3 Spacing Mappings

```css
/* Current → Design System Tokens */
margin-top: 26px → var(--spacing__6) /* 24px - close enough */
margin-top: 16px → var(--spacing__4) /* 16px - exact match */
padding: 11px 16px → var(--spacing__3) var(--spacing__4) /* 12px 16px */
margin-bottom: 24px → var(--spacing__6) /* 24px - exact */
padding: 24px → var(--spacing__6) /* 24px - exact */
```

### 2.4 Component Sizing

```css
/* Inputs */
height: 48px → 56px (var(--spacing__14))

/* Buttons */  
height: 48px (from padding) → 56px

/* Logo */
width: 80px, height: 80px → Keep as-is (specific branding)

/* Checkbox */
width: 14px, height: 14px → Keep (specific to checkboxes)
```

---

## Phase 3: Step-by-Step Migration Plan

### Step 1: Create New Design System CSS File ✓

**File:** `piano-id-design-system.css`

**Actions:**
1. Import design system fonts (Inter, Fira Sans Condensed)
2. Import design tokens from `../style.css` or redefine locally
3. Document all existing selectors with comments
4. Create override structure

### Step 2: Typography Migration

**Selectors to Update:**
- `body` - Change font-family to Inter
- `.lead` - Apply Fira Sans Condensed bold
- `.sub-lead`, `.agreement` - Apply Inter medium
- All text elements

**Approach:**
```css
body {
  font-family: var(--font__family__inter);
  font-size: var(--font__size__base); /* 16px vs 14px */
}

.lead {
  font-family: var(--font__family__fira);
  font-weight: var(--font__weight__bold);
  font-size: var(--font__size__2xl); /* 24px */
}
```

### Step 3: Color System Migration

**Selectors to Update:**
- `.btn` (primary button)
- `a`, `.link` (links)
- `.input`, form fields
- `.error-message`, error states
- Border colors throughout

**Approach:**
```css
.btn {
  background: var(--ol__red__700);
}

.btn:hover, .btn:active {
  background: var(--ol__red__800);
}

a, .link {
  color: var(--ol__red__700);
}

.input:focus {
  border-color: var(--ol__red__700);
}
```

### Step 4: Spacing & Sizing Updates

**Key Changes:**
- Input height: 48px → 56px
- Border radius on inputs: 6px → 8px (var(--radius__lg))
- Border radius on buttons: 6px → 4px (var(--radius__sm))
- Border radius on modal: 10px → 16px (var(--radius__2xl))
- Consistent spacing using design tokens

**Selectors:**
- `.input`, `input[type]`
- `.btn`
- `.piano-id-modal`
- All margin/padding values

### Step 5: Component Alignment

**Buttons:**
- Update height to 56px
- Update border-radius to 4px
- Ensure Inter font
- Verify padding alignment

**Form Inputs:**
- Update height to 56px
- Update border-radius to 8px
- Update focus state colors
- Placeholder color alignment

**Checkboxes:**
- Keep existing size (14x14px)
- Update colors to design system
- Verify focus/hover states

**Social Buttons:**
- Keep branded colors (Facebook blue, Google, etc.)
- But adjust hover states if needed
- Ensure consistent spacing

### Step 6: Preserve Existing Functionality

**Critical Items to NOT Change:**
- All `.p-*` preloader classes and animations
- Dark mode media queries
- Angular-specific classes (`[_nghost-*]`, `[_ngcontent-*]`)
- JavaScript-dependent classes
- Data attributes (`[data-switch-case]`, `[data-e2e]`)
- Screen state classes (`.screen-login_confirm`)
- Custom field types (`.custom-field-type-*`)
- Social login integration

### Step 7: Responsive Behavior

**Existing Breakpoints:**
- `max-width: 360px` - Social button stacking
- Prefers-color-scheme: dark

**Actions:**
- Preserve all existing breakpoints
- Add new breakpoints from design system if beneficial (648px, 980px)
- Ensure mobile-first approach

### Step 8: Accessibility Enhancements

**Current Accessibility Features:**
- `.sr-only` for screen readers
- `aria-*` attributes in HTML
- Focus states on inputs/buttons

**Enhancements:**
- Ensure color contrast ratios meet WCAG AA
- Verify focus indicators are visible
- Test keyboard navigation
- Ensure error states are accessible

---

## Phase 4: Testing Checklist

### 4.1 Visual Regression Testing

- [ ] Login page renders correctly
- [ ] Registration page renders correctly
- [ ] Social login buttons display properly
- [ ] Form inputs match design system
- [ ] Buttons match design system
- [ ] Error states are visible and clear
- [ ] Preloader animations work
- [ ] Dark mode functions correctly

### 4.2 Functional Testing

- [ ] Form submission works
- [ ] Validation errors display correctly
- [ ] Social logins trigger properly
- [ ] Remember me checkbox functions
- [ ] Password visibility toggle works
- [ ] Custom field interactions work
- [ ] Date pickers function
- [ ] Select dropdowns work
- [ ] Language switcher works

### 4.3 Responsive Testing

- [ ] Mobile (320px - 480px)
- [ ] Tablet (481px - 768px)
- [ ] Desktop (769px+)
- [ ] Large desktop (1200px+)

### 4.4 Browser Compatibility

- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### 4.5 Accessibility Testing

- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Focus indicators
- [ ] Color contrast
- [ ] ARIA labels

---

## Phase 5: Implementation Order

### Priority 1: Foundation (Week 1)
1. Create `piano-id-design-system.css` with all selectors documented
2. Import design tokens (fonts, colors, spacing)
3. Update typography (fonts, sizes, weights)
4. Update primary colors (buttons, links, text)

### Priority 2: Components (Week 2)
1. Update button styles (height, radius, colors)
2. Update input styles (height, radius, borders, focus states)
3. Update error states
4. Test form submission flow

### Priority 3: Polish (Week 3)
1. Update all spacing to use design tokens
2. Refine responsive behavior
3. Dark mode verification
4. Cross-browser testing

### Priority 4: QA & Launch (Week 4)
1. Full regression testing
2. Accessibility audit
3. Performance check
4. Documentation update
5. Deployment

---

## Phase 6: File Organization

### Recommended Structure:

```
profile/
├── piano-id-login-page.html (unchanged)
├── piano-id-register-page.html (unchanged)
├── piano-id-layout-old.css (unchanged - legacy styles)
├── piano-id-design-system.css (NEW - design system overrides)
└── PROFILE_MIGRATION_PLAN.md (this file)
```

### Load Order in HTML:

```html
<link rel="stylesheet" href="../style.css"> <!-- Main design system -->
<link rel="stylesheet" href="piano-id-layout-old.css"> <!-- Legacy styles -->
<link rel="stylesheet" href="piano-id-design-system.css"> <!-- DS overrides -->
```

---

## Phase 7: Risk Assessment & Mitigation

### High Risk Areas:

1. **Preloader Animations**
   - Risk: Breaking skeleton loading states
   - Mitigation: Don't touch `.p-*` classes, test thoroughly

2. **Social Login Integrations**
   - Risk: Breaking third-party auth flows
   - Mitigation: Keep all social button classes intact

3. **Custom Field Types**
   - Risk: Breaking dynamic form fields
   - Mitigation: Preserve all `.custom-field-type-*` classes

4. **Angular Components**
   - Risk: Breaking Angular-specific styling
   - Mitigation: Don't modify `[_nghost-*]` or `[_ngcontent-*]` selectors

### Medium Risk Areas:

1. **Form Validation**
   - Risk: Error states not displaying correctly
   - Mitigation: Thorough testing of all validation scenarios

2. **Dark Mode**
   - Risk: Colors not working in dark mode
   - Mitigation: Test both light and dark modes

3. **Mobile Responsiveness**
   - Risk: Layout breaking on small screens
   - Mitigation: Mobile-first testing

### Low Risk Areas:

1. **Typography**
   - Risk: Minimal, fonts are flexible
   - Mitigation: Visual comparison testing

2. **Spacing**
   - Risk: Low impact on functionality
   - Mitigation: Visual regression tests

---

## Phase 8: Success Criteria

### Visual Alignment:
- ✅ Fonts match design system (Inter, Fira Sans Condensed)
- ✅ Colors use design tokens (Red 700 for primary, etc.)
- ✅ Spacing follows 4px grid
- ✅ Border radius aligns (4px buttons, 8px inputs, 16px modal)
- ✅ Component heights match (56px for inputs/buttons)

### Functional Integrity:
- ✅ All form submissions work
- ✅ All validations trigger correctly
- ✅ Social logins function
- ✅ Preloader displays correctly
- ✅ Dark mode works
- ✅ No console errors

### Code Quality:
- ✅ CSS is organized and commented
- ✅ Design tokens used throughout
- ✅ No duplicate rules
- ✅ Follows BEM-like naming where appropriate
- ✅ Maintainable and documented

### Performance:
- ✅ No increase in load time
- ✅ Smooth animations
- ✅ Fast form interactions

---

## Phase 9: Documentation Requirements

### Developer Documentation:
1. Update README with new CSS architecture
2. Document design token usage
3. Create component examples
4. Note any deviations from design system

### Designer Documentation:
1. Visual style guide updates
2. Component library updates
3. Accessibility notes

---

## Phase 10: Rollback Plan

In case of critical issues:

1. **Immediate Rollback:**
   - Remove `<link rel="stylesheet" href="piano-id-design-system.css">` from HTML
   - System reverts to original `piano-id-layout-old.css`
   - Zero downtime

2. **Partial Rollback:**
   - Comment out specific sections in `piano-id-design-system.css`
   - Allows gradual migration with safety net

3. **Testing Environment:**
   - Always test in staging first
   - Have production backup ready

---

## Conclusion

This migration plan ensures a systematic, safe transition to the design system while preserving all existing functionality. By creating an overlay CSS file (`piano-id-design-system.css`) rather than modifying the original styles, we maintain a clear rollback path and minimize risk.

**Estimated Timeline:** 4 weeks
**Risk Level:** Medium (mitigated by careful planning)
**Expected Outcome:** Fully aligned with design system while maintaining 100% functionality

---

**Next Step:** Create `piano-id-design-system.css` with all selectors and begin Phase 5 implementation.
