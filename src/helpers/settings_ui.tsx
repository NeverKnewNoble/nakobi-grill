import { AddMenuItemPayload } from "@/types/orders";

export const EMPTY_MEAL: AddMenuItemPayload = { name: "", description: "", price: "", category: "" }

// ── Field wrapper ─────────────────────────────────────────────────────────
export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
