"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, Info } from "lucide-react"

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  variant?: "default" | "warning" | "info"
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = "default"
}: AlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {variant === "warning" && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
            )}
            {variant === "info" && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
            )}
            <DialogTitle style={{fontFamily: 'var(--font-heading)'}}>
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-[#666666]" style={{fontFamily: 'var(--font-body)'}}>
            {description}
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-[#407B9D] hover:bg-[#407B9D]/90"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
