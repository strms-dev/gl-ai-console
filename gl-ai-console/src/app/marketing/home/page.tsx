"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock } from "lucide-react"

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen bg-[#FAF9F9]">
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="mb-16">
          <h1
            className="text-5xl font-bold text-[#463939] mb-4"
            style={{fontFamily: 'var(--font-heading)'}}
          >
            Marketing
          </h1>
          <p
            className="text-xl text-[#666666] max-w-3xl"
            style={{fontFamily: 'var(--font-body)'}}
          >
            Marketing Content Engine. Create, manage, and optimize marketing content with AI-powered tools and automation.
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
            {/* Content Engine - Coming Soon */}
            <Card className="bg-white border-none shadow-sm opacity-75">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-7 h-7 text-[#407B9D]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle
                          className="text-xl text-[#463939]"
                          style={{fontFamily: 'var(--font-heading)'}}
                        >
                          Content Engine
                        </CardTitle>
                        <Badge className="bg-[#95CBD7] text-[#463939] hover:bg-[#95CBD7]/90 border-none">
                          <Clock className="w-3 h-3 mr-1" />
                          Coming Soon
                        </Badge>
                      </div>
                      <CardDescription
                        className="text-sm"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        AI-powered content creation and management system for marketing materials
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#95CBD7]"></div>
                    <span
                      className="text-[#666666]"
                      style={{fontFamily: 'var(--font-body)'}}
                    >
                      Content Generation
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
