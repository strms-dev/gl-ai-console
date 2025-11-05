"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
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
          Personalized workspaces showing prioritized work items for each developer
        </p>
      </div>

      {/* Developer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Nick */}
        <Card className="bg-white border-none shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-[#407B9D] flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle
                  className="text-2xl text-[#463939] mb-2"
                  style={{fontFamily: 'var(--font-heading)'}}
                >
                  Nick's Workspace
                </CardTitle>
                <CardDescription
                  className="text-sm"
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  View and manage Nick's development projects and maintenance tickets with drag-and-drop priority ordering
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/strms/developer-views/nick">
              <Button
                className="w-full bg-[#407B9D] hover:bg-[#407B9D]/90 text-white"
                style={{fontFamily: 'var(--font-heading)'}}
              >
                Open Nick's View
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Gon */}
        <Card className="bg-white border-none shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-[#407B9D] flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle
                  className="text-2xl text-[#463939] mb-2"
                  style={{fontFamily: 'var(--font-heading)'}}
                >
                  Gon's Workspace
                </CardTitle>
                <CardDescription
                  className="text-sm"
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  View and manage Gon's development projects and maintenance tickets with drag-and-drop priority ordering
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/strms/developer-views/gon">
              <Button
                className="w-full bg-[#407B9D] hover:bg-[#407B9D]/90 text-white"
                style={{fontFamily: 'var(--font-heading)'}}
              >
                Open Gon's View
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
