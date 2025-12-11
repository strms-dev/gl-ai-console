"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "success" | "destructive" | "info"
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (toast: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((newToast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toastWithId = { ...newToast, id }

    setToasts((prev) => [...prev, toastWithId])

    // Auto dismiss after duration (default 4 seconds)
    const duration = newToast.duration ?? 4000
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = {
    default: Info,
    success: CheckCircle,
    destructive: AlertCircle,
    info: Info,
  }[toast.variant || "default"]

  const iconColor = {
    default: "text-[#407B9D]",
    success: "text-green-600",
    destructive: "text-red-600",
    info: "text-[#407B9D]",
  }[toast.variant || "default"]

  const borderColor = {
    default: "border-l-[#407B9D]",
    success: "border-l-green-600",
    destructive: "border-l-red-600",
    info: "border-l-[#407B9D]",
  }[toast.variant || "default"]

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex items-start gap-3 animate-in slide-in-from-right-full duration-300 border-l-4",
        borderColor
      )}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", iconColor)} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#463939] text-sm">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-muted-foreground mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-muted-foreground hover:text-[#463939] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
