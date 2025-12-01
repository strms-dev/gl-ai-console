"use client"

import { useState, useMemo, useEffect } from "react"
import { CustomersTable } from "@/components/offboarding/customers-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerForm } from "@/components/offboarding/customer-form"
import { OffboardingCustomer } from "@/lib/offboarding-data"
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from "@/lib/offboarding-store"

type SortField = "stage" | "lastActivity"
type SortOrder = "asc" | "desc"

export default function OffboardingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("lastActivity")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [customers, setCustomers] = useState<OffboardingCustomer[]>([])
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<OffboardingCustomer | null>(null)

  // State to track collapsible sections
  const [collapsedSections, setCollapsedSections] = useState({
    customers: false
  })

  // Load customers from Supabase on mount
  useEffect(() => {
    const loadCustomers = async () => {
      const fetchedCustomers = await getCustomers()
      setCustomers(fetchedCustomers)
    }
    loadCustomers()
  }, [])

  // Helper function to convert relative time to sortable number
  const parseActivityTime = (activity: string): number => {
    const now = Date.now()
    if (activity.includes("hour")) {
      const hours = parseInt(activity.match(/\d+/)?.[0] || "0")
      return now - (hours * 60 * 60 * 1000)
    }
    if (activity.includes("day")) {
      const days = parseInt(activity.match(/\d+/)?.[0] || "0")
      return now - (days * 24 * 60 * 60 * 1000)
    }
    return now
  }

  // Handle creating a new customer
  const handleCreateCustomer = async (customerData: Omit<OffboardingCustomer, "id" | "stage" | "lastActivity" | "createdAt" | "updatedAt">) => {
    try {
      await addCustomer({
        ...customerData,
        stage: "terminate-automations", // Set to first stage (terminate-automations)
        lastActivity: "Just now"
      })
      // Manually refetch to update the list immediately
      const updatedCustomers = await getCustomers()
      setCustomers(updatedCustomers)
    } catch (error) {
      console.error("Failed to create customer:", error)
      alert("Failed to create customer. Please try again.")
    }
  }

  // Handle editing an existing customer
  const handleEditCustomer = async (customerData: Omit<OffboardingCustomer, "id" | "stage" | "lastActivity" | "createdAt" | "updatedAt">) => {
    if (editingCustomer) {
      try {
        await updateCustomer(editingCustomer.id, customerData)
        setEditingCustomer(null)
        // Manually refetch to update the list immediately
        const updatedCustomers = await getCustomers()
        setCustomers(updatedCustomers)
      } catch (error) {
        console.error("Failed to update customer:", error)
        alert("Failed to update customer. Please try again.")
      }
    }
  }

  // Open edit form for a specific customer
  const handleOpenEditForm = (customer: OffboardingCustomer) => {
    setEditingCustomer(customer)
    setShowCustomerForm(true)
  }

  // Handle deleting a customer
  const handleDeleteCustomer = async (id: string) => {
    try {
      await deleteCustomer(id)
      // Manually refetch to update the list immediately
      const updatedCustomers = await getCustomers()
      setCustomers(updatedCustomers)
    } catch (error) {
      console.error("Failed to delete customer:", error)
      alert("Failed to delete customer. Please try again.")
    }
  }

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = customers.filter(customer =>
        customer.company.toLowerCase().includes(search) ||
        customer.contact.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search)
      )
    }

    // Sort customers
    return filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case "stage":
          aValue = a.stage
          bValue = b.stage
          break
        case "lastActivity":
          // Convert relative time to sortable number (approximate)
          aValue = parseActivityTime(a.lastActivity)
          bValue = parseActivityTime(b.lastActivity)
          break
        default:
          aValue = a.lastActivity
          bValue = b.lastActivity
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue)
        return sortOrder === "asc" ? result : -result
      } else {
        const result = (aValue as number) - (bValue as number)
        return sortOrder === "asc" ? result : -result
      }
    })
  }, [searchTerm, sortField, sortOrder, customers])

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{fontFamily: 'var(--font-heading)'}}>
            Offboarding
          </h1>
          <p className="text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
            Manage customer offboarding process and track completion status
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customers</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('customers')}
                className="h-8 w-8 p-0"
              >
                {collapsedSections.customers ? "+" : "−"}
              </Button>
            </div>
          </CardHeader>
          {!collapsedSections.customers && (
            <CardContent className="pt-0">
              <div className="mb-4">
                <div className="flex justify-end mb-4">
                  <Button onClick={() => {
                    setEditingCustomer(null)
                    setShowCustomerForm(true)
                  }}>Add New Customer</Button>
                </div>

                {/* Search and Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by company, contact, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value as SortField)}
                      className="h-9 w-[140px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="lastActivity">Last Activity</option>
                      <option value="stage">Stage</option>
                    </select>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                      className="h-9 w-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="desc">Newest</option>
                      <option value="asc">Oldest</option>
                    </select>
                  </div>
                </div>
              </div>

              <CustomersTable
                customers={filteredAndSortedCustomers}
                onEditCustomer={handleOpenEditForm}
                onDeleteCustomer={handleDeleteCustomer}
              />
            </CardContent>
          )}
        </Card>
      </div>

      <CustomerForm
        open={showCustomerForm}
        onOpenChange={(open) => {
          setShowCustomerForm(open)
          if (!open) {
            setEditingCustomer(null)
          }
        }}
        onSubmit={editingCustomer ? handleEditCustomer : handleCreateCustomer}
        initialData={editingCustomer || undefined}
        mode={editingCustomer ? "edit" : "create"}
      />
    </div>
  );
}
