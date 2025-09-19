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
      return JSON.parse(stored)
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