-- Migration: remove_sprint_length_from_maintenance
-- Description: Remove sprint_length column from maintenance_tickets table
-- Sprint length only applies to development projects, not maintenance tickets

ALTER TABLE strms_maintenance_tickets DROP COLUMN IF EXISTS sprint_length;
