# Supabase Integration Setup Guide

This guide will walk you through setting up the Supabase integration for the GrowthLab AI Console.

## Step 1: Create Database Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (or the project should already be connected based on your MCP configuration)
3. Navigate to **SQL Editor** in the left sidebar
4. Open the file `supabase_migration.sql` from the root of this project
5. Copy the entire contents and paste into the SQL Editor
6. Click **Run** to execute the migration
7. Verify that the tables were created:
   - Go to **Table Editor**
   - You should see: `strms_projects`, `strms_project_files`, `strms_project_stage_data`, `strms_sprint_pricing`

## Step 2: Create Storage Bucket

1. In your Supabase Dashboard, navigate to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Configure the bucket:
   - **Name**: `strms-project-files`
   - **Public**: Uncheck (keep it private)
   - **File size limit**: 52428800 (50MB)
   - **Allowed MIME types**: Leave empty (allow all types)
4. Click **Create bucket**

## Step 3: Configure Storage Policies

1. After creating the bucket, click on `strms-project-files`
2. Go to the **Policies** tab
3. Click **New Policy**
4. Create a policy with the following settings:
   - **Policy name**: `Allow all operations on strms-project-files bucket`
   - **Policy definition**: Select "Custom"
   - **For**: SELECT, INSERT, UPDATE, DELETE (check all)
   - **Target roles**: public (for now, until auth is implemented)
   - **USING expression**: `bucket_id = 'strms-project-files'`
   - **WITH CHECK expression**: `bucket_id = 'strms-project-files'`
5. Click **Review** then **Save policy**

## Step 4: Environment Variables (Optional)

The Supabase URL and anonymous key are already hardcoded in the client configuration for development purposes. However, for production or if you want to use environment variables:

