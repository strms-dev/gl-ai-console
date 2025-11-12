"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { getDevProjects, getMaintTickets } from "@/lib/project-store"

interface CustomerSelectorProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  showLabel?: boolean
}

export function CustomerSelector({ value, onChange, required = false, showLabel = true }: CustomerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get unique customers from existing projects and tickets
  const getExistingCustomers = (): string[] => {
    const projects = getDevProjects()
    const tickets = getMaintTickets()

    const allCustomers = [
      ...projects.map(p => p.customer),
      ...tickets.map(t => t.customer)
    ]

    // Get unique, non-empty customers and sort alphabetically
    const uniqueCustomers = Array.from(new Set(allCustomers.filter(c => c && c.trim())))
    return uniqueCustomers.sort((a, b) => a.localeCompare(b))
  }

  const existingCustomers = getExistingCustomers()

  // Filter customers based on search query
  const filteredCustomers = existingCustomers.filter(customer =>
    customer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Check if search query matches an existing customer exactly
  const exactMatch = existingCustomers.some(
    customer => customer.toLowerCase() === searchQuery.toLowerCase()
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsAddingNew(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelectCustomer = (customer: string) => {
    onChange(customer)
    setSearchQuery("")
    setIsOpen(false)
    setIsAddingNew(false)
  }

  const handleAddNewCustomer = () => {
    if (searchQuery.trim()) {
      onChange(searchQuery.trim())
      setSearchQuery("")
      setIsOpen(false)
      setIsAddingNew(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleInputClick = () => {
    setIsOpen(true)
    if (inputRef.current) {
      inputRef.current.select()
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {showLabel && (
        <Label htmlFor="customer" style={{ fontFamily: 'var(--font-body)' }}>
          Customer {required && "*"}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          id="customer"
          value={value || searchQuery}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder="Select or type customer name..."
          required={required}
          className={cn(
            "pr-8",
            !showLabel && "text-sm bg-white border border-[#E5E5E5] rounded-md px-3 py-1.5 outline-none hover:border-[#407B9D] focus:border-[#407B9D] focus:ring-2 focus:ring-[#407B9D]/20 transition-all"
          )}
          style={!showLabel ? { fontFamily: 'var(--font-body)' } : undefined}
        />
        <ChevronDown
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-transform cursor-pointer",
            isOpen && "rotate-180"
          )}
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-[240px] overflow-y-auto">
          {filteredCustomers.length > 0 ? (
            <>
              {filteredCustomers.map((customer) => (
                <div
                  key={customer}
                  className={cn(
                    "px-3 py-2 cursor-pointer hover:bg-[#95CBD7]/10 flex items-center justify-between transition-colors",
                    value === customer && "bg-[#95CBD7]/20"
                  )}
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <span
                    className="text-sm"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {customer}
                  </span>
                  {value === customer && (
                    <Check className="w-4 h-4 text-[#407B9D]" />
                  )}
                </div>
              ))}
            </>
          ) : searchQuery.trim() && !exactMatch ? (
            <div
              className="px-3 py-2 cursor-pointer hover:bg-[#95CBD7]/10 transition-colors"
              onClick={handleAddNewCustomer}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#407B9D] font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                  + Add "{searchQuery.trim()}"
                </span>
              </div>
            </div>
          ) : null}

          {/* Show "Add new" option when typing and no exact match */}
          {searchQuery.trim() && !exactMatch && filteredCustomers.length > 0 && (
            <div
              className="px-3 py-2 cursor-pointer hover:bg-[#95CBD7]/10 transition-colors border-t border-border"
              onClick={handleAddNewCustomer}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#407B9D] font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                  + Add "{searchQuery.trim()}" as new customer
                </span>
              </div>
            </div>
          )}

          {filteredCustomers.length === 0 && !searchQuery.trim() && (
            <div className="px-3 py-2 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
              Start typing to search or add a customer...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
