# GrowthLab Financial Brand Guide

## Brand Overview

**Company**: GrowthLab Financial
**Website**: https://www.growthlabfinancial.com/
**Industry**: Finance-as-a-Service (FaaS) - Accounting, FP&A, CFO Services
**Target Audience**: Startups, SMBs, Scaling Companies
**Brand Personality**: Professional, Trustworthy, Modern, Approachable, Growth-Oriented

## Extracted Brand Colors

### Primary Palette

#### Brand Blue (Primary)
- **Hex**: `#407B9D`
- **RGB**: `rgb(64, 123, 157)`
- **Usage**: Primary buttons, active navigation, key CTAs, links, brand elements
- **Character**: Professional, trustworthy, stable, confident
- **Represents**: Financial expertise, reliability, depth

#### Accent Green (Success/Growth)
- **Hex**: `#C8E4BB`
- **RGB**: `rgb(200, 228, 187)`
- **Usage**: Success states, completed items, positive growth metrics, badges
- **Character**: Growth, success, optimism, natural
- **Represents**: Business growth, positive outcomes, achievement

#### Light Teal (Secondary)
- **Hex**: `#95CBD7`
- **RGB**: `rgb(149, 203, 215)`
- **Usage**: Secondary actions, informational elements, highlights, hover states
- **Character**: Fresh, modern, friendly, approachable
- **Represents**: Innovation, clarity, communication

### Neutral Palette

#### Dark Gray (Primary Text)
- **Hex**: `#463939`
- **RGB**: `rgb(70, 57, 57)`
- **Usage**: Headings, body text, important content
- **Character**: Readable, professional, strong

#### Medium Gray (Secondary Text)
- **Hex**: `#666666`
- **RGB**: `rgb(102, 102, 102)`
- **Usage**: Secondary text, descriptions, metadata
- **Character**: Subtle, supportive, clear

#### Light Gray (Tertiary Text)
- **Hex**: `#999999`
- **RGB**: `rgb(153, 153, 153)`
- **Usage**: Placeholder text, disabled states, subtle labels
- **Character**: Receding, non-intrusive

#### Border Gray
- **Hex**: `#E5E5E5`
- **RGB**: `rgb(229, 229, 229)`
- **Usage**: Borders, dividers, subtle separations
- **Character**: Clean, organized, structured

### Background Colors

#### Pure White
- **Hex**: `#FFFFFF`
- **RGB**: `rgb(255, 255, 255)`
- **Usage**: Cards, primary backgrounds, content areas
- **Character**: Clean, pure, premium

#### Off-White (Warm)
- **Hex**: `#FAF9F9`
- **RGB**: `rgb(250, 249, 249)`
- **Usage**: Page backgrounds, subtle differentiation
- **Character**: Soft, approachable, comfortable

#### Light Gray Background
- **Hex**: `#EEEEEE`
- **RGB**: `rgb(238, 238, 238)`
- **Usage**: Secondary backgrounds, section alternation
- **Character**: Neutral, organized, structured

## Typography

### Primary Fonts

#### Montserrat
- **Type**: Sans-serif, Geometric
- **Usage**: Headings, navigation, buttons, labels, emphasized text
- **Weights Available**:
  - 400 (Regular) - For larger headings
  - 600 (SemiBold) - For subheadings
  - 700 (Bold) - For emphasis
- **Character**: Modern, geometric, confident, professional
- **Why It Works**: Strong presence without being aggressive, perfect for financial services

#### Source Sans Pro
- **Type**: Sans-serif, Humanist
- **Usage**: Body text, descriptions, long-form content, UI text
- **Weights Available**:
  - 400 (Regular) - Default body text
  - 600 (SemiBold) - Emphasized body text
- **Character**: Highly readable, professional, warm, approachable
- **Why It Works**: Excellent legibility at small sizes, comfortable for extended reading

### Typography Implementation

```css
/* Import Fonts */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Source+Sans+Pro:wght@400;600&display=swap');

/* Font Variables */
--font-heading: 'Montserrat', system-ui, -apple-system, sans-serif;
--font-body: 'Source Sans Pro', system-ui, -apple-system, sans-serif;
```

## Design Characteristics from Website

### Visual Style
1. **Clean & Spacious**: Generous whitespace, uncluttered layouts
2. **Professional**: Polished, refined, confidence-inspiring
3. **Modern**: Contemporary design patterns, current web standards
4. **Approachable**: Warm neutrals, friendly accent colors
5. **Structured**: Clear hierarchy, organized information

### Component Patterns

#### Buttons
- **Style**: Rounded corners (border-radius: ~8px)
- **Primary**: Brand blue background, white text
- **Secondary**: White background, brand blue text, border
- **Padding**: Generous (16-24px horizontal, 12-16px vertical)
- **Hover**: Subtle brightness change, no dramatic effects

