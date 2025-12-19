"use client"

// Managed Internal Recipients Store
// Stores the pool of team members available for Internal Team Assignment

export interface ManagedRecipient {
  id: string
  name: string
  email: string
  isActive: boolean
  createdAt: string
}

const STORAGE_KEY = "revops-internal-recipients"

// Default recipients to seed the store
const DEFAULT_RECIPIENTS: Omit<ManagedRecipient, "id" | "createdAt">[] = [
  { name: "Lori Chambless", email: "l.chambless@growthlabfinancial.com", isActive: true },
  { name: "Robin Brown", email: "r.brown@growthlabfinancial.com", isActive: true },
  { name: "Stephen Cummings", email: "s.cummings@growthlabfinancial.com", isActive: true }
]

// Generate a simple unique ID
function generateId(): string {
  return `recipient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get all managed recipients from localStorage
export function getManagedRecipients(): ManagedRecipient[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    // Initialize with default recipients
    const defaultWithIds: ManagedRecipient[] = DEFAULT_RECIPIENTS.map((r) => ({
      ...r,
      id: generateId(),
      createdAt: new Date().toISOString()
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWithIds))
    return defaultWithIds
  }

  try {
    return JSON.parse(stored) as ManagedRecipient[]
  } catch {
    return []
  }
}

// Get only active recipients (for display in selection UI)
export function getActiveRecipients(): ManagedRecipient[] {
  return getManagedRecipients().filter(r => r.isActive)
}

// Add a new recipient to the pool
export function addManagedRecipient(name: string, email: string): ManagedRecipient {
  const recipients = getManagedRecipients()

  const newRecipient: ManagedRecipient = {
    id: generateId(),
    name,
    email,
    isActive: true,
    createdAt: new Date().toISOString()
  }

  recipients.push(newRecipient)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipients))

  return newRecipient
}

// Update an existing recipient
export function updateManagedRecipient(
  id: string,
  updates: Partial<Pick<ManagedRecipient, "name" | "email" | "isActive">>
): ManagedRecipient | null {
  const recipients = getManagedRecipients()
  const index = recipients.findIndex(r => r.id === id)

  if (index === -1) return null

  recipients[index] = { ...recipients[index], ...updates }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipients))

  return recipients[index]
}

// Delete a recipient from the pool
export function deleteManagedRecipient(id: string): boolean {
  const recipients = getManagedRecipients()
  const filtered = recipients.filter(r => r.id !== id)

  if (filtered.length === recipients.length) return false

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

// Toggle recipient active status
export function toggleRecipientActive(id: string): ManagedRecipient | null {
  const recipients = getManagedRecipients()
  const recipient = recipients.find(r => r.id === id)

  if (!recipient) return null

  return updateManagedRecipient(id, { isActive: !recipient.isActive })
}

// Check if email already exists in the pool
export function recipientEmailExists(email: string, excludeId?: string): boolean {
  const recipients = getManagedRecipients()
  return recipients.some(r => r.email.toLowerCase() === email.toLowerCase() && r.id !== excludeId)
}
