"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, id, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(event.target.checked)
    }

    return (
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          id={id}
          checked={checked}
          onChange={handleChange}
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 shrink-0 rounded border-2 transition-all duration-200 cursor-pointer",
            checked
              ? "bg-[#407B9D] border-[#407B9D]"
              : "border-gray-300 bg-white hover:border-[#407B9D]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#407B9D] focus-visible:ring-offset-2",
            props.disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          onClick={() => {
            if (!props.disabled) {
              onCheckedChange?.(!checked)
            }
          }}
        >
          {checked && (
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          )}
        </div>
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