1. Create a `.env.local` file in the `gl-ai-console/` directory (if it doesn't exist)
2. Add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://scahyfdsgpfurpcnwyrb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjYWh5ZmRzZ3BmdXJwY253eXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjcwNjQsImV4cCI6MjA3MzU0MzA2NH0.cXW6ZfijLsA4fTkb-Zyptxp2TkUBBrADVONFvtopAPc
```

3. Restart your development server

## Step 5: Test the Integration

1. Start your development server: `npm run dev` (from `gl-ai-console/` directory)
2. Navigate to http://localhost:3000/strms
3. Try creating a new project:
   - Click **Add New Project**
   - Fill in the form
   - Click **Create**
4. Verify in Supabase:
   - Go to **Table Editor** > `strms_projects`
   - You should see your new project
5. Try editing and deleting projects
6. Check that all operations are reflected in Supabase

## Step 6: Migrate Existing Data (Optional)

If you have existing data in localStorage that you want to migrate to Supabase:

1. Open your browser's Developer Console
2. Run this script to export localStorage data:

```javascript
const data = localStorage.getItem('gl-ai-console-leads')
console.log(JSON.parse(data))
```

3. Manually create records in Supabase using the SQL Editor or the Table Editor UI

## Implementation Status

### Completed:
- ✅ Database schema created (`supabase_migration.sql`)
- ✅ Supabase client configuration ([src/lib/supabase/client.ts](src/lib/supabase/client.ts))
- ✅ TypeScript types ([src/lib/supabase/types.ts](src/lib/supabase/types.ts))
- ✅ Projects CRUD API ([src/lib/supabase/projects.ts](src/lib/supabase/projects.ts))
- ✅ File management API ([src/lib/supabase/files.ts](src/lib/supabase/files.ts))
- ✅ Stage data management API ([src/lib/supabase/stage-data.ts](src/lib/supabase/stage-data.ts))
- ✅ Sprint pricing API ([src/lib/supabase/sprint-pricing.ts](src/lib/supabase/sprint-pricing.ts))
- ✅ Updated leads-store.ts to use Supabase
- ✅ Updated STRMS page with async operations

### Remaining Work:
- ⏳ Update Lead Detail page ([src/app/strms/leads/[id]/page.tsx](src/app/strms/leads/[id]/page.tsx))
  - Make getLeadById calls async
  - Add file upload integration with Supabase Storage
  - Add loading states
- ⏳ Update Timeline component ([src/components/leads/timeline.tsx](src/components/leads/timeline.tsx))
  - Integrate file uploads with Supabase Storage
  - Save stage-specific data to Supabase
  - Load existing files and stage data on mount
- ⏳ Update FileUpload component ([src/components/leads/file-upload.tsx](src/components/leads/file-upload.tsx))
  - Replace local file storage with Supabase Storage
  - Add download functionality for existing files
  - Show upload progress
- ⏳ Add comprehensive error handling and user feedback throughout

## File Structure

```
gl-ai-console/
├── src/
│   └── lib/
│       └── supabase/
│           ├── client.ts           # Supabase client configuration
│           ├── types.ts            # TypeScript types for database schema
│           ├── projects.ts         # Projects CRUD operations
│           ├── files.ts            # File management (upload, download, delete)
│           ├── stage-data.ts       # Stage-specific data management
│           └── sprint-pricing.ts   # Sprint pricing management
└── supabase_migration.sql         # Database schema migration
```

## Troubleshooting

### "Failed to fetch projects" error
- Verify that the tables were created successfully in Supabase
- Check that RLS policies are set up correctly
- Ensure the Supabase URL and anon key are correct

### Storage upload fails
- Verify that the storage bucket exists and is named exactly `strms-project-files`
- Check that storage policies allow INSERT operations
- Ensure file size is under 50MB

### No data appears after refresh
- Open browser DevTools > Network tab
- Look for failed requests to Supabase
- Check the Console for error messages

## Next Steps

After completing the database and storage setup:

1. Continue implementing the file upload integration
2. Test all CRUD operations thoroughly
3. Add real-time subscriptions for live updates (optional)
4. Implement proper authentication (future enhancement)
5. Refine RLS policies for production security

## Database Schema Overview

### strms_projects
Main project/lead table containing basic project information.

**Columns:**
- `id` (UUID, PK): Unique project identifier
- `project_name` (TEXT): Name of the project
- `company` (TEXT): Company name
- `contact_name` (TEXT): Primary contact name
- `email` (TEXT): Contact email
- `current_stage` (TEXT): Current pipeline stage
- `last_activity` (TIMESTAMPTZ): Last activity timestamp
- `created_at`, `updated_at` (TIMESTAMPTZ): Audit timestamps

### strms_project_files
File metadata for all uploaded documents.

**Columns:**
- `id` (UUID, PK): Unique file identifier
- `project_id` (UUID, FK): Reference to project
- `file_type_id` (TEXT): Type of file (e.g., 'demo-call-transcript')
- `file_name` (TEXT): Original filename
- `file_path` (TEXT): Public URL to file
- `file_size` (BIGINT): File size in bytes
- `uploaded_by` (TEXT): User who uploaded
- `storage_bucket` (TEXT): Storage bucket name
- `storage_path` (TEXT): Path in storage bucket
- `uploaded_at` (TIMESTAMPTZ): Upload timestamp

### strms_project_stage_data
Stage-specific data (decisions, boolean flags, text fields).

**Columns:**
- `id` (UUID, PK): Unique identifier
- `project_id` (UUID, FK): Reference to project
- `stage_id` (TEXT): Stage identifier (e.g., 'decision', 'ea', 'setup')
- `data_key` (TEXT): Data key (e.g., 'selected_developer', 'anchor_contact_created')
- `data_value` (JSONB): Data value
- `created_at`, `updated_at` (TIMESTAMPTZ): Audit timestamps

### strms_sprint_pricing
Sprint pricing estimates and confirmed values.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `project_id` (UUID, FK): Reference to project
- `ai_sprint_length`, `ai_price`, `ai_explanation`: AI-generated estimates
- `confirmed_sprint_length`, `confirmed_price`: User-confirmed values
- `adjustment_reasoning` (TEXT): Reasoning if adjusted
- `created_at`, `updated_at` (TIMESTAMPTZ): Audit timestamps
