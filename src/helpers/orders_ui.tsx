import { OrderItem, OrderType } from "@/types/orders"
import { CheckCheck, Clock, Cookie, Flame, GlassWater, Loader2, UtensilsCrossed, Tag } from "lucide-react"

// Returns an icon for a category name — falls back to Tag for custom categories
export function getCategoryIcon(category: string): React.ReactNode {
  switch (category) {
    case "All":          return <UtensilsCrossed className="h-3.5 w-3.5" />
    case "Grills":       return <Flame className="h-3.5 w-3.5" />
    case "Rice & Sides": return <UtensilsCrossed className="h-3.5 w-3.5" />
    case "Snacks":       return <Cookie className="h-3.5 w-3.5" />
    case "Drinks":       return <GlassWater className="h-3.5 w-3.5" />
    default:             return <Tag className="h-3.5 w-3.5" />
  }
}

export const STATUS_CONFIG = {
  pending:   { label: "Pending",   icon: Clock,      color: "text-amber-400",   border: "border-amber-500/25",   bg: "bg-amber-500/8"   },
  preparing: { label: "Preparing", icon: Loader2,    color: "text-orange-400",  border: "border-orange-500/25",  bg: "bg-orange-500/8"  },
  ready:     { label: "Ready",     icon: CheckCheck, color: "text-emerald-400", border: "border-emerald-500/25", bg: "bg-emerald-500/8" },
}

// ****── Take-Order Modal ─────────
export interface TakeOrderModalProps {
  onClose: () => void
  onPlace: (items: OrderItem[], type: OrderType) => void
}