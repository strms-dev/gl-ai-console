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

### User Preferences
- **Custom Dialogs**: NEVER use Chrome browser alerts (`alert()`). Always use custom dialog components like `AlertDialog` and `ConfirmationDialog` from `src/components/ui/`
  - Use `AlertDialog` for simple informational popups with just an OK button
  - Use `ConfirmationDialog` for actions requiring user confirmation (OK/Cancel)

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

### Adding AI Generation Animations ("Generate with AI" Button) to Timeline Stages

When adding AI generation functionality with spinning animations to a timeline stage, follow this **exact pattern** used by working stages like `workflow-docs`, `readiness`, and `scoping-prep`:

#### Critical: Identify the Correct event.id and event.type

**MOST COMMON BUG**: Using the wrong `event.id` when passing props to ActionZone!
- Always verify the stage's `event.id` and `event.type` by checking the timeline data or existing similar stages
- Example: Scoping DOCUMENT stage uses `event.id === "internal-client-docs"` NOT `event.id === "scoping"`
  - `"scoping"` is for scoping CALL transcript upload
  - `"internal-client-docs"` is for scoping DOCUMENT generation

#### Step-by-Step Implementation (Copy Exactly from workflow-docs):

**1. Add State Variable** (Timeline component, ~line 2329):
```typescript
// Add after other generating states
const [yourStageGenerating, setYourStageGenerating] = useState(false)
```

**2. Add Props to ActionZone & StageCard** (Following existing pattern):
```typescript
// ActionZone function parameters (~line 187):
yourStageGenerating,

// ActionZone type definition (~line 232):
yourStageGenerating?: boolean,

// StageCard function parameters (~line 1764):
yourStageGenerating,

// StageCard type definition (~line 1814):
yourStageGenerating?: boolean,
```

**3. Pass Props in ALL THREE ActionZone Calls** (CRITICAL - must match correct event.id):
```typescript
// Inside StageCard (~line 1995):
yourStageGenerating={event.id === "your-stage-id" ? yourStageGenerating : false}

// Inside Timeline hideHeader=true block (~line 4162):
yourStageGenerating={event.id === "your-stage-id" ? yourStageGenerating : false}

// Inside Timeline with Card block (~line 4266):
yourStageGenerating={event.id === "your-stage-id" ? yourStageGenerating : false}
```

**4. Add Automated Action Handler** (handleAction function, ~line 3165):
```typescript
// Handle automated action for your stage
if (action === 'automated' && eventId === 'your-stage-id') {
  console.log('Triggering AI generation for your stage')

  // Set loading state
  setYourStageGenerating(true)

  // Send POST request to n8n webhook
  fetch('https://your-webhook-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_id: leadId
    })
  })
    .then(response => {
      if (response.ok) {
        console.log('Generation triggered successfully')
      } else {
        console.error('Failed to trigger generation:', response.statusText)
      }
    })
    .catch(error => {
      console.error('Error triggering generation:', error)
    })

  return
}
```

**5. Add UI with Animation in ActionZone** (ActionZone component, ~line 728):
```typescript
// Special handling for Your Stage
if (event.type === "your-stage-type") {
  const fileType = getFileTypeById('your-file-type-id')
  if (fileType) {
    return (
      <div className="mt-4">
        {/* AI Generation Button */}
        {event.actions.automated && (
          <div className="mb-4">
            <Button
              variant="default"
              size="sm"
              onClick={() => onAction('automated')}
              disabled={!!existingFile || yourStageGenerating}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              {yourStageGenerating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  {event.actions.automated.label}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Manual Upload Option */}
        <div>
          <div className="mb-2">
            <p className="text-sm font-medium text-foreground">Or upload manually:</p>
          </div>
          <FileUpload
            fileType={fileType}
            existingFile={existingFile}
            onFileUploaded={onFileUploaded}
            onFileCleared={() => onFileCleared?.('your-file-type-id')}
            variant="compact"
          />
        </div>
      </div>
    )
  }
}
```

**6. Add Polling useEffect** (Timeline component, ~line 4000):
```typescript
// Poll for your stage file when generating
useEffect(() => {
  if (!yourStageGenerating) return

  console.log('Starting polling for your stage file...')

  const checkForFile = async () => {
    try {
      const file = await getFileByType(leadId, 'your-file-type-id')
      if (file) {
        console.log('File detected:', file)
        setYourStageGenerating(false)

        // Trigger file uploaded callback to update UI
        if (onFileUploaded) {
          const uploadedFile: UploadedFile = {
            id: file.id,
            fileTypeId: 'your-file-type-id',
            fileName: file.file_name,
            uploadDate: file.uploaded_at,
            fileSize: file.file_size,
            uploadedBy: file.uploaded_by,
            storagePath: file.storage_path
          }
          onFileUploaded(uploadedFile)
        }
      }
    } catch (error) {
      console.error('Error checking for file:', error)
    }
  }

  // Check immediately
  checkForFile()

  // Then poll every 5 seconds
  const interval = setInterval(checkForFile, 5000)

  // Cleanup on unmount or when generating stops
  return () => {
    console.log('Stopping polling')
    clearInterval(interval)
  }
}, [yourStageGenerating, leadId, onFileUploaded])
```

#### Triggering from Another Stage (Cross-Stage Triggering)

To trigger generation when a button is clicked in a DIFFERENT stage:

```typescript
// In the handler for the OTHER stage's button (e.g., proposal decision):
setScopingDocGenerating(true)

fetch('https://your-webhook-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    project_id: leadId
  })
})
```

#### Common Debugging Steps:

1. **Animation not showing**:
   - Check ALL THREE ActionZone calls have correct `event.id` condition
   - Verify `event.id` matches exactly (common: using "scoping" instead of "internal-client-docs")
   - Add console.log to verify state is actually changing to `true`

2. **Button click does nothing**:
   - Verify automated action handler exists for `eventId === 'your-stage-id'`
   - Ensure handler calls `setYourStageGenerating(true)`
   - Check webhook URL is correct

3. **File detected but animation doesn't stop**:
   - Verify polling useEffect calls `setYourStageGenerating(false)` when file found
   - Check `fileTypeId` matches in both handler and polling

#### Reference Implementations:
- **workflow-docs** (n8n workflow description): Lines 3135-3163 (handler), 3954-3997 (polling), 401-457 (UI)
- **readiness** (readiness assessment): Lines 3073-3102 (handler), 3806-3845 (polling), 305-365 (UI)
- **scoping-prep** (scoping call prep): Lines 3104-3133 (handler), 3852-3891 (polling), 367-398 (UI)
- **internal-client-docs** (scoping document): Lines 3165-3194 (handler), 4026-4064 (polling), 728-774 (UI)