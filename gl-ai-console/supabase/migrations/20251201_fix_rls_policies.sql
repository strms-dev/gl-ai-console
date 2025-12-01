-- Fix RLS policies for offboarding tables
-- This allows access with the anon key (for apps without authentication)

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow all for authenticated users" ON strms_offboarding_customers;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON strms_offboarding_completion_dates;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON strms_offboarding_checklist_items;

-- Create new permissive policies that allow anon access
-- Note: Adjust these if you implement authentication later

-- Customers table - allow all operations
CREATE POLICY "Allow all operations" ON strms_offboarding_customers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Completion dates table - allow all operations
CREATE POLICY "Allow all operations" ON strms_offboarding_completion_dates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Checklist items table - allow all operations
CREATE POLICY "Allow all operations" ON strms_offboarding_checklist_items
  FOR ALL
  USING (true)
  WITH CHECK (true);
