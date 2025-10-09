-- Migration: Add project_status column to strms_projects table
-- Date: 2025-01-07
-- Description: Adds project_status field to track terminal project states (active, not-a-fit, proposal-declined, onboarding-complete)

-- Add project_status column with default value 'active'
ALTER TABLE strms_projects
ADD COLUMN IF NOT EXISTS project_status TEXT NOT NULL DEFAULT 'active';

-- Add a check constraint to ensure only valid status values
ALTER TABLE strms_projects
ADD CONSTRAINT project_status_check
CHECK (project_status IN ('active', 'not-a-fit', 'proposal-declined', 'onboarding-complete'));

-- Add an index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_strms_projects_project_status
ON strms_projects(project_status);

-- Add a comment to document the column
COMMENT ON COLUMN strms_projects.project_status IS 'Current status of the project: active (in pipeline), not-a-fit (rejected at scoping), proposal-declined (rejected at proposal), onboarding-complete (all stages completed)';
