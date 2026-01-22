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
      revops_follow_up_emails: {
        Row: {
          id: string
          deal_id: string
          template_type: string | null
          to_email: string
          cc_email: string
          email_subject: string
          email_body: string
          is_edited: boolean
          sent_at: string | null
          hubspot_deal_moved: boolean
          hubspot_deal_moved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          template_type?: string | null
          to_email?: string
          cc_email?: string
          email_subject?: string
          email_body?: string
          is_edited?: boolean
          sent_at?: string | null
          hubspot_deal_moved?: boolean
          hubspot_deal_moved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          template_type?: string | null
          to_email?: string
          cc_email?: string
          email_subject?: string
          email_body?: string
          is_edited?: boolean
          sent_at?: string | null
          hubspot_deal_moved?: boolean
          hubspot_deal_moved_at?: string | null
          created_at?: string
          updated_at?: string
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
      revops_gl_reviews: {
        Row: {
          id: string
          deal_id: string
          review_type: 'ai' | 'team' | 'final'
          email: string | null
          company_name: string | null
          lead_name: string | null
          accounts: Json
          ecommerce: Json
          revenue_coa_allocations: string | null
          coa_revenue_categories: string | null
          active_classes: string | null
          catchup_required: string | null
          catchup_date_range: string | null
          catchup_months: string | null
          additional_notes: string | null
          field_confidence: Json
          qbo_client_name: string | null
          qbo_access_confirmed_at: string | null
          is_auto_filled: boolean
          auto_filled_at: string | null
          submitted_by: string | null
          google_form_response_id: string | null
          field_selections: Json
          custom_values: Json
          is_confirmed: boolean
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          review_type: 'ai' | 'team' | 'final'
          email?: string | null
          company_name?: string | null
          lead_name?: string | null
          accounts?: Json
          ecommerce?: Json
          revenue_coa_allocations?: string | null
          coa_revenue_categories?: string | null
          active_classes?: string | null
          catchup_required?: string | null
          catchup_date_range?: string | null
          catchup_months?: string | null
          additional_notes?: string | null
          field_confidence?: Json
          qbo_client_name?: string | null
          qbo_access_confirmed_at?: string | null
          is_auto_filled?: boolean
          auto_filled_at?: string | null
          submitted_by?: string | null
          google_form_response_id?: string | null
          field_selections?: Json
          custom_values?: Json
          is_confirmed?: boolean
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          review_type?: 'ai' | 'team' | 'final'
          email?: string | null
          company_name?: string | null
          lead_name?: string | null
          accounts?: Json
          ecommerce?: Json
          revenue_coa_allocations?: string | null
          coa_revenue_categories?: string | null
          active_classes?: string | null
          catchup_required?: string | null
          catchup_date_range?: string | null
          catchup_months?: string | null
          additional_notes?: string | null
          field_confidence?: Json
          qbo_client_name?: string | null
          qbo_access_confirmed_at?: string | null
          is_auto_filled?: boolean
          auto_filled_at?: string | null
          submitted_by?: string | null
          google_form_response_id?: string | null
          field_selections?: Json
          custom_values?: Json
          is_confirmed?: boolean
          confirmed_at?: string | null
          confirmed_by?: string | null
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

// RevOps Follow-up Email types
export type RevOpsFollowUpEmail = Database['public']['Tables']['revops_follow_up_emails']['Row']
export type RevOpsFollowUpEmailInsert = Database['public']['Tables']['revops_follow_up_emails']['Insert']
export type RevOpsFollowUpEmailUpdate = Database['public']['Tables']['revops_follow_up_emails']['Update']

// RevOps GL Review types
export type RevOpsGLReview = Database['public']['Tables']['revops_gl_reviews']['Row']
export type RevOpsGLReviewInsert = Database['public']['Tables']['revops_gl_reviews']['Insert']
export type RevOpsGLReviewUpdate = Database['public']['Tables']['revops_gl_reviews']['Update']

// GL Review type discriminator
export type GLReviewType = 'ai' | 'team' | 'final'

// GL Review account structure for JSONB field
export interface GLReviewAccount {
  name: string
  transactionCount: number
  type?: 'Bank' | 'Credit Card' | 'Long Term Liability'
  category?: '<20' | '20-100' | '>100'
}

// GL Review ecommerce structure for JSONB field
export interface GLReviewEcommerce {
  amazon?: boolean
  shopify?: boolean
  square?: boolean
  etsy?: boolean
  ebay?: boolean
  woocommerce?: boolean
  stripe?: boolean
  paypal?: boolean
  other?: string
}

// GL Review field confidence structure for JSONB field
export interface GLReviewFieldConfidence {
  [fieldName: string]: 'high' | 'medium' | 'low'
}

// GL Review field selections for final review (which source was used)
export interface GLReviewFieldSelections {
  [fieldName: string]: 'ai' | 'team' | 'custom'
}

// RevOps Pipeline Stage Data types (key-value storage for stage data)
export interface RevOpsPipelineStageData {
  id: string
  deal_id: string
  stage_id: string
  data_key: string
  data_value: Json
  created_at: string
  updated_at: string
}

export interface RevOpsPipelineStageDataInsert {
  id?: string
  deal_id: string
  stage_id: string
  data_key: string
  data_value: Json
  created_at?: string
  updated_at?: string
}

export interface RevOpsPipelineStageDataUpdate {
  data_value?: Json
  updated_at?: string
}

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
