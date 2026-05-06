# Tourism Frontend Carousel & Dots Implementation Report

## Executive Summary
The tourism frontend codebase contains **7 main carousel/dots implementations** across components and pages, with varying styling approaches and mobile responsiveness strategies. This report details all carousel implementations, their CSS rules at different breakpoints, image display techniques, and styling patterns.

---

## 1. CAROUSEL/DOTS IMPLEMENTATIONS INVENTORY

### 1.1 Hero Section Carousel
**Location:** `frontend/src/components/Hero.jsx` & `Hero.css`

**Implementation Details:**
- **Type:** Full-bleed background slideshow with fade transitions
- **Auto-advance:** 5000ms interval (SLIDE_DURATION)
- **Fade duration:** 900ms
- **Navigation:** Dots + numeric counter
- **Images:** Mix of videos and images with lazy loading

**Key JSX Elements:**
```jsx
// Hero slides rendering
.hero__slide (positioned absolutely with object-fit: cover)
.hero__dots (dot navigation at bottom-center)
.hero__counter (numeric indicator at bottom-right)
```

**Dot Styling (Default - Desktop):**
```css
.hero__dots {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.hero__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(0, 0, 0, .20);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: background .3s, transform .3s, width .3s;
}

.hero__dot--active {
  background: var(--gold-warm, #E5B83C);
  transform: scale(1.2);
  width: 18px;
  border-radius: 3px;
}
```

**Mobile Breakpoints:**
- **@media (max-width: 768px):**
  ```css
  .hero__dots { 
    bottom: 50px;
    gap: 6px;
  }
  .hero__dot {
    width: 5px;
    height: 5px;
  }
  .hero__dot--active {
    width: 12px;
    transform: scale(1.1);
  }
  ```

- **@media (max-width: 600px):**
  ```css
  /* Dots continue from above but positioned differently */
  ```

---

### 1.2 Destinations Carousel (Card Image Slideshow)
**Location:** `frontend/src/components/Destinations.jsx` & `Destinations.css`

**Implementation Details:**
- **Type:** Per-card image carousel with crossfade
- **Auto-advance:** 3500ms interval (CYCLE_INTERVAL)
- **Animation:** 400ms fade transition
- **Navigation:** Small dot indicator strip at bottom of cards
- **Images:** Multiple photos per destination with error handling

**Key JSX Elements:**
```jsx
// Per-card component: SiteCard
// Image cycling with useCycleIndex hook
.dest__dots (small dots at bottom of card image)
```

**Image Styling:**
```css
.dest__slide {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transform: scale(1.04);
  transition: opacity .45s ease, transform .45s ease;
  will-change: opacity, transform;
}

.dest__slide--active {
  opacity: 1;
  transform: scale(1);
}

.dest__card:hover .dest__slide--active {
  transform: scale(1.06);
}

.dest__slide--out {
  opacity: 0;
  transform: scale(1.06);
  transition: opacity .4s ease, transform .4s ease;
}
```

**Dot Styling (Desktop):**
```css
.dest__dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
  z-index: 2;
}

.dest__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255,255,255,.65);
  transition: background .3s, transform .3s, width .3s;
}

.dest__dot--active {
  background: var(--gold-warm);
  transform: scale(1.3);
  width: 8px;
}
```

**Mobile Breakpoint (max-width: 560px):**
```css
.dest__dots {
  gap: 3px;
}

.dest__dot {
  width: 3px;
  height: 3px;
}

.dest__dot--active {
  transform: scale(1.2);
  width: 6px;
}
```

**Card Container:**
```css
.dest__card-img {
  height: 210px;
  overflow: hidden;
  position: relative;
  background: var(--ash-soft, #F3F4F6);
}

/* Dark gradient overlay for text legibility */
.dest__card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(26,21,8,.45) 0%, transparent 55%);
  pointer-events: none;
  z-index: 1;
}
```

---

### 1.3 Stories/Journal Carousel
**Location:** `frontend/src/components/Stories.jsx` & `Stories.css`

**Implementation Details:**
- **Type:** Full-width text + image carousel with directional transitions
- **Auto-advance:** 6000ms interval (AUTO_INTERVAL)
- **Animation:** 520ms slide transitions (directional - left/right)
- **Navigation:** Dots + arrow buttons + progress bar
- **Layout:** Two-column (image left, text right) on desktop; stacked on mobile

**Key JSX Elements:**
```jsx
// Carousel with directional animations
.stories__carousel (grid layout)
.stories__img-wrap (image panel with animation)
.stories__body (text panel with animation)
.stories__dots (dot navigation)
.stories__progress (bottom progress bar)
```

**Image Styling:**
```css
.stories__img-wrap {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 4/3;
  background: var(--ash-pale, #E5E5E5);
  box-shadow: 0 12px 40px rgba(0,0,0,.12);
}

.stories__img-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.stories__img--active {
  opacity: 1;
  transform: translateX(0) scale(1);
  transition: opacity .52s ease, transform .52s ease;
}

.stories__img--exit-next {
  opacity: 0;
  transform: translateX(-6%) scale(.97);
  transition: opacity .52s ease, transform .52s ease;
}

.stories__img--exit-prev {
  opacity: 0;
  transform: translateX(6%) scale(.97);
  transition: opacity .52s ease, transform .52s ease;
}
```

**Dot Styling (Desktop):**
```css
.stories__dots {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 4px;
}

.stories__dot-btn {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(0,0,0,.18);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: background .3s, width .3s, border-radius .3s, transform .2s;
}

.stories__dot-btn--active {
  background: var(--gold-warm, #E5B83C);
  width: 24px;
  border-radius: 4px;
  transform: none;
}
```

**Progress Bar:**
```css
.stories__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0,0,0,.10);
  z-index: 2;
}

.stories__progress-bar {
  height: 100%;
  background: var(--gold-warm, #E5B83C);
  width: 0%;
  animation: storiesProgress linear forwards;
}

@keyframes storiesProgress {
  from { width: 0%; }
  to   { width: 100%; }
}
```

**Mobile Breakpoint (max-width: 860px):**
```css
.stories__carousel {
  grid-template-columns: 1fr;
  gap: 32px;
}

.stories__img-wrap { aspect-ratio: 16/9; }
```

**Mobile Breakpoint (max-width: 560px):**
```css
.stories { padding: 60px 0 72px; }
.stories__header { flex-direction: column; align-items: flex-start; gap: 20px; }
.stories__slide-title { font-size: 20px; }
```

---

### 1.4 Tours Section (Circle Images with Rings)
**Location:** `frontend/src/components/ToursSection.jsx` & `ToursSection.css`

**Implementation Details:**
- **Type:** Static layout with animated circle images (no carousel)
- **Image Treatment:** Rough organic circle shapes with decorative gold rings
- **Animation:** Rotating brush stroke ring around each image
- **Navigation:** N/A (zigzag layout with multiple items visible)
- **Special Feature:** SVG clip-path for rough organic circle shapes

**Circle Image Styling:**
```css
.ts__circle-wrap {
  position: relative;
  flex-shrink: 0;
  width: 290px;
  height: 290px;
}

/* Outer rough organic gold ring SVG */
.ts__ring-outer {
  position: absolute;
  inset: -18px;
  width: calc(100% + 36px);
  height: calc(100% + 36px);
  pointer-events: none;
  z-index: 0;
}

/* Brush-stroke ring with drips & spatter */
.ts__ring-brush {
  position: absolute;
  inset: -20px;
  width: calc(100% + 40px);
  height: calc(100% + 40px);
  pointer-events: none;
  z-index: 0;
  animation: tsRingSpin 40s linear infinite;
}

@keyframes tsRingSpin {
  to { transform: rotate(360deg); }
}

/* The image itself — clipped by SVG rough blob */
.ts__circle {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  z-index: 1;
  border-radius: 50%;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 0 0 5px rgba(212,175,55,0.15);
}

.ts__circle-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 0.5s ease;
}

.ts__circle:hover .ts__circle-img {
  transform: scale(1.08);
}
```

**Mobile Breakpoint (max-width: 900px):**
```css
.ts__circle-wrap { width: 230px; height: 230px; }
.ts__item { gap: 32px; }
```

**Featured Badge (Overlay):**
```css
.ts__badge {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .04em;
  background: rgba(197,160,40,0.92);
  color: #fff;
  z-index: 3;
  backdrop-filter: blur(6px);
  white-space: nowrap;
}
```

---

### 1.5 Reviews Section Carousel
**Location:** `frontend/src/components/ReviewsSection.jsx` & `ReviewsSection.css`

**Implementation Details:**
- **Type:** Single-card review carousel with navigation arrows
- **Auto-advance:** 5000ms interval
- **Animation:** Fade-in on card change
- **Navigation:** Previous/Next buttons + dots
- **Content:** Reviews fetched from API

**Dot Styling (Desktop):**
```css
.reviews-section__dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.reviews-section__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: #ddd;
  cursor: pointer;
  transition: all 0.3s;
  padding: 0;
}

.reviews-section__dot--active {
  background: #C5A028;
  transform: scale(1.25);
  width: 14px;
  height: 14px;
}
```

