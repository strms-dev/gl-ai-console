"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Clock, User, Code, Wrench } from "lucide-react"
import { TimeEntry, Developer } from "@/lib/dummy-data"
import { getTimeEntries, getWeekStartDate, formatMinutes, getDevProjects, getMaintTickets } from "@/lib/project-store"

export default function TimeTrackingPage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>("")
  const [currentWeekStart, setCurrentWeekStart] = useState<string>("")

  // Load data on mount
  useEffect(() => {
    const weekStart = getWeekStartDate()
    setCurrentWeekStart(weekStart)
    setSelectedWeekStart(weekStart)
    setTimeEntries(getTimeEntries())
  }, [])

  // Get all unique weeks from time entries
  const availableWeeks = useMemo(() => {
    const weeks = new Set(timeEntries.map(e => e.weekStartDate))
    return Array.from(weeks).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  }, [timeEntries])

  // Filter entries for selected week
  const weekEntries = useMemo(() => {
    return timeEntries.filter(e => e.weekStartDate === selectedWeekStart)
  }, [timeEntries, selectedWeekStart])

  // Calculate total hours for the week
  const totalWeekMinutes = useMemo(() => {
    return weekEntries.reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries])

  // Calculate hours by developer
  const nickMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.assignee === "Nick")
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries])

  const gonMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.assignee === "Gon")
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries])

  // Calculate hours by project type
  const devMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.projectType === "development")
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries])

  const maintMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.projectType === "maintenance")
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries])

  // Get project/ticket names for entries
  const getProjectName = (entry: TimeEntry): string => {
    if (entry.projectType === "development") {
      const projects = getDevProjects()
      const project = projects.find(p => p.id === entry.projectId)
      return project?.projectName || "Unknown Project"
    } else {
      const tickets = getMaintTickets()
      const ticket = tickets.find(t => t.id === entry.projectId)
      return ticket?.ticketTitle || "Unknown Ticket"
    }
  }

  // Navigation handlers
  const handlePreviousWeek = () => {
    const currentIndex = availableWeeks.indexOf(selectedWeekStart)
    if (currentIndex < availableWeeks.length - 1) {
      setSelectedWeekStart(availableWeeks[currentIndex + 1])
    }
  }

  const handleNextWeek = () => {
    const currentIndex = availableWeeks.indexOf(selectedWeekStart)
    if (currentIndex > 0) {
      setSelectedWeekStart(availableWeeks[currentIndex - 1])
    }
  }

  const handleCurrentWeek = () => {
    setSelectedWeekStart(currentWeekStart)
  }

  // Format week date range
  const formatWeekRange = (weekStart: string): string => {
    const start = new Date(weekStart)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    return `${startStr} - ${endStr}`
  }

  const isCurrentWeek = selectedWeekStart === currentWeekStart
  const canGoPrevious = availableWeeks.indexOf(selectedWeekStart) < availableWeeks.length - 1
  const canGoNext = availableWeeks.indexOf(selectedWeekStart) > 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#463939] mb-2" style={{fontFamily: 'var(--font-heading)'}}>
          Time Tracking
        </h1>
        <p className="text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
          Weekly time tracking dashboard with breakdown by developer and project type
        </p>
      </div>

      {/* Week Navigation */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousWeek}
              disabled={!canGoPrevious}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Week
            </Button>

            <div className="text-center">
              <h2 className="text-xl font-semibold text-[#463939] mb-1" style={{fontFamily: 'var(--font-heading)'}}>
                {formatWeekRange(selectedWeekStart)}
              </h2>
              {isCurrentWeek && (
                <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90 border-none">
                  Current Week
                </Badge>
              )}
              {!isCurrentWeek && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleCurrentWeek}
                  className="text-[#407B9D] hover:text-[#407B9D]/90"
                >
                  Jump to Current Week
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              disabled={!canGoNext}
              className="flex items-center gap-2"
            >
              Next Week
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Hours */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#407B9D]/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#407B9D]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
                  {formatMinutes(totalWeekMinutes)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nick's Hours */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
              Nick's Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#407B9D]/10 flex items-center justify-center">
                <User className="w-6 h-6 text-[#407B9D]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
                  {formatMinutes(nickMinutes)}
                </p>
                <p className="text-xs text-[#999999]" style={{fontFamily: 'var(--font-body)'}}>
                  {totalWeekMinutes > 0 ? Math.round((nickMinutes / totalWeekMinutes) * 100) : 0}% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gon's Hours */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
              Gon's Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#407B9D]/10 flex items-center justify-center">
                <User className="w-6 h-6 text-[#407B9D]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
                  {formatMinutes(gonMinutes)}
                </p>
                <p className="text-xs text-[#999999]" style={{fontFamily: 'var(--font-body)'}}>
                  {totalWeekMinutes > 0 ? Math.round((gonMinutes / totalWeekMinutes) * 100) : 0}% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Type Split */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
              Project Type Split
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#407B9D]" />
                  <span className="text-sm text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Development
                  </span>
                </div>
                <span className="text-sm font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                  {formatMinutes(devMinutes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#407B9D]" />
                  <span className="text-sm text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Maintenance
                  </span>
                </div>
                <span className="text-sm font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                  {formatMinutes(maintMinutes)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries Detail */}
      <Card>
        <CardHeader>
          <CardTitle style={{fontFamily: 'var(--font-heading)'}}>
            Time Entries ({weekEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weekEntries.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-[#999999] mx-auto mb-4" />
              <p className="text-[#999999]" style={{fontFamily: 'var(--font-body)'}}>
                No time entries for this week
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {weekEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-[#E5E5E5] hover:border-[#407B9D] transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={
                        entry.projectType === "development"
                          ? "bg-[#95CBD7] text-[#463939] hover:bg-[#95CBD7]/90 border-none"
                          : "bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90 border-none"
                      }>
                        {entry.projectType === "development" ? "Development" : "Maintenance"}
                      </Badge>
                      <span className="font-medium text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
                        {getProjectName(entry)}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-[#666666] ml-0" style={{fontFamily: 'var(--font-body)'}}>
                        {entry.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#407B9D]" />
                      <span className="text-sm text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                        {entry.assignee}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#407B9D]" />
                      <span className="text-sm font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                        {formatMinutes(entry.duration)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
