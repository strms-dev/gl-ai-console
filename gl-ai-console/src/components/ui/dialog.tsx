"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (open) {
      // Store original values
      const originalBodyOverflow = document.body.style.overflow
      const originalHtmlOverflow = document.documentElement.style.overflow
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

      // Prevent scrolling on both html and body
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'

      // Prevent layout shift by adding padding to compensate for scrollbar
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }

      // Cleanup on unmount or when modal closes
      return () => {
        document.body.style.overflow = originalBodyOverflow
        document.documentElement.style.overflow = originalHtmlOverflow
        document.body.style.paddingRight = ''
      }
    } else {
      // Ensure cleanup happens when modal closes (open becomes false)
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full">
        {children}
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-background p-6 shadow-lg rounded-lg border max-h-[90vh] overflow-auto mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
DialogContent.displayName = "DialogContent"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogHeader = ({ className, ...props }: DialogHeaderProps) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
)
DialogTitle.displayName = "DialogTitle"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogFooter = ({ className, ...props }: DialogFooterProps) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
}