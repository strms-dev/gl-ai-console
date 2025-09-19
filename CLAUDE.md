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
- User will handle running the development server in their own terminal - no need to start it automatically

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

### Styling
- **Tailwind CSS v4**: Latest version with PostCSS
- **Component Library**: Custom UI components with consistent styling
- **Theming**: Light theme with standard Tailwind color system

### MCP Integration
The project has MCP (Model Context Protocol) configuration in `.mcp.json` with:
- Supabase integration for database operations
- n8n integration for workflow automation

## Development Notes

- The main application is in the `gl-ai-console/` subdirectory
- Uses Next.js 15 with React 19 and TypeScript 5
- Turbopack is enabled for faster development builds
- Path aliases configured: `@/*` maps to `./src/*`
- ESLint configuration for code quality