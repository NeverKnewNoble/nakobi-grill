import type { MenuItem, OrderItem, Order, OrderType } from "@/types/orders"

export function addToOrder(items: OrderItem[], menuItem: MenuItem): OrderItem[] {
  const existing = items.find((i) => i.menuItem.id === menuItem.id)
  if (existing) {
    return items.map((i) =>
      i.menuItem.id === menuItem.id ? { ...i, qty: i.qty + 1 } : i
    )
  }
  return [...items, { menuItem, qty: 1 }]
}

export function removeFromOrder(items: OrderItem[], menuItemId: string): OrderItem[] {
  return items.filter((i) => i.menuItem.id !== menuItemId)
}

export function updateQty(items: OrderItem[], menuItemId: string, qty: number): OrderItem[] {
  if (qty <= 0) return removeFromOrder(items, menuItemId)
  return items.map((i) => (i.menuItem.id === menuItemId ? { ...i, qty } : i))
}

export function calcTotal(items: OrderItem[]): number {
  return items.reduce((sum, i) => sum + i.menuItem.price * i.qty, 0)
}

export function buildOrder(items: OrderItem[], type: OrderType, count: number): Order {
  return {
    id: crypto.randomUUID(),
    orderNumber: `#${String(count).padStart(3, "0")}`,
    items,
    type,
    status: "pending",
    total: calcTotal(items),
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }
}

export function filterMenu<T extends { category: string }>(
  items: T[],
  category: string
): T[] {
  if (category === "All") return items
  return items.filter((i) => i.category === category)
}

export function cycleStatus(status: Order["status"]): Order["status"] {
  if (status === "pending") return "preparing"
  if (status === "preparing") return "ready"
  return "ready"
}
