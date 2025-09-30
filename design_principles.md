# Design Principles for GrowthLab AI Console

## Overview
This document establishes the design system and visual principles for the GrowthLab AI Console. Our design philosophy emphasizes clarity, professionalism, and trust—reflecting the values of a financial services company while maintaining modern SaaS best practices.

## Core Design Philosophy

### 1. **Clarity Over Complexity**
- Information hierarchy should be immediately apparent
- White space is intentional and generous
- Every element serves a purpose

### 2. **Professional & Trustworthy**
- Financial services demand confidence-inspiring design
- Subtle, sophisticated rather than flashy
- Consistent and predictable interactions

### 3. **Modern SaaS Excellence**
- Inspired by best-in-class products (Stripe, Linear, Vercel)
- Clean, minimal interfaces
- Thoughtful micro-interactions

## Visual Design Principles

### Color Usage

**Primary Color (Brand Blue - #407B9D)**
- Use for: Primary actions, active states, key navigation elements
- Creates: Trust, stability, professionalism
- Never: Overuse; maintain strong contrast with backgrounds

**Accent Colors**
- Green (#C8E4BB): Success states, completed items, positive metrics
- Teal (#95CBD7): Secondary actions, informational elements, highlights
- Avoid: Using too many colors in a single view

**Neutrals (Grays)**
- Use extensively for: Text, borders, backgrounds
- Create: Visual hierarchy through subtle shade variations
- Remember: Gray doesn't mean boring—it means focused

**Background Strategy**
- Primary: White or very light off-white (#FAF9F9)
- Secondary: Subtle tints of brand blue for section differentiation
- Cards: White on tinted backgrounds for depth

### Typography Hierarchy

**Montserrat (Headings)**
- Weights: 600 (SemiBold), 700 (Bold)
- Usage: Page titles, section headers, navigation
- Character: Modern, geometric, confident

**Source Sans Pro (Body)**
- Weights: 400 (Regular), 600 (SemiBold)
- Usage: Body text, descriptions, form labels
- Character: Highly readable, professional, warm

**Scale**
- H1: 36px / 2.25rem (Page titles)
- H2: 28px / 1.75rem (Section headers)
- H3: 22px / 1.375rem (Card titles)
- H4: 18px / 1.125rem (Subsections)
- Body: 16px / 1rem (Default)
- Small: 14px / 0.875rem (Captions, metadata)
- XS: 12px / 0.75rem (Labels, badges)

**Line Heights**
- Headings: 1.2-1.3 (tight for impact)
- Body: 1.5-1.6 (comfortable reading)
- UI Elements: 1.4 (balanced)

### Spacing System

**Base Unit: 4px**
- 0.5x = 2px (hairline spacing)
- 1x = 4px (tight spacing)
- 2x = 8px (compact spacing)
- 3x = 12px (default spacing)
- 4x = 16px (comfortable spacing)
- 6x = 24px (generous spacing)
- 8x = 32px (section spacing)
- 12x = 48px (major section breaks)
- 16x = 64px (page-level spacing)

**Application**
- Component padding: 16-24px
- Section margins: 32-48px
- Page padding: 32-64px
- Element gaps: 8-16px

### Elevation & Shadows

**Shadow Levels**
```css
/* Subtle - Cards at rest */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

/* Medium - Cards on hover, dropdowns */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05);

/* Strong - Modals, popovers */
box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
```

**Border Radius**
- Buttons: 8px (friendly, approachable)
- Cards: 12px (modern, spacious)
- Input fields: 6px (subtle, professional)
- Badges: 16px (pill-shaped)

### Component Design Patterns

#### Buttons
- **Primary**: Brand blue background, white text, subtle shadow
- **Secondary**: White/light gray background, brand blue text, border
- **Ghost**: Transparent background, brand blue text, hover state
- **Sizes**: Small (32px), Default (40px), Large (48px)
- **States**:
  - Hover: Slight brightness increase, subtle scale (1.02)
  - Active: Slight depression effect
  - Disabled: 50% opacity, no pointer
  - Loading: Spinner in appropriate color

#### Cards
- White background on light page backgrounds
- Subtle shadow for depth
- 16-24px padding
- Clear header, body, footer sections
- Hover: Gentle lift (increase shadow)

#### Forms
- Clear labels above inputs
- Focus: Brand blue ring (2-3px)
- Error: Red border, red text below
- Success: Green border, green checkmark
- Placeholder: Light gray (#999)
- Consistent height: 40px for inputs

#### Tables
- Clear headers with sort indicators
- Row hover: Very light brand blue tint
- Borders: Subtle gray (#E5E5E5)
- Action buttons: Right-aligned, ghost style
- Pagination: Clean, centered

#### Navigation
- Sidebar: Fixed, collapsible
- Active state: Brand blue background, white text
- Hover: Light background tint
- Icons: Consistent size (20-24px)
- Clear visual hierarchy

### Responsive Design

**Breakpoints**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Considerations**
- Touch targets: Minimum 44px
- Simplified navigation: Hamburger menu
- Stack layouts vertically
- Increase padding for finger-friendly UX

**Tablet Considerations**
- Hybrid layout: Some sidebar visibility
- Optimize for landscape and portrait
- Balance between mobile and desktop patterns

### Accessibility

**Color Contrast**
- Text on background: Minimum 4.5:1 (WCAG AA)
- Large text: Minimum 3:1
- UI components: Minimum 3:1

**Focus States**
- Always visible: Blue ring or outline
- Never: Remove default focus styles without replacement
- Keyboard navigation: Full support

**Screen Readers**
- Semantic HTML: Use proper heading hierarchy
- ARIA labels: Where needed for clarity
- Alternative text: For all meaningful images

### Animation & Transitions

**Duration**
- Micro (hover): 150ms
- Short (expand/collapse): 200-300ms
- Medium (page transitions): 300-400ms
- Long (complex animations): 400-600ms

**Easing**
- Standard: cubic-bezier(0.4, 0.0, 0.2, 1)
- Enter: cubic-bezier(0.0, 0.0, 0.2, 1)
- Exit: cubic-bezier(0.4, 0.0, 1, 1)

**What to Animate**
- Opacity: Fades, reveals
- Transform: Scales, slides, position changes
- Colors: Background, border (subtle)
- Avoid: Width/height (causes reflow)

### Loading States

**Skeleton Screens**
- Use for: Content that's loading
- Colors: Light gray background, animated shimmer
- Shape: Match expected content layout

**Spinners**
- Use for: Actions in progress (button clicks, form submissions)
- Color: Match context (primary button = white, secondary = brand blue)
- Size: Proportional to container

**Progress Indicators**
- Use for: Multi-step processes
- Color: Brand blue fill
- Always: Show current step and total steps

### Empty States

**Components**
- Icon or illustration (simple, on-brand)
- Clear message explaining why it's empty
- Action button if applicable (e.g., "Add First Item")
- Helpful hint or context

## Reference Examples

### Companies to Study
1. **Stripe**: Clean, professional, excellent documentation of components
2. **Linear**: Minimal, fast, beautiful interactions
3. **Vercel**: Strong typography, great use of space
4. **Notion**: Flexible, approachable, clear hierarchy
5. **Attio**: Modern CRM design, great data visualization

### Key Takeaways from Best Practices
- Less is more: Remove unnecessary elements
- Consistency: Predictable patterns build trust
- Performance: Fast interactions feel better
- Details: Small touches create premium feel
- Feedback: Always acknowledge user actions

## Implementation Notes

1. **Start with fundamentals**: Color, typography, spacing
2. **Build components systematically**: One at a time, tested
3. **Use Playwright for validation**: See your work as users will
4. **Iterate based on visual feedback**: Trust your eyes
5. **Maintain existing functionality**: Only styling changes

## Version Control

- Version: 1.0
- Last Updated: 2025-09-30
- Author: Claude Code (GrowthLab AI Console Team)
