-- Migration: create_project_management_tables
-- Description: Create tables for dev_projects, maintenance_tickets, and time_entries

-- Create dev_projects table
CREATE TABLE dev_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text,
  customer text,
  sprint_length text CHECK (sprint_length IN ('0.5x', '1x', '1.5x', '2x')),
  start_date date,
  end_date date,
  status text CHECK (status IN ('setup', 'connections', 'dev-in-progress', 'user-testing', 'complete', 'cancelled')),
  assignee text CHECK (assignee IN ('Nick', 'Gon')),
  priority integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_date timestamptz
);

-- Create maintenance_tickets table
CREATE TABLE maintenance_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_title text,
  customer text,
  ticket_type text CHECK (ticket_type IN ('Maintenance', 'Customization')),
  platform text CHECK (platform IN ('n8n', 'Make', 'Zapier', 'Prismatic')),
  number_of_errors integer DEFAULT 0,
  status text CHECK (status IN ('errors-logged', 'on-hold', 'fix-requests', 'in-progress', 'closed')),
  assignee text CHECK (assignee IN ('Nick', 'Gon')),
  start_date date,
  end_date date,
  priority integer DEFAULT 0,
  notes text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_date timestamptz
);

-- Create time_entries table
CREATE TABLE time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid,
  project_type text CHECK (project_type IN ('development', 'maintenance')),
  assignee text CHECK (assignee IN ('Nick', 'Gon')),
  duration integer DEFAULT 0,
  notes text,
  week_start_date date,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_time_entries_project ON time_entries(project_id, project_type);
CREATE INDEX idx_time_entries_week ON time_entries(week_start_date, assignee);
CREATE INDEX idx_dev_projects_assignee ON dev_projects(assignee, status);
CREATE INDEX idx_maintenance_tickets_assignee ON maintenance_tickets(assignee, status);

-- Enable Row Level Security
ALTER TABLE dev_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for internal use
CREATE POLICY "Allow all operations on dev_projects" ON dev_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on maintenance_tickets" ON maintenance_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on time_entries" ON time_entries FOR ALL USING (true) WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dev_projects_updated_at BEFORE UPDATE ON dev_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_tickets_updated_at BEFORE UPDATE ON maintenance_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
