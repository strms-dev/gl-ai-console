-- =====================================================
-- RevOps Sales Funnel - Supabase Database Schema
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

-- Create main funnel leads table for RevOps department
CREATE TABLE IF NOT EXISTS revops_funnel_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_domain TEXT,
  notes TEXT,
  hs_contact_created BOOLEAN NOT NULL DEFAULT FALSE,
  hs_sequence_enrolled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_revops_funnel_leads_email ON revops_funnel_leads(email);
CREATE INDEX IF NOT EXISTS idx_revops_funnel_leads_company_name ON revops_funnel_leads(company_name);
CREATE INDEX IF NOT EXISTS idx_revops_funnel_leads_created_at ON revops_funnel_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revops_funnel_leads_hs_contact_created ON revops_funnel_leads(hs_contact_created);
CREATE INDEX IF NOT EXISTS idx_revops_funnel_leads_hs_sequence_enrolled ON revops_funnel_leads(hs_sequence_enrolled);

-- Add updated_at trigger (reuse existing function from STRMS schema)
DROP TRIGGER IF EXISTS update_revops_funnel_leads_updated_at ON revops_funnel_leads;
CREATE TRIGGER update_revops_funnel_leads_updated_at
  BEFORE UPDATE ON revops_funnel_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for future auth implementation
ALTER TABLE revops_funnel_leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations on revops_funnel_leads" ON revops_funnel_leads;

-- Create permissive policy for now (allow all operations)
-- This should be refined when authentication is implemented
CREATE POLICY "Allow all operations on revops_funnel_leads"
  ON revops_funnel_leads
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- MIGRATION NOTE:
-- After running this script, existing localStorage data
-- can be migrated using the browser console migration utility.
-- =====================================================
