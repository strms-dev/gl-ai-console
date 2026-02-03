"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link2, ArrowRight, BarChart3, Monitor } from "lucide-react"

export default function ManagementHomePage() {
  return (
    <div className="min-h-screen bg-[#FAF9F9]">
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="mb-16">
          <h1
            className="text-5xl font-bold text-[#463939] mb-4"
            style={{fontFamily: 'var(--font-heading)'}}
          >
            Management
          </h1>
          <p
            className="text-xl text-[#666666] max-w-3xl"
            style={{fontFamily: 'var(--font-body)'}}
          >
            Management tools and integrations for leadership workflows and system connections.
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
            {/* QBO MCP - Active */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                      <Link2 className="w-7 h-7 text-[#407B9D]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle
                          className="text-xl text-[#463939]"
                          style={{fontFamily: 'var(--font-heading)'}}
                        >
                          QBO MCP
                        </CardTitle>
                        <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90 border-none">
                          Active
                        </Badge>
                      </div>
                      <CardDescription
                        className="text-sm"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        Connect and manage QuickBooks Online accounts for MCP integrations
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#C8E4BB]"></div>
                      <span
                        className="text-[#666666]"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        QBO Connection
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#95CBD7]"></div>
                      <span
                        className="text-[#666666]"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        MCP Integration
                      </span>
                    </div>
                  </div>
                  <Link href="/management/qbo-mcp">
                    <Button
                      size="sm"
                      className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                    >
                      Open
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Team Capacity - Active */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-7 h-7 text-[#407B9D]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle
                          className="text-xl text-[#463939]"
                          style={{fontFamily: 'var(--font-heading)'}}
                        >
                          Team Capacity
                        </CardTitle>
                        <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90 border-none">
                          Active
                        </Badge>
                      </div>
                      <CardDescription
                        className="text-sm"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        Plan and track team capacity, workload distribution, and resource allocation
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#C8E4BB]"></div>
                      <span
                        className="text-[#666666]"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        Capacity Planning
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#95CBD7]"></div>
                      <span
                        className="text-[#666666]"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        Resource Tracking
                      </span>
                    </div>
                  </div>
                  <Link href="/management/team-capacity">
                    <Button
                      size="sm"
                      className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                    >
                      Open
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Computer Use Agent - Active */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                      <Monitor className="w-7 h-7 text-[#407B9D]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle
                          className="text-xl text-[#463939]"
                          style={{fontFamily: 'var(--font-heading)'}}
                        >
                          Computer Use Agent
                        </CardTitle>
                        <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90 border-none">
                          Active
                        </Badge>
                      </div>
                      <CardDescription
                        className="text-sm"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        AI agent that automatically downloads and organizes bank statements from financial institutions
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#C8E4BB]"></div>
                      <span
                        className="text-[#666666]"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        Bank Statements
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#95CBD7]"></div>
                      <span
                        className="text-[#666666]"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        Auto-Download
                      </span>
                    </div>
                  </div>
                  <Link href="/management/computer-use-agent">
                    <Button
                      size="sm"
                      className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                    >
                      Open
                      <ArrowRight className="w-4 h-4 ml-1" />
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
