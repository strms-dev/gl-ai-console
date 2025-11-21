"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Save, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TimeEntry, ProjectType, Developer } from "@/lib/types"
import { createTimeEntry, getWeekStartDate, formatMinutes } from "@/lib/services/time-tracking-service"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export interface TimeTrackerProps {
  projectId: string
  projectType: ProjectType
  assignee: Developer
  onTimeLogged?: (entry: TimeEntry) => void
  className?: string
}

// ============================================================================
// TIME TRACKER COMPONENT
// ============================================================================

export function TimeTracker({
  projectId,
  projectType,
  assignee,
  onTimeLogged,
  className
}: TimeTrackerProps) {
  // Timer state
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Manual entry state
  const [manualHours, setManualHours] = useState("")
  const [manualMinutes, setManualMinutes] = useState("")
  const [manualNotes, setManualNotes] = useState("")
  const [showManualEntry, setShowManualEntry] = useState(false)

  // Timer logic
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  // Format elapsed time as HH:MM:SS
  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Start timer
  const handleStart = () => {
    setStartTime(new Date())
    setIsRunning(true)
  }

  // Pause timer
  const handlePause = () => {
    setIsRunning(false)
  }

  // Save timer entry
  const handleSaveTimer = async () => {
    if (!startTime || elapsedSeconds === 0) return

    try {
      const entry = await createTimeEntry({
        projectId,
        projectType,
        assignee,
        duration: Math.floor(elapsedSeconds / 60), // Convert to minutes
        notes: "",
        weekStartDate: getWeekStartDate()
      })

      onTimeLogged?.(entry)

      // Reset timer
      setIsRunning(false)
      setStartTime(null)
      setElapsedSeconds(0)
    } catch (error) {
      console.error("Error saving time entry:", error)
      alert("Failed to save time entry. Please try again.")
    }
  }

  // Save manual entry
  const handleSaveManual = async () => {
    const hours = parseInt(manualHours) || 0
    const minutes = parseInt(manualMinutes) || 0
    const totalMinutes = (hours * 60) + minutes

    if (totalMinutes === 0) {
      alert("Please enter a valid time duration")
      return
    }

    try {
      const entry = await createTimeEntry({
        projectId,
        projectType,
        assignee,
        duration: totalMinutes,
        notes: manualNotes,
        weekStartDate: getWeekStartDate()
      })

      onTimeLogged?.(entry)

      // Reset form
      setManualHours("")
      setManualMinutes("")
      setManualNotes("")
      setShowManualEntry(false)
    } catch (error) {
      console.error("Error saving manual time entry:", error)
      alert("Failed to save time entry. Please try again.")
    }
  }

  return (
    <Card className={cn("bg-white border-[#E5E5E5]", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#463939]" style={{fontFamily: 'var(--font-heading)'}}>
          <Clock className="w-5 h-5 text-[#407B9D]" />
          Time Tracker
        </CardTitle>
        <CardDescription style={{fontFamily: 'var(--font-body)'}}>
          Track time spent on this {projectType === "development" ? "project" : "ticket"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showManualEntry ? (
          <div className="space-y-4">
            {/* Timer Display */}
            <div className="flex items-center justify-center py-6 bg-[#FAF9F9] rounded-lg border border-[#E5E5E5]">
              <div
                className="text-4xl font-bold text-[#407B9D] tabular-nums"
                style={{fontFamily: 'var(--font-heading)'}}
              >
                {formatElapsedTime(elapsedSeconds)}
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex gap-2">
              {!isRunning ? (
                <Button
                  onClick={handleStart}
                  className="flex-1 bg-[#407B9D] hover:bg-[#407B9D]/90"
                  disabled={elapsedSeconds > 0}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Timer
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  className="flex-1 bg-[#95CBD7] hover:bg-[#95CBD7]/90 text-[#463939]"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}

              {elapsedSeconds > 0 && !isRunning && (
                <Button
                  onClick={handleSaveTimer}
                  className="flex-1 bg-[#C8E4BB] hover:bg-[#C8E4BB]/90 text-[#463939]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Time
                </Button>
              )}
            </div>

            {/* Manual Entry Toggle */}
            <div className="pt-4 border-t border-[#E5E5E5]">
              <Button
                variant="ghost"
                onClick={() => setShowManualEntry(true)}
                className="w-full text-[#407B9D] hover:bg-[#407B9D]/10"
              >
                Or add time manually
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Manual Entry Form */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hours" style={{fontFamily: 'var(--font-body)'}}>Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  value={manualHours}
                  onChange={(e) => setManualHours(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="minutes" style={{fontFamily: 'var(--font-body)'}}>Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" style={{fontFamily: 'var(--font-body)'}}>Notes (optional)</Label>
              <Input
                id="notes"
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="What did you work on?"
              />
            </div>

            {/* Manual Entry Controls */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveManual}
                className="flex-1 bg-[#407B9D] hover:bg-[#407B9D]/90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Time
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowManualEntry(false)
                  setManualHours("")
                  setManualMinutes("")
                  setManualNotes("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
