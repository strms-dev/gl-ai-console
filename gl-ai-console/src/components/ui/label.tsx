"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-semibold leading-none text-[#463939] peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    style={{fontFamily: 'var(--font-heading)'}}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }