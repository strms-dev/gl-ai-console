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
          confirmed_sprint_length?: string | null
          confirmed_price?: number | null
          adjustment_reasoning?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
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
