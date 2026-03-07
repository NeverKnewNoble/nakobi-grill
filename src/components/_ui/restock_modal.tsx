"use client"

import { useState } from "react"
import { PackagePlus } from "lucide-react"
import { Button } from "@heroui/react"
import type { InventoryItem } from "@/types/inventory"

interface RestockModalProps {
  item: InventoryItem | null
  onClose: () => void
  onConfirm: (id: string, qty: number) => void
}

export default function RestockModal({ item, onClose, onConfirm }: RestockModalProps) {
  const [qty, setQty] = useState("")
  const [error, setError] = useState("")

  if (!item) return null

  function handleConfirm() {
    const parsed = parseFloat(qty)
    if (!qty || isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid quantity greater than 0")
      return
    }
    onConfirm(item!.id, parsed)
    setQty("")
    setError("")
  }

  function handleClose() {
    setQty("")
    setError("")
    onClose()
  }

  const newStock = qty && !isNaN(parseFloat(qty)) ? item.current_stock + parseFloat(qty) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/5 bg-zinc-900 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/5 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
            <PackagePlus className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-base font-bold text-white">Restock</p>
            <p className="text-xs text-zinc-500 truncate max-w-55">{item.ingredient}</p>
          </div>
          <button
            onClick={handleClose}
            className="ml-auto rounded-md p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-6 py-6">
          {/* Info row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/5 bg-white/3 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-zinc-500">Current Stock</p>
              <p className="mt-1 text-xl font-extrabold text-white">
                {item.current_stock} <span className="text-sm font-normal text-zinc-400">{item.unit}</span>
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/3 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-zinc-500">Threshold</p>
              <p className="mt-1 text-xl font-extrabold text-zinc-300">
                {item.threshold} <span className="text-sm font-normal text-zinc-400">{item.unit}</span>
              </p>
            </div>
          </div>

          {/* Quantity input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">
              Quantity to Restock ({item.unit})
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="e.g. 20"
              value={qty}
              onChange={(e) => { setQty(e.target.value); setError("") }}
              className="h-10 w-full rounded-md border border-white/10 bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-[border,box-shadow]"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          {/* Preview */}
          {newStock !== null && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <span className="text-xs text-zinc-400">New stock after restock</span>
              <span className="text-sm font-bold text-emerald-400">
                {newStock.toFixed(1)} {item.unit}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-white/5 px-6 py-4">
          <button
            onClick={handleClose}
            className="flex-1 rounded-full border border-white/10 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <Button
            onPress={handleConfirm}
            className="flex-1 rounded-full bg-emerald-500 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
          >
            Confirm Restock
          </Button>
        </div>
      </div>
    </div>
  )
}
