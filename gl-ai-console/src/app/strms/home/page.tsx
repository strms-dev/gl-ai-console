"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getLeads } from "@/lib/leads-store"
import { RotateCw, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function STRMSHomePage() {
  const [totalProjects, setTotalProjects] = useState(0)

  useEffect(() => {
    const loadStats = async () => {
      const leads = await getLeads()
      setTotalProjects(leads.length)
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
        <div className="space-y-6">
          <h2
            className="text-2xl font-semibold text-[#463939]"
            style={{fontFamily: 'var(--font-heading)'}}
          >
            Available Processes
          </h2>

          {/* Sales Pipeline - Active */}
          <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] max-w-2xl">
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
        </div>
      </div>
    </div>
  )
}
