"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, CheckCircle, LayoutGrid } from "lucide-react"
import Link from "next/link"

export default function DeveloperViewsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#463939] mb-2" style={{fontFamily: 'var(--font-heading)'}}>
          Developer Views
        </h1>
        <p className="text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
          Personalized views showing active and completed work for each developer
        </p>
      </div>

      {/* Developer Sections */}
      <div className="space-y-8">
        {/* Nick's Views */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#407B9D] flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
              Nick's Views
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nick - Active Kanban */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                      <LayoutGrid className="w-6 h-6 text-[#407B9D]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle
                        className="text-lg text-[#463939] mb-2"
                        style={{fontFamily: 'var(--font-heading)'}}
                      >
                        Active Work - Kanban
                      </CardTitle>
                      <CardDescription
                        className="text-sm"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        View all active projects and tickets in kanban format
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/strms/developer-views/nick/active-kanban">
                  <Button
                    className="w-full bg-[#407B9D] hover:bg-[#407B9D]/90 text-white"
                    style={{fontFamily: 'var(--font-heading)'}}
                  >
                    Open View
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Nick - Active List */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                      <LayoutGrid className="w-6 h-6 text-[#407B9D]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle
                        className="text-lg text-[#463939] mb-2"
                        style={{fontFamily: 'var(--font-heading)'}}
                      >
                        Active Work - List
                      </CardTitle>
                      <CardDescription
                        className="text-sm"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        View all active projects and tickets in list format
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/strms/developer-views/nick/active-list">
                  <Button
                    className="w-full bg-[#407B9D] hover:bg-[#407B9D]/90 text-white"
                    style={{fontFamily: 'var(--font-heading)'}}
                  >
                    Open View
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Nick - Completed Kanban */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#C8E4BB]/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-[#407B9D]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle
                        className="text-lg text-[#463939] mb-2"
                        style={{fontFamily: 'var(--font-heading)'}}
                      >
                        Completed Work - Kanban
                      </CardTitle>
                      <CardDescription
                        className="text-sm"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        View completed and cancelled work in kanban format
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/strms/developer-views/nick/completed-kanban">
                  <Button
                    className="w-full bg-[#407B9D] hover:bg-[#407B9D]/90 text-white"
                    style={{fontFamily: 'var(--font-heading)'}}
                  >
                    Open View
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Nick - Completed List */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#C8E4BB]/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-[#407B9D]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle
                        className="text-lg text-[#463939] mb-2"
                        style={{fontFamily: 'var(--font-heading)'}}
                      >
                        Completed Work - List
                      </CardTitle>
                      <CardDescription
                        className="text-sm"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        View completed and cancelled work in list format
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/strms/developer-views/nick/completed-list">
                  <Button
                    className="w-full bg-[#407B9D] hover:bg-[#407B9D]/90 text-white"
                    style={{fontFamily: 'var(--font-heading)'}}
                  >
                    Open View
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gon's Views */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#407B9D] flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
              Gon's Views
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gon - Active Kanban */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                      <LayoutGrid className="w-6 h-6 text-[#407B9D]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle
                        className="text-lg text-[#463939] mb-2"
                        style={{fontFamily: 'var(--font-heading)'}}
                      >
                        Active Work - Kanban
                      </CardTitle>
                      <CardDescription
                        className="text-sm"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        View all active projects and tickets in kanban format
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/strms/developer-views/gon/active-kanban">
                  <Button
                    className="w-full bg-[#407B9D] hover:bg-[#407B9D]/90 text-white"
                    style={{fontFamily: 'var(--font-heading)'}}
                  >
                    Open View
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Gon - Active List */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                      <LayoutGrid className="w-6 h-6 text-[#407B9D]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle
                        className="text-lg text-[#463939] mb-2"
                        style={{fontFamily: 'var(--font-heading)'}}
                      >
                        Active Work - List
                      </CardTitle>
                      <CardDescription
                        className="text-sm"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        View all active projects and tickets in list format
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/strms/developer-views/gon/active-list">
                  <Button
                    className="w-full bg-[#407B9D] hover:bg-[#407B9D]/90 text-white"
                    style={{fontFamily: 'var(--font-heading)'}}
                  >
                    Open View
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Gon - Completed Kanban */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#C8E4BB]/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-[#407B9D]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle
                        className="text-lg text-[#463939] mb-2"
                        style={{fontFamily: 'var(--font-heading)'}}
                      >
                        Completed Work - Kanban
                      </CardTitle>
                      <CardDescription
                        className="text-sm"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        View completed and cancelled work in kanban format
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/strms/developer-views/gon/completed-kanban">
                  <Button
                    className="w-full bg-[#407B9D] hover:bg-[#407B9D]/90 text-white"
                    style={{fontFamily: 'var(--font-heading)'}}
                  >
                    Open View
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Gon - Completed List */}
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#C8E4BB]/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-[#407B9D]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle
                        className="text-lg text-[#463939] mb-2"
                        style={{fontFamily: 'var(--font-heading)'}}
                      >
                        Completed Work - List
                      </CardTitle>
                      <CardDescription
                        className="text-sm"
                        style={{fontFamily: 'var(--font-body)'}}
                      >
                        View completed and cancelled work in list format
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/strms/developer-views/gon/completed-list">
                  <Button
                    className="w-full bg-[#407B9D] hover:bg-[#407B9D]/90 text-white"
                    style={{fontFamily: 'var(--font-heading)'}}
                  >
                    Open View
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
