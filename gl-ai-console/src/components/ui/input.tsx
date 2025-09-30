import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border-2 border-[#E5E5E5] bg-white px-4 py-2 text-sm text-[#463939] shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#999999] focus-visible:outline-none focus-visible:border-[#407B9D] focus-visible:ring-2 focus-visible:ring-[#407B9D]/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F5F5F5]",
          className
        )}
        style={{fontFamily: 'var(--font-body)'}}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }