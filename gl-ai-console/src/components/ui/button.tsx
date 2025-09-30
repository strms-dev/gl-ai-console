import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#407B9D] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          {
            "bg-[#407B9D] text-white shadow-md hover:bg-[#325F7A] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]":
              variant === "default",
            "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]":
              variant === "destructive",
            "border-2 border-[#407B9D] bg-white text-[#407B9D] shadow-sm hover:bg-[#407B9D] hover:text-white hover:shadow-md":
              variant === "outline",
            "bg-[#95CBD7] text-[#463939] shadow-sm hover:bg-[#95CBD7]/80 hover:shadow-md":
              variant === "secondary",
            "hover:bg-[#95CBD7]/20 hover:text-[#407B9D]": variant === "ghost",
            "text-[#407B9D] underline-offset-4 hover:underline hover:text-[#325F7A]": variant === "link",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        style={{fontFamily: 'var(--font-heading)'}}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }