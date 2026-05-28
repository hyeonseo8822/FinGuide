---
name: Finance Lab
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8d9e3'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fd'
  surface-container: '#ecedf7'
  surface-container-high: '#e6e8f2'
  surface-container-highest: '#e0e2ec'
  on-surface: '#181c23'
  on-surface-variant: '#414754'
  inverse-surface: '#2d3038'
  inverse-on-surface: '#eff0fa'
  outline: '#727785'
  outline-variant: '#c1c6d6'
  surface-tint: '#005bbe'
  primary: '#0059b9'
  on-primary: '#ffffff'
  primary-container: '#1071e5'
  on-primary-container: '#fefcff'
  inverse-primary: '#acc7ff'
  secondary: '#006d37'
  on-secondary: '#ffffff'
  secondary-container: '#6bfe9c'
  on-secondary-container: '#00743a'
  tertiary: '#904800'
  on-tertiary: '#ffffff'
  tertiary-container: '#b55d00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#acc7ff'
  on-primary-fixed: '#001a40'
  on-primary-fixed-variant: '#004491'
  secondary-fixed: '#6bfe9c'
  secondary-fixed-dim: '#4ae183'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005228'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#f9f9ff'
  on-background: '#181c23'
  surface-variant: '#e0e2ec'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 30px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-padding: 24px
  gutter: 20px
---

## Brand & Style
The design system is crafted for elementary school students to explore financial concepts in a safe, engaging, and highly intuitive environment. The brand personality is **Playful Professionalism**: it combines the hyper-clean, systematic efficiency of modern fintech with the soft, welcoming energy of educational platforms for children.

The design style is a hybrid of **Minimalism** and **Tactile Softness**. By utilizing ample whitespace (inspired by Toss) alongside oversized, rounded interactive elements (inspired by Junior Naver), the UI reduces cognitive load while maintaining a sense of fun. The emotional goal is to make "money talk" feel as approachable as a digital game, fostering confidence through clarity and friendly micro-interactions.

## Colors
The palette is rooted in a "Safe & Clear" philosophy. The background remains **Pure White (#FFFFFF)** to ensure maximum focus on content. 

- **Primary (Toss Blue):** Used for primary actions, progress indicators, and key brand moments.
- **Success (Bright Green):** Represents "Safe" zones, savings growth, and correct answers.
- **Warning/Danger (Soft Orange & Red):** Used sparingly to indicate spending risks or "stop and think" moments, softened to avoid causing anxiety.
- **Surface (Light Grey):** Used for large section cards to create subtle containment without heavy borders.

## Typography
We use **Plus Jakarta Sans** for its friendly, rounded terminals and excellent legibility. The typographic hierarchy is intentionally "top-heavy," prioritizing large headlines to guide children through the experience. 

Body text is kept to a minimum, using generous font sizes (nothing below 14px) and increased line heights to ensure readability. Interactive terms that trigger tooltips are styled with a **Light Blue (#D0E3FF) dotted underline** to signify they are "peekable" without being distracting.

## Layout & Spacing
The layout follows a **Fluid Grid** model with significant breathing room. 
- **Desktop:** 12-column grid with 24px gutters. Content is centered in a max-width container of 1040px to prevent eye strain.
- **Mobile:** 4-column grid with 16px gutters and 24px side margins. 

Spacing is governed by a 8px base unit. We use "Extravagant Whitespace" (Level: XL) between major sections to clearly separate different financial concepts (e.g., separating "My Wallet" from "Investment Game").

## Elevation & Depth
This design system uses **Tonal Layers** supplemented by **Ambient Shadows** to create a sense of approachability.

- **Level 0 (Background):** Pure White.
- **Level 1 (Section Cards):** Light Grey (#F2F4F6) with no shadow. These act as "bins" for content.
- **Level 2 (Interactive Elements):** White cards or buttons with a soft, diffused shadow (0px 8px 24px rgba(0, 0, 0, 0.04)).
- **Level 3 (Tooltips & Modals):** High-contrast white surfaces with a more pronounced "Floating" shadow (0px 12px 32px rgba(0, 0, 0, 0.08)).

The "Xylitol Pill" tooltips utilize this Level 3 elevation to appear as if they are resting comfortably above the main interface.

## Shapes
The shape language is dominated by the **Extra-Large Radius (24px)**. 
- **Section Cards:** Always use 24px corners to feel soft and non-threatening.
- **Interactive Buttons:** Use the "Pill" shape (fully rounded) to maximize the "clickability" factor for small hands.
- **Gauge Bars:** Inner and outer tracks must have fully rounded ends.
- **Tooltips:** Specifically styled as "Xylitol Pills"—rectangles with maximum corner radius, creating a smooth, organic feel.

## Components

### Interactive Cards
Large, tap-friendly surfaces. When hovered or pressed, they should scale slightly (1.02x) to provide immediate tactile feedback.

### Visual Gauge Bars
Used for "Safety Zones." The track is a soft grey, with a thick, rounded fill color. Success/Safe zones are marked with a subtle Bright Green glow at the end of the bar.

### O/X Decision Buttons
Oversized circular or pill-shaped buttons. The "O" button uses Toss Blue; the "X" button uses Soft Red. These should be large enough to be the primary focus of the screen during quiz or decision moments.

### Xylitol Tooltips
Small, horizontal pill-shaped containers. They appear above dotted-underline text. They must contain a single, clear sentence explaining a complex term in simple language.

### Micro-interactions
- **Success:** A subtle confetti pop or a gentle bounce when a "Saving Goal" is met.
- **Input:** When typing numbers, the text should "jump" slightly to confirm the entry.
- **State Changes:** Transitioning from "Safe" to "Danger" should involve a background tint shift (e.g., the light grey card turning very pale orange).