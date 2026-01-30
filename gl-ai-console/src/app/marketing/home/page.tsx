"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  PenTool,
  Search,
  ArrowRight,
  Lightbulb,
  FileText,
  RefreshCw,
  TrendingUp,
  Users,
  FlaskConical,
  Sparkles
} from "lucide-react"

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF9F9] to-white">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Hero Section - Enhanced with visual hierarchy */}
        <div className="mb-12 relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#407B9D]/5 rounded-full blur-2xl" />
          <div className="absolute top-8 right-0 w-32 h-32 bg-[#C8E4BB]/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#407B9D] to-[#407B9D]/80 flex items-center justify-center shadow-lg shadow-[#407B9D]/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <Badge className="bg-[#C8E4BB]/50 text-[#463939] border-[#C8E4BB] hover:bg-[#C8E4BB]/60">
                AI-Powered
              </Badge>
            </div>
            <h1
              className="text-4xl font-bold text-[#463939] mb-3 tracking-tight"
              style={{fontFamily: 'var(--font-heading)'}}
            >
              Marketing Hub
            </h1>
            <p
              className="text-lg text-[#666666] max-w-2xl leading-relaxed"
              style={{fontFamily: 'var(--font-body)'}}
            >
              Streamline your content creation and lead discovery with AI-powered workflows designed to accelerate growth.
            </p>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mb-10 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#407B9D]/10 flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-[#407B9D]" />
                </div>
                <div>
                  <p className="text-xs text-[#666666] uppercase tracking-wide" style={{fontFamily: 'var(--font-body)'}}>Content Engine</p>
                  <p className="text-lg font-semibold text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>4 Workflows</p>
                </div>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#95CBD7]/20 flex items-center justify-center">
                  <Search className="w-5 h-5 text-[#407B9D]" />
                </div>
                <div>
                  <p className="text-xs text-[#666666] uppercase tracking-wide" style={{fontFamily: 'var(--font-body)'}}>Lead Discovery</p>
                  <p className="text-lg font-semibold text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>2 Workflows</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
              <div className="w-2 h-2 rounded-full bg-[#C8E4BB] animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>

        {/* Available Processes */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-semibold text-[#463939]"
              style={{fontFamily: 'var(--font-heading)'}}
            >
              Select a Process
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Engine - Active */}
            <Link href="/marketing/content-engine" className="block group">
              <Card className="h-full bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#407B9D]/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#407B9D]/5 to-transparent rounded-bl-full" />
                <CardHeader className="pb-4 relative">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#407B9D] to-[#407B9D]/80 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#407B9D]/20 group-hover:scale-105 transition-transform">
                      <PenTool className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <CardTitle
                          className="text-xl text-[#463939] group-hover:text-[#407B9D] transition-colors"
                          style={{fontFamily: 'var(--font-heading)'}}
                        >
                          Content Engine
                        </CardTitle>
                        <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB] border-none text-xs">
                          Active
                        </Badge>
                      </div>
                      <CardDescription
                        className="text-sm leading-relaxed"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        AI-powered content creation, repurposing, and optimization workflows
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Workflow Pills */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#407B9D]/5 group-hover:bg-[#407B9D]/10 transition-colors">
                      <Lightbulb className="w-4 h-4 text-[#407B9D]" />
                      <span className="text-sm text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>Topic Radar</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#95CBD7]/10 group-hover:bg-[#95CBD7]/20 transition-colors">
                      <FileText className="w-4 h-4 text-[#407B9D]" />
                      <span className="text-sm text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>Brief Builder</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#C8E4BB]/20 group-hover:bg-[#C8E4BB]/30 transition-colors">
                      <RefreshCw className="w-4 h-4 text-[#407B9D]" />
                      <span className="text-sm text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>Repurpose</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 group-hover:bg-amber-100/50 transition-colors">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>Refresh</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <Button
                      size="sm"
                      className="bg-[#407B9D] hover:bg-[#407B9D]/90 shadow-sm group-hover:shadow-md transition-all"
                    >
                      Open Engine
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Lead Discovery - Active */}
            <Link href="/marketing/lead-discovery" className="block group">
              <Card className="h-full bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#407B9D]/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#95CBD7]/10 to-transparent rounded-bl-full" />
                <CardHeader className="pb-4 relative">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#95CBD7] to-[#407B9D] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#95CBD7]/20 group-hover:scale-105 transition-transform">
                      <Search className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <CardTitle
                          className="text-xl text-[#463939] group-hover:text-[#407B9D] transition-colors"
                          style={{fontFamily: 'var(--font-heading)'}}
                        >
                          Lead Discovery
                        </CardTitle>
                        <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB] border-none text-xs">
                          Active
                        </Badge>
                      </div>
                      <CardDescription
                        className="text-sm leading-relaxed"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        Find influencers, generate lead hypotheses, and build your outbound pipeline
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Workflow Pills */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#407B9D]/5 group-hover:bg-[#407B9D]/10 transition-colors">
                      <Users className="w-4 h-4 text-[#407B9D]" />
                      <span className="text-sm text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>Influencer Finder</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#C8E4BB]/20 group-hover:bg-[#C8E4BB]/30 transition-colors">
                      <FlaskConical className="w-4 h-4 text-[#407B9D]" />
                      <span className="text-sm text-[#463939]" style={{fontFamily: 'var(--font-body)'}}>Hypothesis Lab</span>
                    </div>
                  </div>
                  {/* Integration badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>Integrates with:</span>
                    <span className="text-xs border border-slate-200 text-[#666666] px-2 py-0.5 rounded-full">LinkedIn</span>
                    <span className="text-xs border border-slate-200 text-[#666666] px-2 py-0.5 rounded-full">Trigify</span>
                  </div>
                  <div className="flex items-center justify-end">
                    <Button
                      size="sm"
                      className="bg-[#407B9D] hover:bg-[#407B9D]/90 shadow-sm group-hover:shadow-md transition-all"
                    >
                      Start Discovery
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Footer tip */}
        <div className="mt-10 text-center">
          <p className="text-sm text-[#999999]" style={{fontFamily: 'var(--font-body)'}}>
            Click on any card to open the workflow
          </p>
        </div>
      </div>
    </div>
  )
}
