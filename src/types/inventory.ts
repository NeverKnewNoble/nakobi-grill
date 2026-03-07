export type InventoryStatus = "ok" | "low" | "critical"
export type InventoryUnit = "kg" | "g" | "L" | "ml" | "pcs" | "bags" | "crates"

export interface InventoryItem {
  id: string
  ingredient: string
  unit: InventoryUnit
  current_stock: number
  threshold: number
  weekly_usage: number
  status: InventoryStatus
  last_updated: string
}

export interface RestockPayload {
  quantity: number
}

export interface StockOutPayload {
  quantity: number
}

export interface AddInventoryPayload {
  ingredient: string
  unit: InventoryUnit
  current_stock: string
  threshold: string
  weekly_usage: string
}
