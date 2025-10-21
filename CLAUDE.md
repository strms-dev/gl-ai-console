# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **GrowthLab AI Console** - a Next.js 15 application that provides AI-powered interfaces for different business departments including STRMS (customer pipeline), Accounting, FP&A, Tax, HR/PAS, Sales, and Marketing. The application uses TypeScript and is built with the App Router.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Turbopack (typically runs on port 3000, but may use 3005+ if port is in use)
- `npm run build` - Build for production with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Development Server Notes
- All commands should be run from the `gl-ai-console/` subdirectory
- Development server automatically handles port conflicts and will use next available port
- **IMPORTANT**: User always handles running the development server in their own terminal - NEVER start npm run dev or any development server commands
- Only make code adjustments, do not run terminal commands unless specifically requested

### File Structure
- Working directory: `gl-ai-console/` (the actual Next.js app is in this subdirectory)
- Source code: `src/`
- Components: `src/components/`
- Pages: `src/app/` (App Router structure)

## Architecture

### Route Structure
The app uses Next.js App Router with a department-based structure:
- `/strms` - Customer pipeline management (default route, redirects from `/`)
- `/accounting`, `/fpa`, `/tax`, `/hr`, `/sales`, `/marketing` - Department-specific pages
- Each department has a main page and sub-routes using catch-all routes (`[...slug]/page.tsx`)

### Component Architecture
- **MainLayout**: Root layout with collapsible sidebar and header
- **Sidebar**: Department navigation with contextual sub-navigation
- **Department Pages**: Each department has its own page component
- **Shared Components**: UI components in `src/components/ui/`
- **Business Components**: Department-specific components (e.g., leads management)

### Key Features
- **STRMS Pipeline**: Full lead management with local storage persistence (`src/lib/leads-store.ts`)
- **Chat Interface**: AI assistant integration per department
- **Responsive Design**: Collapsible sidebar, mobile-friendly
- **Department Navigation**: Dynamic sidebar that shows relevant sub-sections

### Data Management
- **Lead Storage**: Browser localStorage via `src/lib/leads-store.ts`
- **Dummy Data**: Static data for development in `src/lib/dummy-data.ts`
- **No External Database**: Currently uses local storage for persistence

### Styling & Design System
- **Tailwind CSS v4**: Latest version with PostCSS
- **Component Library**: Custom UI components with consistent GrowthLab branding
- **Design System**: Follow guidelines in `design_principles.md` and `brand_guide.md`
- **Brand Colors**:
  - Primary Blue: `#407B9D` (buttons, active states, primary actions)
  - Accent Green: `#C8E4BB` (success states, completed items)
  - Light Teal: `#95CBD7` (secondary actions, info elements)
- **Typography**:
  - Headings: Montserrat (imported via Next.js font optimization)
  - Body: Source Sans Pro (imported via Next.js font optimization)
  - Apply via CSS variables: `var(--font-heading)` and `var(--font-body)`
- **Component Styling Guidelines**:
  - Always use brand colors for interactive elements
  - Maintain rounded corners (8-12px for buttons/cards)
  - Include hover states with subtle scale/shadow effects
  - Use brand blue focus rings on form inputs
  - Keep shadows subtle and professional

### MCP Integration
The project has MCP (Model Context Protocol) configuration in `.mcp.json` with:
- Supabase integration for database operations
- n8n integration for workflow automation

## Design System & Styling Requirements

**IMPORTANT**: All new components, pages, and UI elements MUST follow the established design system.

### Required Reading for New Features
Before creating any new UI component or page, review:
1. **`design_principles.md`** - Complete design system with spacing, colors, typography scales
2. **`brand_guide.md`** - GrowthLab brand colors, fonts, and visual style extracted from company website

### Style Implementation Checklist
When building new UI components or features:
- ✅ Use brand colors (`#407B9D`, `#C8E4BB`, `#95CBD7`) for all interactive elements
- ✅ Apply Montserrat font to headings using `style={{fontFamily: 'var(--font-heading)'}}`
- ✅ Apply Source Sans Pro to body text using `style={{fontFamily: 'var(--font-body)'}}`
- ✅ Use consistent border radius (8-12px) for buttons and cards
- ✅ Include hover effects (scale, shadow, color changes) on interactive elements
- ✅ Add brand blue focus rings on all form inputs
- ✅ Maintain professional, subtle shadows (not dramatic)
- ✅ Use the established spacing system (8px, 16px, 24px, 32px increments)

### Examples of Styled Components
Reference these existing components as templates:
- **Buttons**: `src/components/ui/button.tsx` - Shows hover effects, brand colors
- **Forms**: `src/components/ui/input.tsx`, `label.tsx` - Shows focus states
- **Cards**: `src/components/ui/card.tsx` - Shows shadows and structure
- **Navigation**: `src/components/layout/sidebar.tsx` - Shows active states

## Development Notes

