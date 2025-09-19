import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lead, stageLabels, stageColors } from "@/lib/dummy-data"
import { cn } from "@/lib/utils"

interface LeadsTableProps {
  leads: Lead[]
  onEditLead?: (lead: Lead) => void
}

export function LeadsTable({ leads, onEditLead }: LeadsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Leads</CardTitle>
      </CardHeader>
      <CardContent>
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
                <tr key={lead.id} className="border-b hover:bg-muted/50">
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
                      <Link href={`/strms/leads/${lead.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      {onEditLead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditLead(lead)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}