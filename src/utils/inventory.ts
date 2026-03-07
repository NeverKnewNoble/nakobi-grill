import type { InventoryItem, InventoryStatus, AddInventoryPayload } from "@/types/inventory"

export function deriveStatus(current: number, threshold: number): InventoryStatus {
  if (current <= threshold * 0.5) return "critical"
  if (current <= threshold) return "low"
  return "ok"
}

export function restockItem(items: InventoryItem[], id: string, qty: number): InventoryItem[] {
  return items.map((item) => {
    if (item.id !== id) return item
    const current_stock = item.current_stock + qty
    return {
      ...item,
      current_stock,
      status: deriveStatus(current_stock, item.threshold),
      last_updated: new Date().toISOString().split("T")[0],
    }
  })
}

export function stockOutItem(items: InventoryItem[], id: string, qty: number): InventoryItem[] {
  return items.map((item) => {
    if (item.id !== id) return item
    const current_stock = Math.max(0, item.current_stock - qty)
    return {
      ...item,
      current_stock,
      status: deriveStatus(current_stock, item.threshold),
      last_updated: new Date().toISOString().split("T")[0],
    }
  })
}

export function deleteInventoryItem(items: InventoryItem[], id: string): InventoryItem[] {
  return items.filter((i) => i.id !== id)
}

export function filterInventory(items: InventoryItem[], search: string): InventoryItem[] {
  const q = search.toLowerCase()
  return items.filter((i) => i.ingredient.toLowerCase().includes(q))
}

export const EMPTY_INVENTORY_FORM: AddInventoryPayload = {
  ingredient: "",
  unit: "kg",
  current_stock: "",
  threshold: "",
  weekly_usage: "",
}

export function validateInventoryForm(form: AddInventoryPayload): Partial<Record<keyof AddInventoryPayload, string>> {
  const errors: Partial<Record<keyof AddInventoryPayload, string>> = {}
  if (!form.ingredient.trim()) errors.ingredient = "Ingredient name is required"
  if (!form.current_stock || isNaN(parseFloat(form.current_stock)) || parseFloat(form.current_stock) < 0)
    errors.current_stock = "Enter a valid current stock"
  if (!form.threshold || isNaN(parseFloat(form.threshold)) || parseFloat(form.threshold) <= 0)
    errors.threshold = "Enter a valid threshold greater than 0"
  if (!form.weekly_usage || isNaN(parseFloat(form.weekly_usage)) || parseFloat(form.weekly_usage) <= 0)
    errors.weekly_usage = "Enter a valid weekly usage greater than 0"
  return errors
}

export function buildNewInventoryItem(form: AddInventoryPayload, existingCount: number): InventoryItem {
  const current_stock = parseFloat(form.current_stock)
  const threshold = parseFloat(form.threshold)
  const weekly_usage = parseFloat(form.weekly_usage)
  return {
    id: String(existingCount + 1),
    ingredient: form.ingredient.trim(),
    unit: form.unit,
    current_stock,
    threshold,
    weekly_usage,
    status: deriveStatus(current_stock, threshold),
    last_updated: new Date().toISOString().split("T")[0],
  }
}

