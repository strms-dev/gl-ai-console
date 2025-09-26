"use client"

import { Lead, dummyLeads } from "@/lib/dummy-data"

const LEADS_STORAGE_KEY = "gl-ai-console-leads"

export function getLeads(): Lead[] {
  if (typeof window === "undefined") {
    return dummyLeads
  }

  try {
    const stored = localStorage.getItem(LEADS_STORAGE_KEY)
    if (stored) {
      const leads = JSON.parse(stored)

      // Migrate existing leads to include projectName field
      const migratedLeads = leads.map((lead: any) => {
        if (!lead.projectName) {
          // For the existing Acme Corp lead, set the project name
          if (lead.id === "lead-1" && lead.company === "Acme Corp") {
            return { ...lead, projectName: "Karbon > Notion Sync" }
          }
          // For other leads without projectName, use empty string
          return { ...lead, projectName: "" }
        }
        return lead
      })

      // Save migrated data back to localStorage
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(migratedLeads))
      return migratedLeads
    }
  } catch (error) {
    console.error("Error reading leads from localStorage:", error)
  }

  // Initialize with dummy data if nothing stored
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(dummyLeads))
  return dummyLeads
}

export function saveLeads(leads: Lead[]): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads))
  } catch (error) {
    console.error("Error saving leads to localStorage:", error)
  }
}

export function getLeadById(id: string): Lead | undefined {
  const leads = getLeads()
  return leads.find(lead => lead.id === id)
}

export function addLead(lead: Lead): void {
  const leads = getLeads()
  const updatedLeads = [lead, ...leads]
  saveLeads(updatedLeads)
}

export function updateLead(id: string, updates: Partial<Lead>): void {
  const leads = getLeads()
  const updatedLeads = leads.map(lead =>
    lead.id === id ? { ...lead, ...updates } : lead
  )
  saveLeads(updatedLeads)
}

export function deleteLead(id: string): void {
  const leads = getLeads()
  const updatedLeads = leads.filter(lead => lead.id !== id)
  saveLeads(updatedLeads)
}

