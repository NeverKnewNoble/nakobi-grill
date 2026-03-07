"use client"

import { UserPlus } from "lucide-react"
import { Button } from "@heroui/react"
import type { UserRole, ShiftType, UserStatus, CreateUserPayload } from "@/types/users"

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface CreateUserModalProps {
  open: boolean
  form: CreateUserPayload
  errors: Partial<Record<keyof CreateUserPayload, string>>
  onClose: () => void
  onCreate: () => void
  onFormChange: (patch: Partial<CreateUserPayload>) => void
}

// ── Component ─────────────────────────────────────────────────────────────────
const inputCls =
  "h-9 w-full rounded-md border border-white/10 bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-[border,box-shadow]"

const selectCls =
  "h-9 w-full rounded-md border border-white/10 bg-zinc-800 px-3 text-sm text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-[border,box-shadow]"

export default function CreateUserModal({
  open,
  form,
  errors,
  onClose,
  onCreate,
  onFormChange,
}: CreateUserModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/5 bg-zinc-900 text-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/5 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/15">
            <UserPlus className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <p className="text-base font-bold text-white">New User</p>
            <p className="text-xs text-zinc-500">Add a new staff member to Nakobi Grill.</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-md p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto px-6 py-6">
          <Field label="Full Name" error={errors.full_name}>
            <input
              placeholder="e.g. Ama Asante"
              value={form.full_name}
              onChange={(e) => onFormChange({ full_name: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              placeholder="staff@nakobigrill.com"
              value={form.email}
              onChange={(e) => onFormChange({ email: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Password" error={errors.password}>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => onFormChange({ password: e.target.value })}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Role">
              <select
                value={form.role}
                onChange={(e) => onFormChange({ role: e.target.value as UserRole })}
                className={selectCls}
              >
                <option value="Admin">Admin</option>
                <option value="Inventory Manager">Inventory Manager</option>
                <option value="Order Taker">Order Taker</option>
              </select>
            </Field>

            <Field label="Shift Type">
              <select
                value={form.shift_type}
                onChange={(e) => onFormChange({ shift_type: e.target.value as ShiftType })}
                className={selectCls}
              >
                <option value="Day Shift">Day Shift</option>
                <option value="Night Shift">Night Shift</option>
              </select>
            </Field>
          </div>

          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => onFormChange({ status: e.target.value as UserStatus })}
              className={selectCls}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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
            onPress={onCreate}
            className="flex-1 rounded-full bg-orange-500 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400 transition-colors"
          >
            Create User
          </Button>
        </div>

      </div>
    </div>
  )
}
