"use client"

import Link from "next/link"
import { OffboardingTimeline } from "@/components/offboarding/offboarding-timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { stageLabels, stageColors, OffboardingCustomer } from "@/lib/offboarding-data"
import { getTimelineForCustomer } from "@/lib/offboarding-timeline-data"
import { cn } from "@/lib/utils"
import { getCustomerById, updateCustomer, getCompletionDates } from "@/lib/offboarding-store"
import { use, useState, useEffect, useMemo } from "react"
import { User } from "lucide-react"

interface CustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  // Use React's use hook for client components
  const { id } = use(params)

  // Reactive customer state that updates when customer data changes
  const [customer, setCustomer] = useState<OffboardingCustomer | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  // State to track completion dates for each stage
  const [completionDates, setCompletionDates] = useState<Record<string, string>>({})

  // Generate timeline based on current customer stage
  const timeline = useMemo(() => {
    return getTimelineForCustomer(id, customer?.stage)
  }, [id, customer?.stage])

  // Calculate actual timeline progress based on customer stage
  const calculateTimelineProgress = () => {
    if (!customer) return { completed: 0, total: timeline.length }

    // Define the stage order
    const stageOrder = ['active', 'terminate-automations', 'terminate-billing', 'revoke-access', 'update-inventory', 'send-email', 'complete']
    const currentStageIndex = stageOrder.indexOf(customer.stage)

    let completedCount = 0

    // Count stages before current stage as completed
    for (let i = 0; i < currentStageIndex && i < stageOrder.length; i++) {
      if (i > 0) { // Don't count 'active' as a completed stage
        completedCount++
      }
    }

    // If we're at complete stage, count it as well
    if (customer.stage === 'complete') {
      completedCount = timeline.length
    }

    return { completed: completedCount, total: timeline.length }
  }

  const { completed: completedStages, total: totalStages } = calculateTimelineProgress()

  // State to track collapsible sections
  const [collapsedSections, setCollapsedSections] = useState({
    summary: false,
    timeline: false
  })

  // Monitor for customer data changes
  useEffect(() => {
    let isInitialLoad = true

    const checkForCustomerUpdates = async () => {
      // Only show loading on initial load
      if (isInitialLoad) {
        setIsLoading(true)
      }

      const updatedCustomer = await getCustomerById(id)
      setCustomer(updatedCustomer)

      if (isInitialLoad) {
        setIsLoading(false)
        isInitialLoad = false
      }
    }

    // Check immediately
    checkForCustomerUpdates()

    // Set up an interval to check for updates (every 5 seconds)
    const interval = setInterval(checkForCustomerUpdates, 5000)

    return () => clearInterval(interval)
  }, [id])

  // Load completion dates on mount
  useEffect(() => {
    const loadCompletionDates = async () => {
      try {
        const dates = await getCompletionDates(id)
        setCompletionDates(dates)
      } catch (error) {
        console.error("Failed to load completion dates:", error)
      }
    }

    loadCompletionDates()
  }, [id])

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (isLoading) {
    return (
      <div className="p-8 bg-muted/30">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-32 h-9 bg-gray-200 rounded-md animate-pulse"></div>
            <div>
              <div className="w-64 h-9 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        <div className="space-y-8">
          {/* Customer Summary Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-40 h-7 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Offboarding Timeline Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-48 h-7 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="p-8 bg-muted/30">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Customer Not Found</h1>
          <Link href="/strms/offboarding">
            <Button>Back to Offboarding</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-muted/30">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/strms/offboarding">
            <Button variant="outline" size="sm">← Back to Offboarding</Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {customer.company || "—"}
            </h1>
            <p className="text-muted-foreground">
              {customer.contact} • {customer.email}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={cn(
            "inline-flex items-center px-4 py-2 rounded-full text-base font-medium",
            stageColors[customer.stage]
          )}>
            {stageLabels[customer.stage]}
          </span>
        </div>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customer Summary</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('summary')}
                className="h-8 w-8 p-0"
              >
                {collapsedSections.summary ? "+" : "−"}
              </Button>
            </div>
          </CardHeader>
          {!collapsedSections.summary && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company</label>
                  <p className="text-foreground">{customer.company || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Primary Contact</label>
                  <p className="text-foreground">{customer.contact}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground">{customer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Stage</label>
                  <p className="text-foreground">{stageLabels[customer.stage]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Activity</label>
                  <p className="text-foreground">{customer.lastActivity}</p>
                </div>
              </div>
              {customer.notes && (
                <div className="mt-6 pt-6 border-t border-border">
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-foreground mt-2 whitespace-pre-wrap">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle>Offboarding Timeline</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {completedStages} of {totalStages} completed
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('timeline')}
                className="h-8 w-8 p-0"
              >
                {collapsedSections.timeline ? "+" : "−"}
              </Button>
            </div>
            {/* Progress Bar and Legend when not collapsed */}
            {!collapsedSections.timeline && (
              <>
                <div className="w-full bg-gray-200/60 rounded-full h-2.5 mt-4 overflow-hidden">
                  <div
                    className="bg-[#407B9D] h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.round((completedStages / totalStages) * 100)}%`
                    }}
                  />
                </div>
                {/* Automation Level Legend */}
                <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/20">
                      <User className="w-3.5 h-3.5" /> Manual
                    </span>
                    <span className="text-xs text-gray-600 font-medium">5 stages</span>
                  </div>
                </div>
              </>
            )}
          </CardHeader>
          {!collapsedSections.timeline && (
            <OffboardingTimeline
              events={timeline}
              customerId={id}
              hideHeader={true}
              customerStage={customer?.stage}
              completionDates={completionDates}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
