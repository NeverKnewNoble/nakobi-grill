// ********* DASHBOARD UTILS *********
import { supabase } from "@/lib/supabase/client"

export interface DashboardStats {
  todayRevenue: number
  ordersToday: number
  dineInToday: number
  takeawayToday: number
  activeStaff: number
  totalStaff: number
  stockAlerts: number
  criticalCount: number
  lowCount: number
}

export interface RecentOrder {
  id: string
  orderNumber: string
  itemsSummary: string
  type: string
  total: number
  status: "pending" | "preparing" | "ready"
  createdAt: string
}

export interface TopItem {
  name: string
  sold: number
  revenue: number
}

export interface StockAlertItem {
  id: string
  ingredient: string
  unit: string
  current_stock: number
  status: "low" | "critical"
}

export interface StaffMember {
  id: string
  full_name: string
  role: string
  shift_type: string
}

/**
 * Fetch all summary stats in parallel:
 * - Today's revenue, order count, dine-in vs takeaway split
 * - Active + total staff count
 * - Inventory alert counts
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [ordersRes, staffRes, inventoryRes] = await Promise.all([
    supabase
      .from("orders")
      .select("total, type")
      .gte("created_at", todayStart.toISOString())
      .neq("status", "cancelled"),
    supabase
      .from("profiles")
      .select("status"),
    supabase
      .from("inventory_items")
      .select("status"),
  ])

  const orders    = ordersRes.data    ?? []
  const staff     = staffRes.data     ?? []
  const inventory = inventoryRes.data ?? []

  const todayRevenue   = orders.reduce((sum: number, o: any) => sum + (o.total ?? 0), 0)
  const dineInToday    = orders.filter((o: any) => o.type === "Dine In").length
  const takeawayToday  = orders.filter((o: any) => o.type === "Takeaway").length
  const activeStaff    = staff.filter((s: any) => s.status === "active").length
  const criticalCount  = inventory.filter((i: any) => i.status === "critical").length
  const lowCount       = inventory.filter((i: any) => i.status === "low").length

  return {
    todayRevenue,
    ordersToday: orders.length,
    dineInToday,
    takeawayToday,
    activeStaff,
    totalStaff: staff.length,
    stockAlerts: criticalCount + lowCount,
    criticalCount,
    lowCount,
  }
}

/** Fetch the 5 most recent orders with a line-item summary string. */
export async function fetchRecentOrders(): Promise<RecentOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      type,
      status,
      total,
      created_at,
      order_items ( menu_item_name, qty )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    id: row.id,
    orderNumber: row.order_number,
    itemsSummary: (row.order_items ?? [])
      .map((i: any) => `${i.qty}× ${i.menu_item_name}`)
      .join(", "),
    type: row.type,
    total: row.total,
    status: row.status as RecentOrder["status"],
    createdAt: new Date(row.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }))
}

/**
 * Fetch the top 5 selling menu items this week.
 * Aggregates order_items client-side (no GROUP BY in PostgREST).
 */
export async function fetchTopSellingItems(): Promise<TopItem[]> {
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  weekStart.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from("orders")
    .select("order_items ( menu_item_name, qty, unit_price )")
    .gte("created_at", weekStart.toISOString())
    .neq("status", "cancelled")

  if (error) throw error

  const itemMap = new Map<string, { sold: number; revenue: number }>()
  ;(data ?? []).forEach((order: any) => {
    ;(order.order_items ?? []).forEach((item: any) => {
      const prev = itemMap.get(item.menu_item_name) ?? { sold: 0, revenue: 0 }
      itemMap.set(item.menu_item_name, {
        sold: prev.sold + item.qty,
        revenue: prev.revenue + item.qty * item.unit_price,
      })
    })
  })

  return Array.from(itemMap.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5)
}

/** Fetch all inventory items with low or critical status, critical first. */
export async function fetchStockAlerts(): Promise<StockAlertItem[]> {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("id, ingredient, unit, current_stock, status")
    .in("status", ["critical", "low"])
    .order("status", { ascending: true }) // 'critical' sorts before 'low'

  if (error) throw error
  return data as StockAlertItem[]
}

/** Fetch all currently active staff members. */
export async function fetchActiveStaff(): Promise<StaffMember[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, shift_type")
    .eq("status", "active")
    .order("full_name", { ascending: true })

  if (error) throw error
  return data as StaffMember[]
}
