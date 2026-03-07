import { UserRole } from "@/types/users"
import { getInitials } from "@/utils/generalUtils"
import { ClipboardList, Package, ShieldCheck } from "lucide-react"

export const roleIcon: Record<UserRole, React.ReactNode> = {
  Admin: <ShieldCheck className="h-3.5 w-3.5" />,
  "Inventory Manager": <Package className="h-3.5 w-3.5" />,
  "Order Taker": <ClipboardList className="h-3.5 w-3.5" />,
}

export function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs font-bold text-orange-400">
      {getInitials(name)}
    </div>
  )
}