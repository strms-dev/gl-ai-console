-- Migration: Create STRMS Offboarding Tables
-- Description: Three-table normalized design for customer offboarding workflow
-- Tables: strms_offboarding_customers, strms_offboarding_completion_dates, strms_offboarding_checklist_items

-- ============================================================================
-- Main Customer Table
-- ============================================================================
CREATE TABLE strms_offboarding_customers (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  contact TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN (
    'active',
    'terminate-automations',
    'terminate-billing',
    'revoke-access',
    'update-inventory',
    'send-email',
    'complete'
  )),
  last_activity TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Stage Completion Dates Table
-- ============================================================================
CREATE TABLE strms_offboarding_completion_dates (
  customer_id TEXT NOT NULL REFERENCES strms_offboarding_customers(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (customer_id, stage_id)
);

-- ============================================================================
-- Checklist Items Table
-- ============================================================================
CREATE TABLE strms_offboarding_checklist_items (
  customer_id TEXT NOT NULL REFERENCES strms_offboarding_customers(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  checked_at TIMESTAMPTZ,
  PRIMARY KEY (customer_id, stage_id, item_id)
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
CREATE INDEX idx_strms_offboarding_customers_stage ON strms_offboarding_customers(stage);
CREATE INDEX idx_strms_offboarding_customers_updated_at ON strms_offboarding_customers(updated_at DESC);
CREATE INDEX idx_strms_offboarding_customers_email ON strms_offboarding_customers(email);
CREATE INDEX idx_strms_offboarding_completion_dates_customer ON strms_offboarding_completion_dates(customer_id);
CREATE INDEX idx_strms_offboarding_checklist_customer ON strms_offboarding_checklist_items(customer_id);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
ALTER TABLE strms_offboarding_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE strms_offboarding_completion_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE strms_offboarding_checklist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth requirements)
-- For now, allow all authenticated users full access

-- Customers table policies
CREATE POLICY "Allow all for authenticated users" ON strms_offboarding_customers
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Completion dates table policies
CREATE POLICY "Allow all for authenticated users" ON strms_offboarding_completion_dates
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Checklist items table policies
CREATE POLICY "Allow all for authenticated users" ON strms_offboarding_checklist_items
  FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Optional: Trigger to auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_strms_offboarding_customers_updated_at
  BEFORE UPDATE ON strms_offboarding_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
