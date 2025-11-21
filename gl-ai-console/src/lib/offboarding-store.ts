/**
 * Local storage CRUD operations for offboarding customers
 * Pattern based on leads-store.ts but using localStorage for now
 */

import type { OffboardingCustomer, OffboardingStage, OffboardingCompletionDates } from "./offboarding-data"

const STORAGE_KEY = 'strms-offboarding-customers'
const COMPLETION_DATES_KEY = 'strms-offboarding-completion-dates'

// In-memory cache
let customersCache: OffboardingCustomer[] = []
let completionDatesCache: Record<string, OffboardingCompletionDates> = {}

// Initialize from localStorage
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      customersCache = JSON.parse(stored)
    } catch (error) {
      console.error('Error parsing offboarding customers from localStorage:', error)
      customersCache = []
    }
  }

  const storedDates = localStorage.getItem(COMPLETION_DATES_KEY)
  if (storedDates) {
    try {
      completionDatesCache = JSON.parse(storedDates)
    } catch (error) {
      console.error('Error parsing completion dates from localStorage:', error)
      completionDatesCache = {}
    }
  }
}

function saveCustomersToLocalStorage() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customersCache))
  }
}

function saveCompletionDatesToLocalStorage() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COMPLETION_DATES_KEY, JSON.stringify(completionDatesCache))
  }
}

export async function getCustomers(): Promise<OffboardingCustomer[]> {
  return [...customersCache]
}

export async function getCustomerById(id: string): Promise<OffboardingCustomer | undefined> {
  return customersCache.find(customer => customer.id === id)
}

export async function addCustomer(customer: Omit<OffboardingCustomer, 'id'>): Promise<OffboardingCustomer> {
  const newCustomer: OffboardingCustomer = {
    ...customer,
    id: `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  customersCache.push(newCustomer)
  saveCustomersToLocalStorage()

  return newCustomer
}

export async function updateCustomer(id: string, updates: Partial<OffboardingCustomer>): Promise<OffboardingCustomer> {
  const index = customersCache.findIndex(customer => customer.id === id)

  if (index === -1) {
    throw new Error(`Customer with id ${id} not found`)
  }

  const updatedCustomer: OffboardingCustomer = {
    ...customersCache[index],
    ...updates,
    id, // Ensure id doesn't change
    updatedAt: new Date().toISOString()
  }

  customersCache[index] = updatedCustomer
  saveCustomersToLocalStorage()

  return updatedCustomer
}

export async function deleteCustomer(id: string): Promise<void> {
  const index = customersCache.findIndex(customer => customer.id === id)

  if (index === -1) {
    throw new Error(`Customer with id ${id} not found`)
  }

  customersCache.splice(index, 1)
  saveCustomersToLocalStorage()

  // Also delete completion dates for this customer
  delete completionDatesCache[id]
  saveCompletionDatesToLocalStorage()
}

// Completion dates management
export async function getCompletionDates(customerId: string): Promise<OffboardingCompletionDates> {
  return completionDatesCache[customerId] || {}
}

export async function updateCompletionDate(
  customerId: string,
  stageId: string,
  date: string
): Promise<void> {
  if (!completionDatesCache[customerId]) {
    completionDatesCache[customerId] = {}
  }

  completionDatesCache[customerId][stageId] = date
  saveCompletionDatesToLocalStorage()
}

// Utility function to clear all data (useful for testing)
export async function clearAllOffboardingData(): Promise<void> {
  customersCache = []
  completionDatesCache = {}
  saveCustomersToLocalStorage()
  saveCompletionDatesToLocalStorage()
}