#### Cards
- **Style**: Clean white cards on light backgrounds
- **Borders**: Subtle or shadow-based (not heavy borders)
- **Radius**: Moderate (12-16px)
- **Shadow**: Soft, subtle (not dramatic)
- **Padding**: Generous internal spacing

#### Forms
- **Style**: Clean, minimal
- **Focus**: Simple, clear indication
- **Borders**: Subtle gray, blue on focus
- **Labels**: Clear, above inputs
- **Spacing**: Comfortable vertical rhythm

### Layout Principles

1. **Hierarchy**: Clear visual weight differences
2. **Whitespace**: Intentional, generous spacing
3. **Alignment**: Strong left-edge alignment, centered content blocks
4. **Rhythm**: Consistent vertical spacing between sections
5. **Contrast**: Subtle background variations for section breaks

## Brand Voice (Visual)

### What the Brand IS:
- ✅ Professional and polished
- ✅ Modern and current
- ✅ Trustworthy and stable
- ✅ Growth-oriented and optimistic
- ✅ Clear and organized
- ✅ Approachable and human

### What the Brand is NOT:
- ❌ Corporate or stuffy
- ❌ Flashy or overly vibrant
- ❌ Cluttered or busy
- ❌ Cold or intimidating
- ❌ Trendy for trendy's sake
- ❌ Unprofessional or casual

## Application to AI Console

### Color Usage Strategy

**Primary Actions & Navigation**
```css
background-color: #407B9D; /* Brand Blue */
color: #FFFFFF;
```

**Success States & Growth Indicators**
```css
background-color: #C8E4BB; /* Accent Green */
color: #463939;
```

**Secondary Actions & Info**
```css
background-color: #95CBD7; /* Light Teal */
color: #463939;
```

**Page Backgrounds**
```css
background-color: #FAF9F9; /* Off-White */
```

**Card Backgrounds**
```css
background-color: #FFFFFF; /* Pure White */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
border-radius: 12px;
```

### Typography Application

**Page Titles**
```css
font-family: 'Montserrat', sans-serif;
font-weight: 700;
font-size: 36px;
color: #463939;
line-height: 1.2;
```

**Section Headers**
```css
font-family: 'Montserrat', sans-serif;
font-weight: 600;
font-size: 24px;
color: #463939;
line-height: 1.3;
```

**Body Text**
```css
font-family: 'Source Sans Pro', sans-serif;
font-weight: 400;
font-size: 16px;
color: #666666;
line-height: 1.6;
```

**UI Elements (Buttons, Labels)**
```css
font-family: 'Montserrat', sans-serif;
font-weight: 600;
font-size: 14px;
```

## Visual Consistency Checklist

When designing/styling components, ensure:

- [ ] Brand blue (#407B9D) is used for primary actions
- [ ] Montserrat is used for headings and emphasized text
- [ ] Source Sans Pro is used for body text
- [ ] Whitespace is generous (24px+ between major sections)
- [ ] Borders are subtle (#E5E5E5) or replaced with shadows
- [ ] Border radius is consistent (8-16px range)
- [ ] Hover states are subtle, not dramatic
- [ ] Color contrast meets WCAG AA standards
- [ ] Success states use accent green (#C8E4BB)
- [ ] Overall feel is professional but approachable

## Reference Screenshots

Full page screenshot captured: `.playwright-mcp/growthlabfinancial-homepage.png`

### Key Visual Elements Observed:
1. **Hero Section**: Large, bold headlines in Montserrat
2. **CTAs**: Prominent brand blue buttons with white text
3. **Cards**: Clean white cards with subtle shadows
4. **Statistics**: Large numbers in dark gray, labels in medium gray
5. **Industry Cards**: Image + text cards with hover effects
6. **Testimonials**: Clean quote cards with star ratings
7. **Footer**: Organized, multi-column layout with brand blue links

## Implementation Priority

### Phase 1: Foundation
1. Import Montserrat and Source Sans Pro fonts
2. Define CSS variables for all brand colors
3. Set up base typography styles

### Phase 2: Core Components
1. Buttons (primary, secondary, variants)
2. Cards (standard, hover states)
3. Forms (inputs, labels, validation)

### Phase 3: Layout
1. Sidebar navigation
2. Header
3. Page backgrounds and spacing

### Phase 4: Specific Components
1. Tables (leads, data display)
2. Timeline (stages, progress)
3. Chat interface

### Phase 5: Polish
1. Hover effects
2. Transitions
3. Loading states
4. Empty states

---

## Notes for Developers

- **Consistency is key**: Use the defined colors consistently across all components
- **Don't mix font families**: Montserrat for UI/headings, Source Sans Pro for content
- **Test contrast**: Always verify text is readable against backgrounds
- **Reference the website**: When in doubt, look at growthlabfinancial.com
- **Preserve functionality**: Only change visual styles, never alter logic

---

**Version**: 1.0
**Extracted**: 2025-09-30
**Source**: https://www.growthlabfinancial.com/
