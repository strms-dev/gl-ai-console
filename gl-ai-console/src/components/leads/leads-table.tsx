import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lead, stageLabels, stageColors } from "@/lib/dummy-data"
import { cn } from "@/lib/utils"
import { Pencil, Trash2 } from "lucide-react"

type SortField = "stage" | "lastActivity"
type SortOrder = "asc" | "desc"

interface LeadsTableProps {
  leads: Lead[]
  onEditLead?: (lead: Lead) => void
  onDeleteLead?: (id: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  sortField: SortField
  setSortField: (field: SortField) => void
  sortOrder: SortOrder
  setSortOrder: (order: SortOrder) => void
  onAddNewLead: () => void
  hideCard?: boolean
}

export function LeadsTable({
  leads,
  onEditLead,
  onDeleteLead,
  searchTerm,
  setSearchTerm,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  onAddNewLead,
  hideCard = false
}: LeadsTableProps) {
  const router = useRouter()

  const handleRowClick = (leadId: string, event: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    if ((event.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/strms/leads/${leadId}`)
  }

  const tableContent = (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Company</th>
            <th className="text-left py-3 px-4 font-medium">Contact</th>
            <th className="text-left py-3 px-4 font-medium">Stage</th>
            <th className="text-left py-3 px-4 font-medium">Last Activity</th>
            <th className="text-left py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="border-b hover:bg-muted/50 cursor-pointer"
              onClick={(e) => handleRowClick(lead.id, e)}
            >
              <td className="py-3 px-4">
                <div>
                  <p className="font-medium">{lead.company}</p>
                  <p className="text-sm text-muted-foreground">{lead.email}</p>
                </div>
              </td>
              <td className="py-3 px-4">
                <p className="font-medium">{lead.contact}</p>
              </td>
              <td className="py-3 px-4">
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  stageColors[lead.stage]
                )}>
                  {stageLabels[lead.stage]}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-muted-foreground">{lead.lastActivity}</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  {onEditLead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditLead(lead)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDeleteLead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm(`Are you sure you want to delete ${lead.company}?`)) {
                          onDeleteLead(lead.id)
                        }
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  if (hideCard) {
    return tableContent
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Leads</CardTitle>
          <Button onClick={onAddNewLead}>Add New Lead</Button>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
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
      </CardHeader>
      <CardContent>
        {tableContent}
      </CardContent>
    </Card>
  )
}