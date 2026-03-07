export type MenuCategory = string   // user-defined; defaults: Grills, Rice & Sides, Snacks, Drinks
export type OrderType = "Dine In" | "Takeaway"
export type OrderStatus = "pending" | "preparing" | "ready"

export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  description: string
}

export interface AddMenuItemPayload {
  name: string
  description: string
  price: string
  category: string
}

export interface OrderItem {
  menuItem: MenuItem
  qty: number
}

export interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  type: OrderType
  status: OrderStatus
  total: number
  createdAt: string
}
