// TypeScript types for Supabase database schema
// This file defines the structure of all tables in the STRMS department database

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      strms_projects: {
        Row: {
          id: string
          project_name: string
          company: string
          contact_name: string
          email: string
          current_stage: string
          project_status: string
          last_activity: string
          created_at: string
          updated_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          project_name: string
          company: string
          contact_name: string
          email: string
          current_stage?: string
          project_status?: string
          last_activity?: string
          created_at?: string
          updated_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          project_name?: string
          company?: string
          contact_name?: string
          email?: string
          current_stage?: string
          project_status?: string
          last_activity?: string
          created_at?: string
          updated_at?: string
          notes?: string | null
        }
      }
      strms_project_files: {
        Row: {
          id: string
          project_id: string
          file_type_id: string
          file_name: string
          file_path: string
          file_size: number
          uploaded_by: string
          uploaded_at: string
          storage_bucket: string
          storage_path: string
        }
        Insert: {
          id?: string
          project_id: string
          file_type_id: string
          file_name: string
          file_path: string
          file_size: number
          uploaded_by: string
          uploaded_at?: string
          storage_bucket?: string
          storage_path: string
        }
        Update: {
          id?: string
          project_id?: string
          file_type_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          uploaded_by?: string
          uploaded_at?: string
          storage_bucket?: string
          storage_path?: string
        }
      }
      strms_project_stage_data: {
        Row: {
          id: string
          project_id: string
          stage_id: string
          data_key: string
          data_value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          stage_id: string
          data_key: string
          data_value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          stage_id?: string
          data_key?: string
          data_value?: Json
          created_at?: string
          updated_at?: string
        }
      }
      strms_sprint_pricing: {
        Row: {
          id: string
          project_id: string
          ai_sprint_length: string | null
          ai_price: number | null
          ai_explanation: string | null
          ai_scope: string | null
          confirmed_sprint_length: string | null
          confirmed_price: number | null
          adjustment_reasoning: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          ai_sprint_length?: string | null
          ai_price?: number | null
          ai_explanation?: string | null
          ai_scope?: string | null
          confirmed_sprint_length?: string | null
          confirmed_price?: number | null
          adjustment_reasoning?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          ai_sprint_length?: string | null
          ai_price?: number | null
          ai_explanation?: string | null
          ai_scope?: string | null
          confirmed_sprint_length?: string | null
          confirmed_price?: number | null
          adjustment_reasoning?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      revops_funnel_leads: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          company_name: string
          company_domain: string | null
          notes: string | null
          hs_contact_created: boolean
          hs_contact_url: string | null
          hs_sequence_enrolled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          company_name: string
          company_domain?: string | null
          notes?: string | null
          hs_contact_created?: boolean
          hs_contact_url?: string | null
          hs_sequence_enrolled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          company_name?: string
          company_domain?: string | null
          notes?: string | null
          hs_contact_created?: boolean
          hs_contact_url?: string | null
          hs_sequence_enrolled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      revops_pipeline_deals: {
        Row: {
          id: string
          deal_name: string
          company_name: string
          first_name: string | null
          last_name: string | null
          email: string | null
          stage: string
          hs_stage: string | null
          hs_deal_id: string | null
          hs_deal_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_name: string
          company_name: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          stage: string
          hs_stage?: string | null
          hs_deal_id?: string | null
          hs_deal_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_name?: string
          company_name?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          stage?: string
          hs_stage?: string | null
          hs_deal_id?: string | null
          hs_deal_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      revops_pipeline_files: {
        Row: {
          id: string
          deal_id: string
          file_type_id: string
          file_name: string
          file_path: string
          file_size: number
          uploaded_by: string
          uploaded_at: string
          storage_bucket: string
          storage_path: string
        }
        Insert: {
          id?: string
          deal_id: string
          file_type_id: string
          file_name: string
          file_path: string
          file_size: number
          uploaded_by?: string
          uploaded_at?: string
          storage_bucket?: string
          storage_path: string
        }
        Update: {
          id?: string
          deal_id?: string
          file_type_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          uploaded_by?: string
          uploaded_at?: string
          storage_bucket?: string
          storage_path?: string
        }
      }
      revops_sales_intakes: {
        Row: {
          id: string
          deal_id: string
          company_name: string | null
          contact_name: string | null
          email_address: string | null
          entity_type: string | null
          has_restricted_grants: string | null
          uses_qbo_or_xero: string | null
          accounting_platform: string | null
          accounting_basis: string | null
          bookkeeping_cadence: string | null
          needs_financials_before_15th: string | null
          financial_review_frequency: string | null
          payroll_provider: string | null
          has_401k: string | null
          payroll_departments: string | null
          employee_count: string | null
          tracks_expenses_by_employee: string | null
          expense_platform: string | null
          expense_platform_employees: string | null
          needs_bill_pay_support: string | null
          bill_pay_cadence: string | null
          bills_per_month: string | null
          needs_invoicing_support: string | null
          invoicing_cadence: string | null
          invoices_per_month: string | null
          interested_in_cfo_review: string | null
          additional_notes: string | null
          fireflies_video_link: string | null
          field_confidence: Json
          is_auto_filled: boolean
          auto_filled_at: string | null
          is_confirmed: boolean
          confirmed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          company_name?: string | null
          contact_name?: string | null
          email_address?: string | null
          entity_type?: string | null
          has_restricted_grants?: string | null
          uses_qbo_or_xero?: string | null
          accounting_platform?: string | null
          accounting_basis?: string | null
          bookkeeping_cadence?: string | null
          needs_financials_before_15th?: string | null
          financial_review_frequency?: string | null
          payroll_provider?: string | null
          has_401k?: string | null
          payroll_departments?: string | null
          employee_count?: string | null
          tracks_expenses_by_employee?: string | null
          expense_platform?: string | null
          expense_platform_employees?: string | null
          needs_bill_pay_support?: string | null
          bill_pay_cadence?: string | null
          bills_per_month?: string | null
          needs_invoicing_support?: string | null
          invoicing_cadence?: string | null
          invoices_per_month?: string | null
          interested_in_cfo_review?: string | null
          additional_notes?: string | null
          fireflies_video_link?: string | null
          field_confidence?: Json
          is_auto_filled?: boolean
          auto_filled_at?: string | null
          is_confirmed?: boolean
          confirmed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          company_name?: string | null
          contact_name?: string | null
          email_address?: string | null
          entity_type?: string | null
          has_restricted_grants?: string | null
          uses_qbo_or_xero?: string | null
          accounting_platform?: string | null
          accounting_basis?: string | null
          bookkeeping_cadence?: string | null
          needs_financials_before_15th?: string | null
          financial_review_frequency?: string | null
          payroll_provider?: string | null
          has_401k?: string | null
          payroll_departments?: string | null
          employee_count?: string | null
          tracks_expenses_by_employee?: string | null
          expense_platform?: string | null
          expense_platform_employees?: string | null
          needs_bill_pay_support?: string | null
          bill_pay_cadence?: string | null
          bills_per_month?: string | null
          needs_invoicing_support?: string | null
          invoicing_cadence?: string | null
          invoices_per_month?: string | null
          interested_in_cfo_review?: string | null
          additional_notes?: string | null
          fireflies_video_link?: string | null
          field_confidence?: Json
          is_auto_filled?: boolean
          auto_filled_at?: string | null
          is_confirmed?: boolean
          confirmed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Views: {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Functions: {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Enums: {}
  }
}

// Convenience types for application use
export type Project = Database['public']['Tables']['strms_projects']['Row']
export type ProjectInsert = Database['public']['Tables']['strms_projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['strms_projects']['Update']

export type ProjectFile = Database['public']['Tables']['strms_project_files']['Row']
export type ProjectFileInsert = Database['public']['Tables']['strms_project_files']['Insert']
export type ProjectFileUpdate = Database['public']['Tables']['strms_project_files']['Update']

export type StageData = Database['public']['Tables']['strms_project_stage_data']['Row']
export type StageDataInsert = Database['public']['Tables']['strms_project_stage_data']['Insert']
export type StageDataUpdate = Database['public']['Tables']['strms_project_stage_data']['Update']

export type SprintPricing = Database['public']['Tables']['strms_sprint_pricing']['Row']
export type SprintPricingInsert = Database['public']['Tables']['strms_sprint_pricing']['Insert']
export type SprintPricingUpdate = Database['public']['Tables']['strms_sprint_pricing']['Update']

// RevOps Funnel Lead types
export type RevOpsFunnelLead = Database['public']['Tables']['revops_funnel_leads']['Row']
export type RevOpsFunnelLeadInsert = Database['public']['Tables']['revops_funnel_leads']['Insert']
export type RevOpsFunnelLeadUpdate = Database['public']['Tables']['revops_funnel_leads']['Update']

// RevOps Pipeline Deal types
export type RevOpsPipelineDeal = Database['public']['Tables']['revops_pipeline_deals']['Row']
export type RevOpsPipelineDealInsert = Database['public']['Tables']['revops_pipeline_deals']['Insert']
export type RevOpsPipelineDealUpdate = Database['public']['Tables']['revops_pipeline_deals']['Update']

// RevOps Pipeline File types
export type RevOpsPipelineFile = Database['public']['Tables']['revops_pipeline_files']['Row']
export type RevOpsPipelineFileInsert = Database['public']['Tables']['revops_pipeline_files']['Insert']
export type RevOpsPipelineFileUpdate = Database['public']['Tables']['revops_pipeline_files']['Update']

// RevOps Sales Intake types
export type RevOpsSalesIntake = Database['public']['Tables']['revops_sales_intakes']['Row']
export type RevOpsSalesIntakeInsert = Database['public']['Tables']['revops_sales_intakes']['Insert']
export type RevOpsSalesIntakeUpdate = Database['public']['Tables']['revops_sales_intakes']['Update']

// Complete project data including related tables
export interface ProjectWithDetails extends Project {
  files?: ProjectFile[]
  stageData?: StageData[]
  sprintPricing?: SprintPricing | null
}

// Project status types
export type ProjectStatus =
  | 'active'           // Currently going through pipeline stages
  | 'not-a-fit'        // Stopped at scoping decision - not a fit
  | 'proposal-declined' // Stopped at proposal decision - declined
  | 'onboarding-complete' // All onboarding stages completed

export interface ProjectStatusInfo {
  status: ProjectStatus
  displayName: string
  color: 'blue' | 'red' | 'orange' | 'green'
  icon: string
}