- The main application is in the `gl-ai-console/` subdirectory
- Uses Next.js 15 with React 19 and TypeScript 5
- Turbopack is enabled for faster development builds
- Path aliases configured: `@/*` maps to `./src/*`
- ESLint configuration for code quality

### File Editing Best Practices

**Edit Tool Strategy:**
- ALWAYS try the `Edit` tool first for making code changes
- If the `Edit` tool fails with "File has been unexpectedly modified" error, immediately switch to using bash/python scripts for that edit
- The Edit tool can fail when:
  - The Next.js dev server is running and watching files
  - VSCode has the file open with auto-save enabled
  - OneDrive is syncing files in the background
- Bash/python edits are perfectly acceptable and work reliably in these scenarios

**Debugging Complex Issues:**
- When struggling to solve a bug or implement a feature properly, ADD CONSOLE LOGS to help debug
- Console logs help us work together to understand what's happening
- Place strategic `console.log()` statements to output:
  - Variable values
  - Function execution flow
  - State values at critical points
  - API response data
- After debugging is complete, remove the console logs
- User will test with console logs visible and share the output to help identify the root cause

### CSS & Styling Technical Notes
- **Font Loading**: Use Next.js font optimization in `layout.tsx`, NOT `@import` in CSS files
- **Tailwind v4**: Uses `@theme {}` blocks for theme configuration
- **CSS Import Order**: All `@import` statements must be at the very top of CSS files (no blank lines between them)
- **Custom Fonts**: Montserrat and Source Sans Pro are loaded via Next.js and exposed as CSS variables
- **Color Variables**: Brand colors are defined in `:root` and Tailwind's `@theme` block
- **Icons**: ALWAYS use Lucide React icons - NEVER use emojis in the UI

## Timeline Component Development Patterns

### Adding New Interactive Actions (Buttons) to Timeline Stages

When adding new interactive buttons to timeline stages in `src/components/leads/timeline.tsx`, follow this **exact pattern** used by existing stages like Engagement Agreement:

#### Critical Architecture Understanding
- **TWO ActionZone calls exist**: One inside StageCard component (~line 1585) and one in Timeline component (~line 2489)
- **BOTH must be updated** with new props for any new stage functionality
- **StageCard component** handles the UI rendering, **Timeline component** manages state

#### Step-by-Step Implementation Pattern:

1. **Add State Variables** (Timeline component):
   ```typescript
   // Add to Timeline component state declarations
   const [newFeatureCreated, setNewFeatureCreated] = useState(false)
   const [newFeatureLoading, setNewFeatureLoading] = useState(false)
   ```

2. **Add Props to ActionZone Function** (ActionZone component):
   ```typescript
   // Add to ActionZone function parameters (line ~91)
   newFeatureCreated,
   newFeatureLoading,

   // Add to ActionZone type definition (line ~115)
   newFeatureCreated?: boolean,
   newFeatureLoading?: boolean,
   ```

3. **Add Props to StageCard Component** (StageCard component):
   ```typescript
   // Add to StageCard function parameters (line ~1427)
   newFeatureCreated,
   newFeatureLoading,

   // Add to StageCard type definition (line ~1465)
   newFeatureCreated?: boolean,
   newFeatureLoading?: boolean,
   ```

4. **Pass Props in BOTH ActionZone Calls**:
   ```typescript
   // Inside StageCard (~line 1585):
   newFeatureCreated={event.id === "stage-id" ? newFeatureCreated : false}
   newFeatureLoading={event.id === "stage-id" ? newFeatureLoading : false}

   // Inside Timeline (~line 2489):
   newFeatureCreated={event.id === "stage-id" ? newFeatureCreated : false}
   newFeatureLoading={event.id === "stage-id" ? newFeatureLoading : false}
   ```

5. **Add Custom UI in ActionZone**:
   ```typescript
   // Add to ActionZone component (~line 1072)
   if (event.type === "stage-id") {
     return (
       // Copy exact structure from EA stage
       // Use props: newFeatureCreated, newFeatureLoading
     )
   }
   ```

6. **Add Action Handlers**:
   ```typescript
   // Add to handleAnchorAction function (~line 2175)
   else if (action === 'new_action') {
     setNewFeatureLoading(true)
     setTimeout(() => {
       setNewFeatureLoading(false)
       setNewFeatureCreated(true)
     }, 3000)
   }

   // Add routing in handleAction (~line 1955)
   if (eventId === 'stage-id') {
     handleAnchorAction(action)
     return
   }
   ```

#### Common Debugging Issues:
- **Props showing `undefined`**: Check BOTH ActionZone calls have the new props
- **Buttons not responding**: Verify action routing in handleAction function
- **State not updating**: Ensure state variables are declared in Timeline component scope
- **TypeScript errors**: Add props to BOTH ActionZone and StageCard type definitions

#### Best Practice:
**Always copy the exact pattern from an existing working stage** (like Engagement Agreement) rather than creating new patterns. Search for all occurrences of existing prop names (e.g., `anchorContactCreated`) to find all locations that need updating.