"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

interface ConfirmationSystemProps {
  onConfirmationComplete?: () => void
}

interface Confirmation {
  id: string
  action: string
  status: "pending" | "completed" | "error"
  timestamp: Date
  details?: string
}

export function ConfirmationSystem({ onConfirmationComplete }: ConfirmationSystemProps) {
  const [confirmations, setConfirmations] = useState<Confirmation[]>([])

  const addConfirmation = (action: string, details?: string) => {
    const confirmation: Confirmation = {
      id: Date.now().toString(),
      action,
      status: "pending",
      timestamp: new Date(),
      details,
    }

    setConfirmations((prev) => [confirmation, ...prev.slice(0, 4)]) // Keep last 5

    // Auto-complete after 1 second
    setTimeout(() => {
      setConfirmations((prev) =>
        prev.map((conf) => (conf.id === confirmation.id ? { ...conf, status: "completed" } : conf)),
      )
      onConfirmationComplete?.()
    }, 1000)

    return confirmation.id
  }

  const markError = (id: string, errorDetails?: string) => {
    setConfirmations((prev) =>
      prev.map((conf) => (conf.id === id ? { ...conf, status: "error", details: errorDetails } : conf)),
    )
  }

  // Expose methods globally for other components to use
  useEffect(() => {
    ;(window as any).jarvisConfirmation = {
      add: addConfirmation,
      error: markError,
    }
  }, [])

  const getStatusIcon = (status: Confirmation["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3 text-yellow-500 animate-spin" />
      case "completed":
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case "error":
        return <AlertCircle className="w-3 h-3 text-red-500" />
    }
  }

  const getStatusText = (status: Confirmation["status"]) => {
    switch (status) {
      case "pending":
        return "Processing..."
      case "completed":
        return "Done ✅"
      case "error":
        return "Error ❌"
    }
  }

  if (confirmations.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {confirmations.map((confirmation) => (
        <div
          key={confirmation.id}
          className={`p-3 rounded-lg border backdrop-blur-sm transition-all duration-300 ${
            confirmation.status === "completed"
              ? "bg-green-50/90 border-green-200 dark:bg-green-950/90 dark:border-green-800"
              : confirmation.status === "error"
                ? "bg-red-50/90 border-red-200 dark:bg-red-950/90 dark:border-red-800"
                : "bg-yellow-50/90 border-yellow-200 dark:bg-yellow-950/90 dark:border-yellow-800"
          }`}
        >
          <div className="flex items-center space-x-2">
            {getStatusIcon(confirmation.status)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{confirmation.action}</p>
              {confirmation.details && <p className="text-xs text-muted-foreground truncate">{confirmation.details}</p>}
            </div>
            <Badge
              variant={
                confirmation.status === "completed"
                  ? "default"
                  : confirmation.status === "error"
                    ? "destructive"
                    : "secondary"
              }
              className="text-xs"
            >
              {getStatusText(confirmation.status)}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
