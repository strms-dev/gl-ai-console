-- Migration: simplify_time_entries_schema
-- Description: Remove redundant start_time and end_time columns from time_entries table
-- Since there's no timer feature and users add time in one shot, we only need created_at

-- Drop the start_time and end_time columns
ALTER TABLE strms_time_entries DROP COLUMN IF EXISTS start_time;
ALTER TABLE strms_time_entries DROP COLUMN IF EXISTS end_time;

-- created_at already exists and is auto-populated, so we don't need to add it
