"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {

  return (
    <div className="min-h-screen bg-[#FAF9F9]">
      <div className="max-w-5xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1
            className="text-5xl font-bold text-[#463939] mb-4"
            style={{fontFamily: 'var(--font-heading)'}}
          >
            Welcome to GrowthLab AI Console
          </h1>
          <p
            className="text-xl text-[#666666] max-w-2xl mx-auto"
            style={{fontFamily: 'var(--font-body)'}}
          >
            Your unified AI-powered workspace for streamlined business operations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p
                  className="text-sm text-[#666666] uppercase tracking-wide mb-2"
                  style={{fontFamily: 'var(--font-heading)'}}
                >
                  Departments
                </p>
                <p
                  className="text-4xl font-bold text-[#407B9D]"
                  style={{fontFamily: 'var(--font-heading)'}}
                >
                  1
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p
                  className="text-sm text-[#666666] uppercase tracking-wide mb-2"
                  style={{fontFamily: 'var(--font-heading)'}}
                >
                  Optimized Processes
                </p>
                <p
                  className="text-4xl font-bold text-[#407B9D]"
                  style={{fontFamily: 'var(--font-heading)'}}
                >
                  1
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p
                  className="text-sm text-[#666666] uppercase tracking-wide mb-2"
                  style={{fontFamily: 'var(--font-heading)'}}
                >
                  Status
                </p>
                <p
                  className="text-4xl font-bold text-[#C8E4BB]"
                  style={{fontFamily: 'var(--font-heading)'}}
                >
                  ●
                </p>
                <p
                  className="text-xs text-[#666666] mt-1"
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  Active
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
