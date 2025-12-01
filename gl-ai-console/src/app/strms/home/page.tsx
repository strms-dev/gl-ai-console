"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getLeads } from "@/lib/leads-store"
import { getDevProjects } from "@/lib/services/project-service"
import { getMaintTickets } from "@/lib/services/maintenance-service"
import { getTimeEntries, getWeekStartDate } from "@/lib/services/time-tracking-service"
import { getCustomers } from "@/lib/offboarding-store"
import { RotateCw, ArrowRight, Code, AlertCircle, Clock, Users, UserX } from "lucide-react"
import Link from "next/link"

export default function STRMSHomePage() {
  const [totalProjects, setTotalProjects] = useState(0)
  const [totalDevProjects, setTotalDevProjects] = useState(0)
  const [totalMaintTickets, setTotalMaintTickets] = useState(0)
  const [weeklyHours, setWeeklyHours] = useState(0)
  const [totalOffboardingCustomers, setTotalOffboardingCustomers] = useState(0)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Sales Pipeline stats
        const leads = await getLeads()
        setTotalProjects(leads.length)

        // Development projects stats
        const devProjects = await getDevProjects()
        const activeDevProjects = devProjects.filter(p => !["complete", "cancelled"].includes(p.status))
        setTotalDevProjects(activeDevProjects.length)

        // Maintenance tickets stats
        const maintTickets = await getMaintTickets()
        const openTickets = maintTickets.filter(t => t.status !== "closed")
        setTotalMaintTickets(openTickets.length)

        // Time tracking stats - this week's total hours
        const weekStart = getWeekStartDate()
        const timeEntries = await getTimeEntries()
        const weekEntries = timeEntries.filter(e => e.weekStartDate === weekStart)
        const totalMinutes = weekEntries.reduce((sum, entry) => sum + entry.duration, 0)
        const hours = Math.round((totalMinutes / 60) * 10) / 10 // Round to 1 decimal
        setWeeklyHours(hours)

        // Offboarding customers stats
        const offboardingCustomers = await getCustomers()
        setTotalOffboardingCustomers(offboardingCustomers.length)
      } catch (error) {
        console.error("Error loading stats:", error)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF9F9]">
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="mb-16">
          <h1
            className="text-5xl font-bold text-[#463939] mb-4"
            style={{fontFamily: 'var(--font-heading)'}}
          >
            STRMS
          </h1>
          <p
            className="text-xl text-[#666666] max-w-3xl"
            style={{fontFamily: 'var(--font-body)'}}
          >
            AI Automation, Built for People. STRMS simplifies your AI automation deployment journey, guiding you through the right stages while supporting your employees every step of the way.
          </p>
        </div>

        {/* Available Processes */}
        <div>
          <h2
            className="text-2xl font-semibold text-[#463939] mb-6"
            style={{fontFamily: 'var(--font-heading)'}}
          >
            Available Processes
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Pipeline - Active */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                    <RotateCw className="w-7 h-7 text-[#407B9D]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle
                        className="text-xl text-[#463939]"
                        style={{fontFamily: 'var(--font-heading)'}}
                      >
                        Sales Pipeline
                      </CardTitle>
                      <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90 border-none">
                        Active
                      </Badge>
                    </div>
                    <CardDescription
                      className="text-sm"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      Manage leads from demo through kickoff with automated workflows and AI assistance
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#407B9D]"></div>
                    <span
                      className="text-[#666666]"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      {totalProjects} Active Projects
                    </span>
                  </div>
                </div>
                <Link href="/strms/sales-pipeline">
                  <Button
                    className="bg-[#407B9D] hover:bg-[#407B9D]/90 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    style={{fontFamily: 'var(--font-heading)'}}
                  >
                    Open Pipeline
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

            {/* Development Projects - Active */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                    <Code className="w-7 h-7 text-[#407B9D]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle
                        className="text-xl text-[#463939]"
                        style={{fontFamily: 'var(--font-heading)'}}
                      >
                        Development Projects
                      </CardTitle>
                      <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90 border-none">
                        Active
                      </Badge>
                    </div>
                    <CardDescription
                      className="text-sm"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      Track development projects from setup through completion with sprint planning and time tracking
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#407B9D]"></div>
                    <span
                      className="text-[#666666]"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      {totalDevProjects} Active Projects
                    </span>
                  </div>
                </div>
                <Link href="/strms/project-management">
                  <Button
                    className="bg-[#407B9D] hover:bg-[#407B9D]/90 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    style={{fontFamily: 'var(--font-heading)'}}
                  >
                    View Projects
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

            {/* Maintenance - Active */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-7 h-7 text-[#407B9D]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle
                        className="text-xl text-[#463939]"
                        style={{fontFamily: 'var(--font-heading)'}}
                      >
                        Maintenance
                      </CardTitle>
                      <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90 border-none">
                        Active
                      </Badge>
                    </div>
                    <CardDescription
                      className="text-sm"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      Handle maintenance requests and customizations from error logging through resolution
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#407B9D]"></div>
                    <span
                      className="text-[#666666]"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      {totalMaintTickets} Open Tickets
                    </span>
                  </div>
                </div>
                <Link href="/strms/maintenance">
                  <Button
                    className="bg-[#407B9D] hover:bg-[#407B9D]/90 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    style={{fontFamily: 'var(--font-heading)'}}
                  >
                    View Tickets
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

            {/* Time Tracking - Active */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-7 h-7 text-[#407B9D]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle
                        className="text-xl text-[#463939]"
                        style={{fontFamily: 'var(--font-heading)'}}
                      >
                        Time Tracking
                      </CardTitle>
                      <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90 border-none">
                        Active
                      </Badge>
                    </div>
                    <CardDescription
                      className="text-sm"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      View weekly time tracking dashboard with breakdown by developer and project type
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#407B9D]"></div>
                    <span
                      className="text-[#666666]"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      {weeklyHours}h This Week
                    </span>
                  </div>
                </div>
                <Link href="/strms/time-tracking">
                  <Button
                    className="bg-[#407B9D] hover:bg-[#407B9D]/90 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    style={{fontFamily: 'var(--font-heading)'}}
                  >
                    View Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

            {/* Developer Views - Active */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-7 h-7 text-[#407B9D]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle
                        className="text-xl text-[#463939]"
                        style={{fontFamily: 'var(--font-heading)'}}
                      >
                        Developer Views
                      </CardTitle>
                      <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90 border-none">
                        Active
                      </Badge>
                    </div>
                    <CardDescription
                      className="text-sm"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      Personalized dashboards for each developer to view their assigned tasks and projects
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#407B9D]"></div>
                    <span
                      className="text-[#666666]"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      2 Developers
                    </span>
                  </div>
                </div>
                <Link href="/strms/developer-views">
                  <Button
                    className="bg-[#407B9D] hover:bg-[#407B9D]/90 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    style={{fontFamily: 'var(--font-heading)'}}
                  >
                    View Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

            {/* Offboarding - Active */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                    <UserX className="w-7 h-7 text-[#407B9D]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle
                        className="text-xl text-[#463939]"
                        style={{fontFamily: 'var(--font-heading)'}}
                      >
                        Offboarding
                      </CardTitle>
                      <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90 border-none">
                        Active
                      </Badge>
                    </div>
                    <CardDescription
                      className="text-sm"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      Manage customer offboarding process from notification through final handoff
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#407B9D]"></div>
                    <span
                      className="text-[#666666]"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      {totalOffboardingCustomers} Customers
                    </span>
                  </div>
                </div>
                <Link href="/strms/offboarding">
                  <Button
                    className="bg-[#407B9D] hover:bg-[#407B9D]/90 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    style={{fontFamily: 'var(--font-heading)'}}
                  >
                    View Offboarding
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
