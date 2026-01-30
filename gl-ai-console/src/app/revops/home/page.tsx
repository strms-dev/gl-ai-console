"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, ArrowRight, TrendingUp, Award } from "lucide-react"
import Link from "next/link"

export default function RevOpsHomePage() {
  return (
    <div className="min-h-screen bg-[#FAF9F9]">
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="mb-16">
          <h1
            className="text-5xl font-bold text-[#463939] mb-4"
            style={{fontFamily: 'var(--font-heading)'}}
          >
            RevOps
          </h1>
          <p
            className="text-xl text-[#666666] max-w-3xl"
            style={{fontFamily: 'var(--font-body)'}}
          >
            Revenue Operations Hub. Streamline your sales processes, track pipeline performance, and optimize revenue generation with AI-powered insights.
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
            {/* Sales Funnel - Active */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                      <Filter className="w-7 h-7 text-[#407B9D]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle
                          className="text-xl text-[#463939]"
                          style={{fontFamily: 'var(--font-heading)'}}
                        >
                          Sales Funnel
                        </CardTitle>
                        <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90 border-none">
                          Active
                        </Badge>
                      </div>
                      <CardDescription
                        className="text-sm"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        Track and manage your sales funnel with real-time visibility into deal progression and conversion rates
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
                        Pipeline Overview
                      </span>
                    </div>
                  </div>
                  <Link href="/revops/sales-funnel">
                    <Button
                      className="bg-[#407B9D] hover:bg-[#407B9D]/90 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                      style={{fontFamily: 'var(--font-heading)'}}
                    >
                      View Funnel
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Sales Pipeline - Active */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-7 h-7 text-[#407B9D]" />
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
                        Manage deals through the sales process with automated stage tracking and HubSpot integration
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
                        Deal Management
                      </span>
                    </div>
                  </div>
                  <Link href="/revops/sales-pipeline">
                    <Button
                      className="bg-[#407B9D] hover:bg-[#407B9D]/90 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                      style={{fontFamily: 'var(--font-heading)'}}
                    >
                      View Pipeline
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Ambassador Program - Active */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                      <Award className="w-7 h-7 text-[#407B9D]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle
                          className="text-xl text-[#463939]"
                          style={{fontFamily: 'var(--font-heading)'}}
                        >
                          Ambassador Program
                        </CardTitle>
                        <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/90 border-none">
                          Active
                        </Badge>
                      </div>
                      <CardDescription
                        className="text-sm"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        Manage referral partnerships and track ambassador performance with real-time analytics
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
                        Referral Tracking
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#95CBD7]"></div>
                      <span
                        className="text-[#666666]"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        Partner Dashboard
                      </span>
                    </div>
                  </div>
                  <Link href="/revops/ambassador-program">
                    <Button
                      className="bg-[#407B9D] hover:bg-[#407B9D]/90 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                      style={{fontFamily: 'var(--font-heading)'}}
                    >
                      Open
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
