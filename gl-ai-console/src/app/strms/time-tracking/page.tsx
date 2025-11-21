"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Clock, User, Code, Wrench, ChevronDown } from "lucide-react"
import { TimeEntry, DevelopmentProject, MaintenanceTicket } from "@/lib/types"
import { getTimeEntries, getWeekStartDate, formatMinutes } from "@/lib/services/time-tracking-service"
import { getDevProjects } from "@/lib/services/project-service"
import { getMaintTickets } from "@/lib/services/maintenance-service"

export default function TimeTrackingPage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>("")
  const [currentWeekStart, setCurrentWeekStart] = useState<string>("")
  const [timeEntriesExpanded, setTimeEntriesExpanded] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Load data on mount
  useEffect(() => {
    const loadTimeEntries = async () => {
      try {
        setLoading(true)
        const weekStart = getWeekStartDate()
        setCurrentWeekStart(weekStart)
        setSelectedWeekStart(weekStart)
        const entries = await getTimeEntries()
        setTimeEntries(entries)
      } catch (error) {
        console.error("Error loading time entries:", error)
      } finally {
        setLoading(false)
      }
    }
    loadTimeEntries()
  }, [])

  // Generate all weeks from October 1st, 2025 to current week
  const availableWeeks = useMemo(() => {
    const weeks: string[] = []

    // Start from October 1st, 2025 (find the Monday of that week)
    const firstDate = new Date('2025-10-01')
    const firstDayOfWeek = firstDate.getDay()
    const daysToMonday = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek
    firstDate.setDate(firstDate.getDate() + daysToMonday)
    firstDate.setHours(0, 0, 0, 0)

    // Get current week's Monday using the same logic as getWeekStartDate()
    const today = new Date()
    const currentDayOfWeek = today.getDay()
    const daysToCurrentMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek
    const currentMonday = new Date(today)
    currentMonday.setDate(currentMonday.getDate() + daysToCurrentMonday)
    currentMonday.setHours(0, 0, 0, 0)

    // Generate weeks from first week to current week
    const currentDate = new Date(firstDate)
    const currentMondayTimestamp = currentMonday.getTime()

    while (currentDate.getTime() <= currentMondayTimestamp) {
      const weekStart = currentDate.toISOString().split('T')[0]
      weeks.push(weekStart)
      currentDate.setDate(currentDate.getDate() + 7)
    }

    // Sort in reverse (most recent first)
    return weeks.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  }, [])

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

  // Calculate hours by developer AND project type
  const nickDevMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.assignee === "Nick" && e.projectType === "development")
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries])

  const nickMaintMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.assignee === "Nick" && e.projectType === "maintenance")
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries])

  const gonDevMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.assignee === "Gon" && e.projectType === "development")
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries])

  const gonMaintMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.assignee === "Gon" && e.projectType === "maintenance")
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries])

  // Store projects and tickets for lookup
  const [projects, setProjects] = useState<DevelopmentProject[]>([])
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])

  // Load projects and tickets when time entries are loaded
  useEffect(() => {
    const loadProjectsAndTickets = async () => {
      try {
        const [fetchedProjects, fetchedTickets] = await Promise.all([
          getDevProjects(),
          getMaintTickets()
        ])
        setProjects(fetchedProjects)
        setTickets(fetchedTickets)
      } catch (error) {
        console.error("Error loading projects and tickets:", error)
      }
    }
    if (timeEntries.length > 0) {
      loadProjectsAndTickets()
    }
  }, [timeEntries])

  // Get project/ticket names for entries
  const getProjectName = (entry: TimeEntry): string => {
    if (entry.projectType === "development") {
      const project = projects.find(p => p.id === entry.projectId)
      return project?.projectName || "Unknown Project"
    } else {
      const ticket = tickets.find(t => t.id === entry.projectId)
      return ticket?.ticketTitle || "Unknown Ticket"
    }
  }

  // Group time entries by developer, then by project/ticket
  const groupedByDeveloper = useMemo(() => {
    const developerGroups = new Map<string, {
      developer: string
      totalMinutes: number
      projects: Map<string, {
        projectId: string
        projectName: string
        projectType: "development" | "maintenance"
        entries: TimeEntry[]
        totalMinutes: number
      }>
    }>()

    weekEntries.forEach(entry => {
      // Get or create developer group
      if (!developerGroups.has(entry.assignee)) {
        developerGroups.set(entry.assignee, {
          developer: entry.assignee,
          totalMinutes: 0,
          projects: new Map()
        })
      }

      const devGroup = developerGroups.get(entry.assignee)!
      devGroup.totalMinutes += entry.duration

      // Get or create project group within developer
      const projectKey = `${entry.projectType}-${entry.projectId}`
      if (!devGroup.projects.has(projectKey)) {
        devGroup.projects.set(projectKey, {
          projectId: entry.projectId,
          projectName: getProjectName(entry),
          projectType: entry.projectType,
          entries: [],
          totalMinutes: 0
        })
      }

      const projectGroup = devGroup.projects.get(projectKey)!
      projectGroup.entries.push(entry)
      projectGroup.totalMinutes += entry.duration
    })

    // Convert to array and sort developers by total minutes (descending)
    return Array.from(developerGroups.values())
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .map(devGroup => ({
        ...devGroup,
        projects: Array.from(devGroup.projects.values())
          .sort((a, b) => b.totalMinutes - a.totalMinutes)
      }))
  }, [weekEntries, projects, tickets])

  // Toggle group expansion
  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
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
  const currentIndex = availableWeeks.indexOf(selectedWeekStart)
  const canGoPrevious = currentIndex < availableWeeks.length - 1
  const canGoNext = currentIndex > 0 && !isCurrentWeek

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
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
            Loading time entries...
          </div>
        </div>
      ) : (
        <>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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

        {/* Nick's Hours Breakdown */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
              Nick&apos;s Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
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
            <div className="space-y-2 pt-3 border-t border-[#E5E5E5]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-3 h-3 text-[#407B9D]" />
                  <span className="text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Development
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                  {formatMinutes(nickDevMinutes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-3 h-3 text-[#407B9D]" />
                  <span className="text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Maintenance
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                  {formatMinutes(nickMaintMinutes)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gon's Hours Breakdown */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
              Gon&apos;s Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
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
            <div className="space-y-2 pt-3 border-t border-[#E5E5E5]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-3 h-3 text-[#407B9D]" />
                  <span className="text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Development
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                  {formatMinutes(gonDevMinutes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-3 h-3 text-[#407B9D]" />
                  <span className="text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Maintenance
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                  {formatMinutes(gonMaintMinutes)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries Detail */}
      <Card>
        <CardHeader>
          <button
            onClick={() => setTimeEntriesExpanded(!timeEntriesExpanded)}
            className="flex items-center gap-2 w-full hover:opacity-80 transition-opacity"
          >
            <CardTitle style={{fontFamily: 'var(--font-heading)'}}>
              Time Entries ({weekEntries.length})
            </CardTitle>
            <ChevronDown className={`w-5 h-5 text-[#666666] transition-transform ${timeEntriesExpanded ? 'rotate-180' : ''}`} />
          </button>
        </CardHeader>
        {timeEntriesExpanded && (
          <CardContent>
            {groupedByDeveloper.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-[#999999] mx-auto mb-4" />
                <p className="text-[#999999]" style={{fontFamily: 'var(--font-body)'}}>
                  No time entries for this week
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedByDeveloper.map((devGroup) => {
                  const devKey = `dev-${devGroup.developer}`
                  const isDevExpanded = expandedGroups.has(devKey)

                  return (
                    <div key={devKey} className="border-2 border-[#407B9D] rounded-lg overflow-hidden">
                      {/* Developer Header */}
                      <button
                        onClick={() => toggleGroup(devKey)}
                        className="w-full p-4 flex items-center justify-between bg-[#407B9D]/5 hover:bg-[#407B9D]/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronDown className={`w-5 h-5 text-[#407B9D] transition-transform ${isDevExpanded ? 'rotate-180' : ''}`} />
                          <User className="w-5 h-5 text-[#407B9D]" />
                          <span className="text-lg font-semibold text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
                            {devGroup.developer}
                          </span>
                          <span className="text-sm text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                            ({devGroup.projects.length} {devGroup.projects.length === 1 ? 'project' : 'projects'})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-[#407B9D]" />
                          <span className="text-lg font-bold text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
                            {formatMinutes(devGroup.totalMinutes)}
                          </span>
                        </div>
                      </button>

                      {/* Projects for this Developer */}
                      {isDevExpanded && (
                        <div className="p-4 space-y-3 bg-white">
                          {devGroup.projects.map((project) => {
                            const projectKey = `${devKey}-${project.projectType}-${project.projectId}`
                            const isProjectExpanded = expandedGroups.has(projectKey)

                            return (
                              <div key={projectKey} className="border border-[#E5E5E5] rounded-lg overflow-hidden">
                                {/* Project Header */}
                                <button
                                  onClick={() => toggleGroup(projectKey)}
                                  className="w-full p-3 flex items-center justify-between hover:bg-[#F5F5F5] transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <ChevronDown className={`w-4 h-4 text-[#666666] transition-transform ${isProjectExpanded ? 'rotate-180' : ''}`} />
                                    <Badge className={
                                      project.projectType === "development"
                                        ? "bg-[#95CBD7] text-[#463939] hover:bg-[#95CBD7]/90 border-none"
                                        : "bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90 border-none"
                                    }>
                                      {project.projectType === "development" ? "Development" : "Maintenance"}
                                    </Badge>
                                    <span className="font-medium text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
                                      {project.projectName}
                                    </span>
                                    <span className="text-xs text-[#999999]" style={{fontFamily: 'var(--font-body)'}}>
                                      ({project.entries.length} {project.entries.length === 1 ? 'entry' : 'entries'})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#407B9D]" />
                                    <span className="text-sm font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                                      {formatMinutes(project.totalMinutes)}
                                    </span>
                                  </div>
                                </button>

                                {/* Individual Entries */}
                                {isProjectExpanded && (
                                  <div className="border-t border-[#E5E5E5] bg-[#FAFAFA]">
                                    {project.entries.map((entry) => (
                                      <div
                                        key={entry.id}
                                        className="p-3 border-b border-[#E5E5E5] last:border-b-0 hover:bg-white transition-colors"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                              <span className="text-sm text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                                                {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                              </span>
                                            </div>
                                            {entry.notes && (
                                              <p className="text-sm text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                                                {entry.notes}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 ml-4">
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
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        )}
      </Card>
        </>
      )}
    </div>
  )
}
