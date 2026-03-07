"use client"

import { TriangleAlert } from "lucide-react"
import { Button } from "@heroui/react"

interface DeleteAlertProps {
  open: boolean
  title: string
  description: string
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteAlert({ open, title, description, onClose, onConfirm }: DeleteAlertProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-red-500/20 bg-zinc-900 text-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
            <TriangleAlert className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <p className="text-base font-bold text-white">{title}</p>
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-white/5 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-white/10 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <Button
            onPress={onConfirm}
            className="flex-1 rounded-full bg-red-500 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:bg-red-400 transition-colors"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
