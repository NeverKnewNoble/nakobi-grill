"use client"

import { PackagePlus } from "lucide-react"
import { Button } from "@heroui/react"
import type { AddInventoryPayload, InventoryUnit } from "@/types/inventory"

const UNITS: InventoryUnit[] = ["kg", "g", "L", "ml", "pcs", "bags", "crates"]

interface AddInventoryModalProps {
  open: boolean
  form: AddInventoryPayload
  errors: Partial<Record<keyof AddInventoryPayload, string>>
  onClose: () => void
  onAdd: () => void
  onFormChange: (patch: Partial<AddInventoryPayload>) => void
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default function AddInventoryModal({ open, form, errors, onClose, onAdd, onFormChange }: AddInventoryModalProps) {
  if (!open) return null

  const inputClass = (err?: string) =>
    `h-10 w-full rounded-md border bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-[border,box-shadow] ${
      err
        ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
        : "border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/5 bg-zinc-900 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/5 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/15">
            <PackagePlus className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <p className="text-base font-bold text-white">Add Inventory Item</p>
            <p className="text-xs text-zinc-500">Fill in the ingredient details</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-md p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-6 py-6">
          {/* Ingredient name */}
          <Field label="Ingredient Name" error={errors.ingredient}>
            <input
              type="text"
              placeholder="e.g. Beef Ribeye"
              value={form.ingredient}
              onChange={(e) => onFormChange({ ingredient: e.target.value })}
              className={inputClass(errors.ingredient)}
            />
          </Field>

          {/* Unit */}
          <Field label="Unit">
            <select
              value={form.unit}
              onChange={(e) => onFormChange({ unit: e.target.value as InventoryUnit })}
              className="h-10 w-full rounded-md border border-white/10 bg-zinc-800 px-3 text-sm text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-[border,box-shadow]"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </Field>

          {/* Current stock + Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Current Stock" error={errors.current_stock}>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 20"
                value={form.current_stock}
                onChange={(e) => onFormChange({ current_stock: e.target.value })}
                className={inputClass(errors.current_stock)}
              />
            </Field>
            <Field label="Threshold" error={errors.threshold}>
              <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="e.g. 10"
                value={form.threshold}
                onChange={(e) => onFormChange({ threshold: e.target.value })}
                className={inputClass(errors.threshold)}
              />
            </Field>
          </div>

          {/* Weekly usage */}
          <Field label="Weekly Usage" error={errors.weekly_usage}>
            <input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="e.g. 15"
              value={form.weekly_usage}
              onChange={(e) => onFormChange({ weekly_usage: e.target.value })}
              className={inputClass(errors.weekly_usage)}
            />
          </Field>
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
            onPress={onAdd}
            className="flex-1 rounded-full bg-orange-500 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400 transition-colors"
          >
            Add Item
          </Button>
        </div>
      </div>
    </div>
  )
}