**Card Animation:**
```css
.reviews-section__card {
  flex: 1;
  text-align: center;
  padding: 28px 28px;
  background: #fafaf7;
  border-radius: 20px;
  animation: reviewFadeIn 0.45s ease;
}

@keyframes reviewFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Mobile Breakpoint (max-width: 768px):**
```css
.reviews-section__dot {
  width: 7px;
  height: 7px;
}

.reviews-section__dot--active {
  transform: scale(1.15);
  width: 10px;
  height: 10px;
}
```

---

### 1.6 Site Detail Hero Image Carousel
**Location:** `frontend/src/pages/SiteDetail.jsx` & `SiteDetail.css`

**Implementation Details:**
- **Type:** Hero image cycler (no auto-advance)
- **Navigation:** Small dot indicators at bottom-right
- **Animation:** Fade-in on image change
- **Images:** Site media images with fallback

**Dot Styling:**
```css
.std__hero-dots {
  position: absolute;
  bottom: 1.5rem;
  right: 2rem;
  z-index: 3;
  display: flex;
  gap: 0.4rem;
}

.std__hero-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  background: transparent;
  cursor: pointer;
  transition: all 0.25s;
  padding: 0;
}

.std__hero-dot--active {
  background: var(--gold-warm, #E5B83C);
  border-color: var(--gold-warm, #E5B83C);
  transform: scale(1.15);
  width: 12px;
  height: 12px;
}
```

**Hero Image:**
```css
.std__hero-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: std-fade-in 0.5s ease;
}

@keyframes std-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

---

### 1.7 Event Ad Modal Carousel
**Location:** `frontend/src/components/EventAdModal.jsx` & `EventAdModal.css`

**Implementation Details:**
- **Type:** Modal carousel showing events/tours
- **Auto-advance:** 5000ms interval
- **Layout:** Two-column (image left, info right)
- **Navigation:** Dots + Previous/Next arrows
- **Special Features:** Days badge, type badges, category labels

**Modal Indicators:**
```css
.event-ad-modal__indicators {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 2;
}

.event-ad-modal__indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.event-ad-modal__indicator:hover {
  background: rgba(255, 255, 255, 0.8);
}

.event-ad-modal__indicator--active {
  background: #C5A028;
  width: 20px;
  border-radius: 3px;
  transform: scale(1.1);
}
```

**Image Section:**
```css
.event-ad-modal__image-section {
  position: relative;
  background: linear-gradient(135deg, #E5B83C 0%, #C5A028 100%);
  overflow: hidden;
}

.event-ad-modal__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.event-ad-modal:hover .event-ad-modal__image {
  transform: scale(1.05);
}
```

**Days Badge (Event Only):**
```css
.event-ad-modal__days-badge {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(26, 21, 8, 0.85);
  backdrop-filter: blur(8px);
  color: #C5A028;
  padding: 12px 16px;
  border-radius: 12px;
  text-align: center;
  z-index: 2;
  border: 2px solid #C5A028;
  animation: slideInUp 0.5s ease-out 0.2s both;
}
```

---

## 2. IMAGE DISPLAY & STYLING PATTERNS

### 2.1 Object-Fit Usage
All image carousels consistently use:
```css
object-fit: cover;        /* Standard across all implementations */
object-position: center;  /* Used in ToursSection for center alignment */
```

### 2.2 Image Transitions & Hover Effects
- **Stories Carousel:** DirectionalSlide + Scale (1.0 → 1.06 on hover)
- **Destinations Carousel:** Subtle zoom (1.04 → 1.0 on active, 1.06 on card hover)
- **Tours Section:** Zoom on image hover (1.0 → 1.08)
- **Event Modal:** Zoom on modal hover (1.0 → 1.05)

### 2.3 Image Clipping/Shaping
- **Tours Section Only:** Uses SVG `<clipPath>` with rough organic blob shape for circular images
- **All Others:** Standard rectangular images with `border-radius` (typically 12-20px)

### 2.4 Aspect Ratios
| Component | Aspect Ratio | Notes |
|-----------|-------------|-------|
| Hero | Full viewport | Full bleed |
| Destinations | Auto (210px height) | Responsive container |
| Stories Desktop | 4/3 | Fixed aspect ratio |
| Stories Mobile | 16/9 | Adjusted for mobile |
| Tours | 1/1 (circles) | 290px diameter (desktop), 230px (tablet) |
| Reviews | Auto | Content-driven height |
| Site Detail Hero | 58vh (420-640px) | Viewport-relative |
| Event Modal | Auto (400px min) | 90% width, max 900px |

---

## 3. MOBILE RESPONSIVENESS SUMMARY

### Breakpoint Strategy
The codebase uses **4 main breakpoints:**
- **Desktop:** 1024px+
- **Tablet:** 768px - 1023px
- **Mobile Large:** 600px - 767px
- **Mobile Small:** < 600px

### Dot Styling Adaptations by Breakpoint

| Component | Desktop | Tablet (768px) | Mobile (600px) | Key Changes |
|-----------|---------|----------------|----------------|------------|
| **Hero** | 7×7px, scale 1.2, width 18px active | 5×5px, scale 1.1, width 12px active | Same as tablet | Smaller dots, reduced scale |
| **Destinations** | 5×5px, scale 1.3, 8px wide active | Same | 3×3px, scale 1.2, 6px wide active | Dramatically smaller on mobile |
| **Stories** | 7×7px, width 24px active | Same | Same | No change; dots reposition below image |
| **Reviews** | 10×10px, scale 1.25 | 7×7px, scale 1.15 | Same | Shrink on tablet |
| **Site Detail** | 10×10px border, scale 1.15 | Same | Same | Consistent throughout |

### Container Adaptations

| Component | Desktop Layout | Tablet | Mobile | Key Changes |
|-----------|---|---|---|---|
| **Hero** | 2 columns (text + mosaic) | 1 column (mosaic hidden) | 1 column | Mosaic hidden at 1024px |
| **Destinations** | 4-column grid | 3 columns (1100px) | 2 columns (760px) / 1 column (560px) | Progressive grid reduction |
| **Stories** | 2-column grid (1.05fr 1fr) | 1 column (860px) | 1 column stacked | Stacked on tablet |
| **Tours** | Flex row + reverse alternation | Gap reduced to 32px (900px) | Single column (600px) | Full width on mobile |
| **Reviews** | Centered flex with nav | Gap reduced (768px) | Nav buttons shrink | Horizontal layout preserved |

---

## 4. CSS VARIABLES & COLOR CONSTANTS

All carousels use consistent color system:

```css
/* Gold/Primary Colors */
--gold-warm:     #E5B83C
--gold-rich:     #C5A028
--gold-antique:  #B8860B
--gold-pale:     #FBF3D5

/* Ash/Neutral Colors */
--ash-deep:      #1A1508
--ash-medium:    #6B6B6B
--ash-light:     #888
--ash-pale:      #ccc
--ash-soft:      #F3F4F6

/* Backgrounds */
--white-off:     #F9F7F2
--dark:          #1A1508
```

---

## 5. ANIMATION PATTERNS

### Auto-Advance Intervals
| Component | Interval | Transition Duration |
|-----------|----------|-------------------|
| Hero Slides | 5000ms | 900ms fade |
| Destinations Cards | 3500ms | 400ms fade |
| Stories Carousel | 6000ms | 520ms directional slide |
| Reviews Cards | 5000ms | 450ms fade |
| Event Modal | 5000ms | N/A (instant switch) |

### Transition Types
- **Fade:** Hero, Destinations, Reviews, Site Detail
- **Directional Slide:** Stories (left/right based on direction)
- **None (Instant):** Event Modal carousel
- **Scale + Translate:** Various hover effects

---

## 6. KEY OBSERVATIONS & ISSUES

### Strengths
1. ✅ Consistent dot styling across components with clear active states
2. ✅ All images use `object-fit: cover` for proper scaling
3. ✅ Mobile breakpoints well-defined with progressive reductions
4. ✅ Color scheme consistent via CSS variables
5. ✅ Accessible navigation with proper ARIA labels

### Potential Issues Found
1. ⚠️ **Tours Section:** Dots not implemented (no carousel, static zigzag layout)
2. ⚠️ **Destinations Mobile:** Extremely small dots (3×3px) may be hard to click on touch devices
3. ⚠️ **Stories Carousel:** No visible dots until scroll/interaction on desktop
4. ⚠️ **SVG Clip-path:** Only used in Tours; not fallback-tested across browsers
5. ⚠️ **Event Modal:** No mobile-specific breakpoint (uses 90% width only)

### Mobile Touch-Friendliness Notes
- Dot sizes on mobile (3-7px) may be below recommended 44px minimum touch target
- Carousel navigation buttons are properly sized (36-44px)
- Consider expanding dot hover areas with ::before/::after pseudo-elements

---

## 7. FILE LOCATION SUMMARY TABLE

| Component | JSX File | CSS File | Dots Implemented | Notes |
|-----------|----------|----------|------------------|-------|
| Hero | `components/Hero.jsx` | `components/Hero.css` | ✅ Yes | Bottom-center, numeric counter |
| Destinations | `components/Destinations.jsx` | `components/Destinations.css` | ✅ Yes | Card overlay, very small on mobile |
| Stories | `components/Stories.jsx` | `components/Stories.css` | ✅ Yes | Text section, expandable active state |
| Tours | `components/ToursSection.jsx` | `components/ToursSection.css` | ❌ No | Static layout, no carousel |
| Reviews | `components/ReviewsSection.jsx` | `components/ReviewsSection.css` | ✅ Yes | Bottom-center, API-driven |
| Site Detail | `pages/SiteDetail.jsx` | `pages/SiteDetail.css` | ✅ Yes | Hero overlay, bottom-right |
| Event Modal | `components/EventAdModal.jsx` | `components/EventAdModal.css` | ✅ Yes | Image section, bottom-right |

---

## 8. HERO MOSAIC PANEL (Commented Out)

**Note:** The Hero component includes an elaborate mosaic panel layout that is **currently commented out** in production:

```jsx
{/* Right: floating mosaic panel - COMMENTED OUT FOR TESTING */}
{/* <div className="hero__mosaic fade-in" ... */}
```

**When Enabled, CSS Features:**
- 2-column grid layout (1fr 1fr)
- 3 rows with varying heights (155px cells)
- Cell 1: Left column, spans all 3 rows
- Cell 2: Right column, row 1 (short top)
- Cell 3: Right column, rows 2-3 (tall bottom)
- Decorative gold border ring with 22px border-radius
- Glass badge overlay at bottom with blur effect

**Mosaic CSS:**
```css
.hero__mosaic-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 155px 155px 155px;
  gap: 10px;
}

.hero__mosaic-cell {
  overflow: hidden;
  border-radius: 14px;
  position: relative;
}

.hero__mosaic-cell img {
  object-fit: cover;
  transition: transform .55s ease;
}

.hero__mosaic-cell:hover img { transform: scale(1.07); }
```

---

## 9. RECOMMENDATIONS

### For Mobile Optimization
1. Increase dot touch targets to 44×44px minimum (use ::before pseudo-elements)
2. Add mobile-specific breakpoint for Event Modal
3. Consider collapsible dots on very small screens (< 480px)
4. Test SVG clip-path fallback in older browsers

### For Accessibility
1. All dots properly labeled with `aria-label` ✅ (Already implemented)
2. Add `aria-live="polite"` for auto-advancing carousels
3. Add keyboard navigation support for all dots
4. Consider reducing motion preferences (@prefers-reduced-motion)

### For Performance
1. Lazy load images in carousels
2. Use `will-change: opacity, transform` on animated elements ✅ (Already used)
3. Consider preloading next image in Stories carousel
4. Monitor animation frame rates for smooth 60fps experience

### For Consistency
1. Standardize dot styling across all components (currently varies by component)
2. Create reusable carousel dot component
3. Document carousel auto-advance behavior in comments
4. Standardize on directional animations for consistency

---

## APPENDIX A: CSS Variables Reference

```css
/* Colors */
--gold-warm:     #E5B83C       /* Bright gold, primary accent */
--gold-rich:     #C5A028       /* Deep gold, button/active state */
--gold-antique:  #B8860B       /* Dark gold, hover state */
--gold-pale:     #FBF3D5       /* Very light gold, backgrounds */

/* Text Colors */
--ash-deep:      #1A1508       /* Dark brown, headings */
--ash-medium:    #6B6B6B       /* Medium gray, body text */
--ash-light:     #888          /* Light gray, metadata */
--ash-pale:      #ccc          /* Very light gray, dividers */
--ash-soft:      #F3F4F6       /* Off-white, subtle backgrounds */

/* Backgrounds */
--white-off:     #F9F7F2       /* Warm off-white, main background */
--dark:          #1A1508       /* Very dark brown */

/* Borders & Shadows */
--radius-md:     8px
--radius-lg:     12px
--radius-xl:     20px
```

---

**Report Generated:** May 4, 2026  
**Codebase Version:** Current  
**Analysis Scope:** Tourism Frontend React Application  
**Total Carousel Implementations Analyzed:** 7 (6 with dots, 1 static)  
**Mobile Breakpoints Analyzed:** 4 major breakpoints  
**CSS Files Reviewed:** 11  
**JSX Components Reviewed:** 9
