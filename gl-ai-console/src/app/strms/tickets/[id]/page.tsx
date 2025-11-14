"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, User, Calendar, Clock, FileText, AlertCircle, Wrench } from "lucide-react"
import { MaintenanceTicket, maintStageLabels, maintStageColors, sprintLengthLabels } from "@/lib/dummy-data"
import { getMaintTicketById, updateMaintTicket, deleteMaintTicket } from "@/lib/services/maintenance-service"
import { formatMinutes } from "@/lib/services/time-tracking-service"
import { TicketForm } from "@/components/maintenance/ticket-form"
import { TimeTracker } from "@/components/shared/time-tracker"
import { cn } from "@/lib/utils"

interface TicketDetailPageProps {
  params: {
    id: string
  }
}

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const router = useRouter()
  const [ticket, setTicket] = useState<MaintenanceTicket | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load ticket on mount
  useEffect(() => {
    const loadTicket = () => {
      const fetchedTicket = getMaintTicketById(params.id)
      setTicket(fetchedTicket || null)
      setLoading(false)
    }
    loadTicket()
  }, [params.id])

  // Handle ticket update
  const handleUpdateTicket = (ticketData: any) => {
    if (ticket) {
      updateMaintTicket(ticket.id, ticketData)
      const updatedTicket = getMaintTicketById(ticket.id)
      setTicket(updatedTicket || null)
      setShowEditForm(false)
    }
  }

  // Handle ticket deletion
  const handleDeleteTicket = () => {
    if (ticket && confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      deleteMaintTicket(ticket.id)
      router.push("/strms/maintenance")
    }
  }

  // Handle time logged callback
  const handleTimeLogged = () => {
    // Refresh ticket to update time tracked
    const updatedTicket = getMaintTicketById(params.id)
    setTicket(updatedTicket || null)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
            Loading ticket...
          </p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-[#666666] mb-4" style={{fontFamily: 'var(--font-body)'}}>
              Ticket not found
            </p>
            <Button
              onClick={() => router.push("/strms/maintenance")}
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Maintenance
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/strms/maintenance")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#463939] mb-2" style={{fontFamily: 'var(--font-heading)'}}>
            {ticket.ticketTitle}
          </h1>
          <p className="text-lg text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
            {ticket.customer}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowEditForm(true)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteTicket}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ticket Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle style={{fontFamily: 'var(--font-heading)'}}>Ticket Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
                <span className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                  Status
                </span>
                <span className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                  maintStageColors[ticket.status]
                )}>
                  {maintStageLabels[ticket.status]}
                </span>
              </div>

              {/* Ticket Type */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
                <span className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                  Ticket Type
                </span>
                <Badge className={cn(
                  "border-none",
                  ticket.ticketType === "Maintenance"
                    ? "bg-[#95CBD7] text-[#463939] hover:bg-[#95CBD7]/90"
                    : "bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90"
                )}>
                  {ticket.ticketType}
                </Badge>
              </div>

              {/* Number of Errors */}
              {ticket.numberOfErrors > 0 && (
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
                  <span className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Errors Logged
                  </span>
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span style={{fontFamily: 'var(--font-body)'}}>{ticket.numberOfErrors} error{ticket.numberOfErrors !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}

              {/* Sprint Length */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
                <span className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                  Sprint Length
                </span>
                <Badge className="bg-[#95CBD7] text-[#463939] hover:bg-[#95CBD7]/90 border-none">
                  {sprintLengthLabels[ticket.sprintLength]}
                </Badge>
              </div>

              {/* Assignee */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
                <span className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                  Assignee
                </span>
                <div className="flex items-center gap-2 text-sm text-[#463939]">
                  <User className="w-4 h-4 text-[#407B9D]" />
                  <span style={{fontFamily: 'var(--font-body)'}}>{ticket.assignee}</span>
                </div>
              </div>

              {/* Time Tracked */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
                <span className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                  Time Tracked
                </span>
                <div className="flex items-center gap-2 text-sm text-[#463939]">
                  <Clock className="w-4 h-4 text-[#407B9D]" />
                  <span style={{fontFamily: 'var(--font-body)'}}>{formatMinutes(ticket.timeTracked)}</span>
                </div>
              </div>

              {/* Dates */}
              {ticket.startDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Ticket Dates
                  </span>
                  <div className="flex items-center gap-2 text-sm text-[#463939]">
                    <Calendar className="w-4 h-4 text-[#407B9D]" />
                    <span style={{fontFamily: 'var(--font-body)'}}>
                      {new Date(ticket.startDate).toLocaleDateString()}
                      {ticket.endDate && (
                        <>
                          {" → "}
                          {new Date(ticket.endDate).toLocaleDateString()}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Card */}
          {ticket.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{fontFamily: 'var(--font-heading)'}}>
                  <FileText className="w-5 h-5 text-[#407B9D]" />
                  Ticket Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#666666] whitespace-pre-wrap" style={{fontFamily: 'var(--font-body)'}}>
                  {ticket.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Time Tracker */}
        <div className="lg:col-span-1">
          <TimeTracker
            projectId={ticket.id}
            projectType="maintenance"
            assignee={ticket.assignee}
            onTimeLogged={handleTimeLogged}
          />
        </div>
      </div>

      {/* Edit Form Dialog */}
      <TicketForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSubmit={handleUpdateTicket}
        initialData={ticket}
        mode="edit"
      />
    </div>
  )
}
