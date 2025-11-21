import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { OffboardingCustomer, stageLabels, stageColors } from "@/lib/offboarding-data"
import { cn } from "@/lib/utils"
import { Pencil, Trash2, AlertTriangle } from "lucide-react"

interface CustomersTableProps {
  customers: OffboardingCustomer[]
  onEditCustomer?: (customer: OffboardingCustomer) => void
  onDeleteCustomer?: (id: string) => void
}

export function CustomersTable({
  customers,
  onEditCustomer,
  onDeleteCustomer
}: CustomersTableProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<OffboardingCustomer | null>(null)

  const handleRowClick = (customerId: string, event: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    if ((event.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/strms/offboarding/customers/${customerId}`)
  }

  const handleDeleteClick = (customer: OffboardingCustomer) => {
    setCustomerToDelete(customer)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (customerToDelete && onDeleteCustomer) {
      onDeleteCustomer(customerToDelete.id)
    }
    setDeleteDialogOpen(false)
    setCustomerToDelete(null)
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setCustomerToDelete(null)
  }

  const tableContent = (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Company</th>
            <th className="text-left py-3 px-4 font-medium">Email</th>
            <th className="text-left py-3 px-4 font-medium">Contact</th>
            <th className="text-left py-3 px-4 font-medium">Stage</th>
            <th className="text-left py-3 px-4 font-medium">Last Activity</th>
            <th className="text-left py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-muted-foreground">
                No customers found. Click &quot;Add New Customer&quot; to get started.
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b hover:bg-muted/50 cursor-pointer"
                onClick={(e) => handleRowClick(customer.id, e)}
              >
                <td className="py-3 px-4">
                  <p className="font-medium">{customer.company || "—"}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium">{customer.email}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium">{customer.contact || "—"}</p>
                </td>
                <td className="py-3 px-4">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    stageColors[customer.stage]
                  )}>
                    {stageLabels[customer.stage]}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-muted-foreground">{customer.lastActivity}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {onEditCustomer && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditCustomer(customer)
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDeleteCustomer && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(customer)
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      {tableContent}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl" style={{fontFamily: 'var(--font-heading)'}}>
                Delete Customer
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="py-4" style={{fontFamily: 'var(--font-body)'}}>
            <p className="text-base mb-3">
              Are you sure you want to delete <span className="font-semibold text-[#407B9D]">{customerToDelete?.company}</span>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete the customer and all associated offboarding data.
            </p>
          </div>

          <DialogFooter>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
              >
                Delete Customer
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
