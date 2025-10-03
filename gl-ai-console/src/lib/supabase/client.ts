import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://scahyfdsgpfurpcnwyrb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjYWh5ZmRzZ3BmdXJwY253eXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjcwNjQsImV4cCI6MjA3MzU0MzA2NH0.cXW6ZfijLsA4fTkb-Zyptxp2TkUBBrADVONFvtopAPc'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
