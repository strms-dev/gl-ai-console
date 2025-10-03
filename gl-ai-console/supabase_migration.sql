-- =====================================================
-- GrowthLab AI Console - Supabase Database Schema
-- STRMS Department Project Management
-- =====================================================
--
-- INSTRUCTIONS FOR EXECUTION:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project
-- 3. Go to SQL Editor
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute
--
-- =====================================================

-- Create main projects table for STRMS department
CREATE TABLE IF NOT EXISTS strms_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  current_stage TEXT NOT NULL DEFAULT 'demo',
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_strms_projects_current_stage ON strms_projects(current_stage);
CREATE INDEX IF NOT EXISTS idx_strms_projects_company ON strms_projects(company);
CREATE INDEX IF NOT EXISTS idx_strms_projects_created_at ON strms_projects(created_at DESC);

-- Create project files metadata table
CREATE TABLE IF NOT EXISTS strms_project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES strms_projects(id) ON DELETE CASCADE,
  file_type_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  storage_bucket TEXT NOT NULL DEFAULT 'strms-project-files',
  storage_path TEXT NOT NULL
);

-- Create index for file lookups
CREATE INDEX IF NOT EXISTS idx_strms_project_files_project_id ON strms_project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_strms_project_files_file_type_id ON strms_project_files(file_type_id);

-- Create stage-specific data table (for decisions, text fields, booleans, etc.)
CREATE TABLE IF NOT EXISTS strms_project_stage_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES strms_projects(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  data_key TEXT NOT NULL,
  data_value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, stage_id, data_key)
);

-- Create index for stage data lookups
CREATE INDEX IF NOT EXISTS idx_strms_stage_data_project_id ON strms_project_stage_data(project_id);
CREATE INDEX IF NOT EXISTS idx_strms_stage_data_stage_id ON strms_project_stage_data(stage_id);

-- Create sprint pricing table
CREATE TABLE IF NOT EXISTS strms_sprint_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES strms_projects(id) ON DELETE CASCADE,
  ai_sprint_length TEXT,
  ai_price NUMERIC,
  ai_explanation TEXT,
  confirmed_sprint_length TEXT,
  confirmed_price NUMERIC,
  adjustment_reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Create index for sprint pricing lookups
CREATE INDEX IF NOT EXISTS idx_strms_sprint_pricing_project_id ON strms_sprint_pricing(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at column
DROP TRIGGER IF EXISTS update_strms_projects_updated_at ON strms_projects;
CREATE TRIGGER update_strms_projects_updated_at
  BEFORE UPDATE ON strms_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_strms_stage_data_updated_at ON strms_project_stage_data;
CREATE TRIGGER update_strms_stage_data_updated_at
  BEFORE UPDATE ON strms_project_stage_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_strms_sprint_pricing_updated_at ON strms_sprint_pricing;
CREATE TRIGGER update_strms_sprint_pricing_updated_at
  BEFORE UPDATE ON strms_sprint_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for future auth implementation
ALTER TABLE strms_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE strms_project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE strms_project_stage_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE strms_sprint_pricing ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on strms_projects" ON strms_projects;
DROP POLICY IF EXISTS "Allow all operations on strms_project_files" ON strms_project_files;
DROP POLICY IF EXISTS "Allow all operations on strms_project_stage_data" ON strms_project_stage_data;
DROP POLICY IF EXISTS "Allow all operations on strms_sprint_pricing" ON strms_sprint_pricing;

-- Create permissive policies for now (allow all operations)
-- These should be refined when authentication is implemented
CREATE POLICY "Allow all operations on strms_projects"
  ON strms_projects
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on strms_project_files"
  ON strms_project_files
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on strms_project_stage_data"
  ON strms_project_stage_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on strms_sprint_pricing"
  ON strms_sprint_pricing
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- STORAGE BUCKET SETUP
-- =====================================================
-- Note: Storage buckets must be created via the Supabase Dashboard
-- Go to Storage > Create Bucket
-- Bucket name: strms-project-files
-- Public: No (Private)
-- File size limit: 52428800 (50MB)
-- Allowed MIME types: Leave empty for all types or restrict as needed
--
-- After creating the bucket, add this storage policy:

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('strms-project-files', 'strms-project-files', false)
-- ON CONFLICT (id) DO NOTHING;

-- CREATE POLICY "Allow all operations on strms-project-files bucket"
-- ON storage.objects FOR ALL
-- USING (bucket_id = 'strms-project-files')
-- WITH CHECK (bucket_id = 'strms-project-files');

-- =====================================================
-- TEST DATA (Optional - uncomment to add test project)
-- =====================================================
-- INSERT INTO strms_projects (project_name, company, contact_name, email, current_stage)
-- VALUES ('Karbon > Notion Sync', 'Acme Corp', 'John Smith', 'john@acmecorp.com', 'demo')
-- ON CONFLICT DO NOTHING;
