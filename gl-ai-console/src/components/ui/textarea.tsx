import * as React from "react"
import { cn } from "@/lib/utils"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border-2 border-[#E5E5E5] bg-white px-4 py-2 text-sm text-[#463939] shadow-sm transition-all duration-200 placeholder:text-[#999999] focus-visible:outline-none focus-visible:border-[#407B9D] focus-visible:ring-2 focus-visible:ring-[#407B9D]/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F5F5F5]",
          className
        )}
        style={{fontFamily: 'var(--font-body)'}}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
