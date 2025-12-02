"use client"

import * as React from "react"
import { useRef } from "react"
import { Calendar, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DateTimePickerProps {
  date: string           // YYYY-MM-DD format
  time: string           // HH:mm format
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  onClear: () => void
  className?: string
  maxDate?: string       // Optional max date (YYYY-MM-DD format)
}

export function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  onClear,
  className,
  maxDate
}: DateTimePickerProps) {
  const dateRef = useRef<HTMLInputElement>(null)
  const timeRef = useRef<HTMLInputElement>(null)

  // Default maxDate to today if not provided
  const today = new Date().toISOString().split('T')[0]
  const effectiveMaxDate = maxDate || today

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {/* Date Input */}
      <div className="flex items-center gap-1.5">
        <Calendar className="w-4 h-4 text-[#666666]" />
        <input
          ref={dateRef}
          type="date"
          value={date}
          max={effectiveMaxDate}
          onChange={(e) => onDateChange(e.target.value)}
          onClick={() => dateRef.current?.showPicker()}
          className="text-sm text-[#463939] px-2 py-1.5 bg-white border-2 border-[#E5E5E5] rounded-lg
                     hover:border-[#407B9D] focus:border-[#407B9D] focus:ring-2 focus:ring-[#407B9D]/20
                     outline-none transition-all cursor-pointer"
          style={{ fontFamily: 'var(--font-body)' }}
        />
      </div>

      {/* Time Input */}
      <div className="flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-[#666666]" />
        <input
          ref={timeRef}
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          onClick={() => timeRef.current?.showPicker()}
          className="text-sm text-[#463939] px-2 py-1.5 bg-white border-2 border-[#E5E5E5] rounded-lg
                     hover:border-[#407B9D] focus:border-[#407B9D] focus:ring-2 focus:ring-[#407B9D]/20
                     outline-none transition-all cursor-pointer"
          style={{ fontFamily: 'var(--font-body)' }}
        />
      </div>

      {/* Clear Button - only show when date or time is set */}
      {(date || time) && (
        <button
          onClick={onClear}
          className="text-[#666666] hover:text-[#407B9D] transition-colors p-1"
          title="Use current date/time"
          type="button"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
