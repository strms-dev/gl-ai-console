"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Clock, User, Code, Wrench, ChevronDown, LayoutList, LayoutGrid } from "lucide-react"
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
  const [viewMode, setViewMode] = useState<"list" | "matrix">("list")

  // Store projects and tickets for lookup (must be declared before useMemo hooks that use them)
  const [projects, setProjects] = useState<DevelopmentProject[]>([])
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])

  // Determine if a project/ticket is internal (GrowthLab or STRMS)
  const isInternalProject = (entry: TimeEntry): boolean => {
    let customer = ""
    if (entry.projectType === "development") {
      const project = projects.find(p => p.id === entry.projectId)
      customer = project?.customer || ""
    } else {
      const ticket = tickets.find(t => t.id === entry.projectId)
      customer = ticket?.customer || ""
    }
    const lowerCustomer = customer.toLowerCase()
    return lowerCustomer.includes("growthlab") || lowerCustomer.includes("strms")
  }

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

  // Calculate hours by developer, project type, AND customer type (internal vs customer)
  // Nick - Customer Development
  const nickCustomerDevMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.assignee === "Nick" && e.projectType === "development" && !isInternalProject(e))
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries, projects, tickets])

  // Nick - Internal Development
  const nickInternalDevMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.assignee === "Nick" && e.projectType === "development" && isInternalProject(e))
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries, projects, tickets])

  // Nick - Customer Maintenance
  const nickCustomerMaintMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.assignee === "Nick" && e.projectType === "maintenance" && !isInternalProject(e))
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries, projects, tickets])

  // Nick - Internal Maintenance
  const nickInternalMaintMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.assignee === "Nick" && e.projectType === "maintenance" && isInternalProject(e))
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries, projects, tickets])

  // Gon - Customer Development
  const gonCustomerDevMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.assignee === "Gon" && e.projectType === "development" && !isInternalProject(e))
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries, projects, tickets])

  // Gon - Internal Development
  const gonInternalDevMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.assignee === "Gon" && e.projectType === "development" && isInternalProject(e))
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries, projects, tickets])

  // Gon - Customer Maintenance
  const gonCustomerMaintMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.assignee === "Gon" && e.projectType === "maintenance" && !isInternalProject(e))
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries, projects, tickets])

  // Gon - Internal Maintenance
  const gonInternalMaintMinutes = useMemo(() => {
    return weekEntries
      .filter(e => e.assignee === "Gon" && e.projectType === "maintenance" && isInternalProject(e))
      .reduce((sum, entry) => sum + entry.duration, 0)
  }, [weekEntries, projects, tickets])

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

  // Generate days of the week for matrix view (Mon-Fri only)
  const weekDays = useMemo(() => {
    if (!selectedWeekStart) return []

    const days: { date: Date; dayName: string; dateStr: string; isToday: boolean }[] = []
    // Parse the week start date properly (it's in YYYY-MM-DD format)
    const [year, month, day] = selectedWeekStart.split('-').map(Number)
    const startDate = new Date(year, month - 1, day) // month is 0-indexed
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Only Mon-Fri (5 days)
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      date.setHours(0, 0, 0, 0)

      days.push({
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: date.getTime() === today.getTime()
      })
    }

    return days
  }, [selectedWeekStart])

  // Matrix data: group by developer > project, with daily breakdown
  const matrixData = useMemo(() => {
    // Helper to get day index (0 = Monday, 4 = Friday) from a date
    // Returns -1 for weekend days (should be filtered out)
    const getDayIndex = (dateStr: string): number => {
      const entryDate = new Date(dateStr)
      // Parse week start properly
      const [year, month, day] = selectedWeekStart.split('-').map(Number)
      const weekStart = new Date(year, month - 1, day)
      weekStart.setHours(0, 0, 0, 0)
      entryDate.setHours(0, 0, 0, 0)

      const diffTime = entryDate.getTime() - weekStart.getTime()
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

      // Only return valid index for Mon-Fri (0-4)
      if (diffDays < 0 || diffDays > 4) return -1
      return diffDays
    }

    // Build matrix structure
    const developerMatrix = new Map<string, {
      developer: string
      totalMinutes: number
      dailyTotals: number[] // 5 days (Mon-Fri)
      projects: Map<string, {
        projectId: string
        projectName: string
        projectType: "development" | "maintenance"
        totalMinutes: number
        dailyMinutes: number[] // 5 days (Mon-Fri)
        dailyEntries: TimeEntry[][] // entries per day for drill-down
      }>
    }>()

    weekEntries.forEach(entry => {
      const dayIndex = getDayIndex(entry.createdAt)

      // Skip entries that don't fall on Mon-Fri
      if (dayIndex < 0) return

      // Get or create developer
      if (!developerMatrix.has(entry.assignee)) {
        developerMatrix.set(entry.assignee, {
          developer: entry.assignee,
          totalMinutes: 0,
          dailyTotals: [0, 0, 0, 0, 0],
          projects: new Map()
        })
      }

      const devData = developerMatrix.get(entry.assignee)!
      devData.totalMinutes += entry.duration
      devData.dailyTotals[dayIndex] += entry.duration

      // Get or create project within developer
      const projectKey = `${entry.projectType}-${entry.projectId}`
      if (!devData.projects.has(projectKey)) {
        devData.projects.set(projectKey, {
          projectId: entry.projectId,
          projectName: getProjectName(entry),
          projectType: entry.projectType,
          totalMinutes: 0,
          dailyMinutes: [0, 0, 0, 0, 0],
          dailyEntries: [[], [], [], [], []]
        })
      }

      const projectData = devData.projects.get(projectKey)!
      projectData.totalMinutes += entry.duration
      projectData.dailyMinutes[dayIndex] += entry.duration
      projectData.dailyEntries[dayIndex].push(entry)
    })

    // Convert to array and sort
    return Array.from(developerMatrix.values())
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .map(devData => ({
        ...devData,
        projects: Array.from(devData.projects.values())
          .sort((a, b) => b.totalMinutes - a.totalMinutes)
      }))
  }, [weekEntries, selectedWeekStart, projects, tickets])

  // Calculate daily totals across all developers (Mon-Fri only)
  const dailyTotals = useMemo(() => {
    const totals = [0, 0, 0, 0, 0]
    matrixData.forEach(dev => {
      dev.dailyTotals.forEach((minutes, index) => {
        if (index < 5) totals[index] += minutes
      })
    })
    return totals
  }, [matrixData])

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
                    Customer Dev
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                  {formatMinutes(nickCustomerDevMinutes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-3 h-3 text-[#95CBD7]" />
                  <span className="text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Internal Dev
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                  {formatMinutes(nickInternalDevMinutes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-3 h-3 text-[#407B9D]" />
                  <span className="text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Customer Maint
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                  {formatMinutes(nickCustomerMaintMinutes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-3 h-3 text-[#95CBD7]" />
                  <span className="text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Internal Maint
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                  {formatMinutes(nickInternalMaintMinutes)}
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
                    Customer Dev
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                  {formatMinutes(gonCustomerDevMinutes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-3 h-3 text-[#95CBD7]" />
                  <span className="text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Internal Dev
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                  {formatMinutes(gonInternalDevMinutes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-3 h-3 text-[#407B9D]" />
                  <span className="text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Customer Maint
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                  {formatMinutes(gonCustomerMaintMinutes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-3 h-3 text-[#95CBD7]" />
                  <span className="text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                    Internal Maint
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                  {formatMinutes(gonInternalMaintMinutes)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries Detail */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => setTimeEntriesExpanded(!timeEntriesExpanded)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <CardTitle style={{fontFamily: 'var(--font-heading)'}}>
                Time Entries ({weekEntries.length})
              </CardTitle>
              <ChevronDown className={`w-5 h-5 text-[#666666] transition-transform ${timeEntriesExpanded ? 'rotate-180' : ''}`} />
            </button>

            {/* View Toggle */}
            {timeEntriesExpanded && (
              <div className="flex items-center gap-1 bg-[#F5F5F5] rounded-lg p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-[#407B9D] shadow-sm"
                      : "text-[#666666] hover:text-[#463939]"
                  }`}
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  <LayoutList className="w-4 h-4" />
                  List
                </button>
                <button
                  onClick={() => setViewMode("matrix")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "matrix"
                      ? "bg-white text-[#407B9D] shadow-sm"
                      : "text-[#666666] hover:text-[#463939]"
                  }`}
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Matrix
                </button>
              </div>
            )}
          </div>
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
            ) : viewMode === "list" ? (
              /* LIST VIEW */
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
            ) : (
              /* MATRIX VIEW */
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  {/* Header Row with Days */}
                  <thead>
                    <tr>
                      <th className="text-left p-3 bg-[#F5F5F5] border-b-2 border-[#E5E5E5] min-w-[200px]">
                        <span className="text-sm font-semibold text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
                          Task / Project
                        </span>
                      </th>
                      {weekDays.map((day, index) => (
                        <th
                          key={index}
                          className={`text-center p-3 border-b-2 border-[#E5E5E5] min-w-[90px] ${
                            day.isToday ? 'bg-[#407B9D]/10' : 'bg-[#F5F5F5]'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className={`text-xs font-medium ${day.isToday ? 'text-[#407B9D]' : 'text-[#666666]'}`} style={{fontFamily: 'var(--font-body)'}}>
                              {day.dayName}
                            </span>
                            <span className={`text-xs ${day.isToday ? 'text-[#407B9D] font-semibold' : 'text-[#999999]'}`} style={{fontFamily: 'var(--font-body)'}}>
                              {day.dateStr}
                            </span>
                            {dailyTotals[index] > 0 && (
                              <span className={`text-xs font-semibold mt-1 ${day.isToday ? 'text-[#407B9D]' : 'text-[#463939]'}`} style={{fontFamily: 'var(--font-body)'}}>
                                {formatMinutes(dailyTotals[index])}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="text-center p-3 bg-[#F5F5F5] border-b-2 border-[#E5E5E5] min-w-[80px]">
                        <span className="text-sm font-semibold text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
                          Total
                        </span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {matrixData.map((devData) => {
                      const devKey = `matrix-dev-${devData.developer}`
                      const isDevExpanded = expandedGroups.has(devKey)

                      return (
                        <React.Fragment key={devKey}>
                          {/* Developer Row */}
                          <tr className="bg-[#407B9D]/5 hover:bg-[#407B9D]/10 transition-colors">
                            <td className="p-3 border-b border-[#E5E5E5]">
                              <button
                                onClick={() => toggleGroup(devKey)}
                                className="flex items-center gap-2 w-full text-left"
                              >
                                <ChevronDown className={`w-4 h-4 text-[#407B9D] transition-transform ${isDevExpanded ? 'rotate-180' : ''}`} />
                                <User className="w-4 h-4 text-[#407B9D]" />
                                <span className="font-semibold text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
                                  {devData.developer}
                                </span>
                                <span className="text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                                  ({devData.projects.length} {devData.projects.length === 1 ? 'project' : 'projects'})
                                </span>
                              </button>
                            </td>
                            {weekDays.map((day, index) => (
                              <td
                                key={index}
                                className={`text-center p-3 border-b border-[#E5E5E5] ${day.isToday ? 'bg-[#407B9D]/5' : ''}`}
                              >
                                {devData.dailyTotals[index] > 0 ? (
                                  <span className="text-sm font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                                    {formatMinutes(devData.dailyTotals[index])}
                                  </span>
                                ) : (
                                  <span className="text-[#CCCCCC]">—</span>
                                )}
                              </td>
                            ))}
                            <td className="text-center p-3 border-b border-[#E5E5E5] bg-[#F5F5F5]">
                              <div className="flex items-center justify-center gap-1">
                                <Clock className="w-4 h-4 text-[#407B9D]" />
                                <span className="font-bold text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
                                  {formatMinutes(devData.totalMinutes)}
                                </span>
                              </div>
                            </td>
                          </tr>

                          {/* Project Rows (when expanded) */}
                          {isDevExpanded && devData.projects.map((project) => (
                            <tr key={`${devKey}-${project.projectType}-${project.projectId}`} className="hover:bg-[#FAFAFA] transition-colors">
                              <td className="p-3 pl-10 border-b border-[#E5E5E5]">
                                <div className="flex items-center gap-2">
                                  <Badge className={
                                    project.projectType === "development"
                                      ? "bg-[#95CBD7] text-[#463939] hover:bg-[#95CBD7]/90 border-none text-xs"
                                      : "bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90 border-none text-xs"
                                  }>
                                    {project.projectType === "development" ? "Dev" : "Maint"}
                                  </Badge>
                                  <span className="text-sm text-[#463939] truncate max-w-[150px]" style={{fontFamily: 'var(--font-body)'}} title={project.projectName}>
                                    {project.projectName}
                                  </span>
                                </div>
                              </td>
                              {weekDays.map((day, index) => (
                                <td
                                  key={index}
                                  className={`text-center p-3 border-b border-[#E5E5E5] ${day.isToday ? 'bg-[#407B9D]/5' : ''}`}
                                >
                                  {project.dailyMinutes[index] > 0 ? (
                                    <span className="text-sm text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
                                      {formatMinutes(project.dailyMinutes[index])}
                                    </span>
                                  ) : (
                                    <span className="text-[#DDDDDD]">—</span>
                                  )}
                                </td>
                              ))}
                              <td className="text-center p-3 border-b border-[#E5E5E5] bg-[#FAFAFA]">
                                <span className="text-sm font-semibold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                                  {formatMinutes(project.totalMinutes)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      )
                    })}

                    {/* Grand Total Row */}
                    <tr className="bg-[#407B9D]/10">
                      <td className="p-3 border-t-2 border-[#407B9D]">
                        <span className="font-bold text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
                          Total
                        </span>
                      </td>
                      {weekDays.map((day, index) => (
                        <td
                          key={index}
                          className={`text-center p-3 border-t-2 border-[#407B9D] ${day.isToday ? 'bg-[#407B9D]/15' : ''}`}
                        >
                          {dailyTotals[index] > 0 ? (
                            <span className="font-bold text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>
                              {formatMinutes(dailyTotals[index])}
                            </span>
                          ) : (
                            <span className="text-[#CCCCCC]">—</span>
                          )}
                        </td>
                      ))}
                      <td className="text-center p-3 border-t-2 border-[#407B9D] bg-[#407B9D]/20">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-[#407B9D]" />
                          <span className="font-bold text-[#407B9D]" style={{fontFamily: 'var(--font-heading)'}}>
                            {formatMinutes(totalWeekMinutes)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
