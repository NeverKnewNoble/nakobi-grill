import { InventoryItem } from "@/types/inventory"
import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react"

export function StatusBadge({ status }: { status: InventoryItem["status"] }) {
  if (status === "ok") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
        <CheckCircle className="h-3 w-3" />
        OK
      </span>
    )
  }
  if (status === "low") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
        <AlertCircle className="h-3 w-3" />
        Low
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
      <AlertTriangle className="h-3 w-3" />
      Critical
    </span>
  )
}

