"use client"

import {
  TrendingUp, ShoppingBag, Users, AlertTriangle,
  Clock, CheckCheck, Loader2, ArrowRight,
  Package, UserCheck,
} from "lucide-react"
import Link from "next/link"
import { SEED_INVENTORY, SEED_RECENT_ORDERS, SEED_USERS } from "@/utils/sampleData"

// ── Derived stats ──────────────────────────────────────────────────────────
const todayRevenue  = SEED_RECENT_ORDERS.reduce((s, o) => s + o.total, 0) * 6.8
const ordersToday   = 34
const activeStaff   = SEED_USERS.filter((u) => u.status === "active").length
const stockAlerts   = SEED_INVENTORY.filter((i) => i.status !== "ok").length
const criticalItems = SEED_INVENTORY.filter((i) => i.status === "critical")
const lowItems      = SEED_INVENTORY.filter((i) => i.status === "low")
const alertItems    = [...criticalItems, ...lowItems]

// ── Status config ──────────────────────────────────────────────────────────
const STATUS = {
  pending:   { label: "Pending",   icon: Clock,      color: "text-amber-400",   bg: "bg-amber-500/10"   },
  preparing: { label: "Preparing", icon: Loader2,    color: "text-orange-400",  bg: "bg-orange-500/10"  },
  ready:     { label: "Ready",     icon: CheckCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
}

const TOP_ITEMS = [
  { name: "Beef Suya",         category: "Grills",       sold: 82, revenue: 984  },
  { name: "Jollof Rice",       category: "Rice & Sides", sold: 74, revenue: 592  },
  { name: "Chicken Suya",      category: "Grills",       sold: 68, revenue: 680  },
  { name: "Mixed Grill Plate", category: "Grills",       sold: 51, revenue: 1020 },
  { name: "Zobo (Hibiscus)",   category: "Drinks",       sold: 49, revenue: 147  },
]

const maxSold = Math.max(...TOP_ITEMS.map((i) => i.sold))

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Saturday, 7 March 2026 · Day Shift</p>
        </div>
        <Link
          href="/portal/orders"
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400 transition-colors"
        >
          <ShoppingBag className="h-4 w-4" />
          Take Order
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="rounded-2xl border border-orange-500/15 bg-orange-500/8 px-5 py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-400/70">Today's Revenue</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15">
              <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">GHC {todayRevenue.toFixed(0)}</p>
          <p className="mt-1 text-xs text-zinc-500">From {SEED_RECENT_ORDERS.length} sampled orders</p>
        </div>

        {/* Orders */}
        <div className="rounded-2xl border border-white/5 bg-zinc-900 px-5 py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Orders Today</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              <ShoppingBag className="h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{ordersToday}</p>
          <p className="mt-1 text-xs text-zinc-500">12 dine in · 22 takeaway</p>
        </div>

        {/* Active staff */}
        <div className="rounded-2xl border border-white/5 bg-zinc-900 px-5 py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Active Staff</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              <Users className="h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{activeStaff}</p>
          <p className="mt-1 text-xs text-zinc-500">of {SEED_USERS.length} total staff</p>
        </div>

        {/* Stock alerts */}
        <div className={`rounded-2xl border px-5 py-5 ${stockAlerts > 0 ? "border-red-500/20 bg-red-500/8" : "border-white/5 bg-zinc-900"}`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-widest ${stockAlerts > 0 ? "text-red-400/70" : "text-zinc-500"}`}>Stock Alerts</p>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stockAlerts > 0 ? "bg-red-500/15" : "bg-white/5"}`}>
              <AlertTriangle className={`h-3.5 w-3.5 ${stockAlerts > 0 ? "text-red-400" : "text-zinc-400"}`} />
            </div>
          </div>
          <p className={`text-2xl font-extrabold ${stockAlerts > 0 ? "text-red-400" : "text-white"}`}>{stockAlerts}</p>
          <p className="mt-1 text-xs text-zinc-500">{criticalItems.length} critical · {lowItems.length} low</p>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT col (spans 2) ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Recent Orders */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <p className="font-bold text-white text-sm">Recent Orders</p>
              <Link
                href="/portal/orders"
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Order</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Items</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Type</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Total</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {SEED_RECENT_ORDERS.map((order) => {
                  const cfg = STATUS[order.status]
                  const Icon = cfg.icon
                  const summary = order.items.map((i) => `${i.qty}× ${i.menuItem.name}`).join(", ")
                  return (
                    <tr key={order.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white">{order.orderNumber}</td>
                      <td className="px-5 py-3.5 text-zinc-400 text-xs max-w-45 truncate">{summary}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                          {order.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-white">GHC {order.total.toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
                          <Icon className={`h-3 w-3 ${order.status === "preparing" ? "animate-spin" : ""}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-500 text-xs">{order.createdAt}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Top selling items */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900 p-5">
            <div className="flex items-center justify-between mb-5">
              <p className="font-bold text-white text-sm">Top Selling Items</p>
              <span className="text-xs text-zinc-500">This week</span>
            </div>
            <div className="flex flex-col gap-4">
              {TOP_ITEMS.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="w-4 text-xs font-bold text-zinc-600 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                      <p className="text-xs text-zinc-400 shrink-0 ml-2">{item.sold} sold</p>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{ width: `${(item.sold / maxSold) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-orange-400 w-20 text-right shrink-0">
                    GHC {item.revenue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT col ── */}
        <div className="flex flex-col gap-6">

          {/* Stock Alerts */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <p className="font-bold text-white text-sm">Stock Alerts</p>
              <Link
                href="/portal/inventory"
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
              >
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {alertItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Package className="h-6 w-6 text-zinc-700" />
                <p className="text-xs text-zinc-600">All stock levels are healthy</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-white/5">
                {alertItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-5 py-3.5 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.ingredient}</p>
                      <p className="text-xs text-zinc-500">{item.current_stock} {item.unit} remaining</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      item.status === "critical"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Staff on duty */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <p className="font-bold text-white text-sm">Staff on Duty</p>
              <Link
                href="/portal/users"
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
              >
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex flex-col divide-y divide-white/5">
              {SEED_USERS.filter((u) => u.status === "active").map((user) => {
                const initials = user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                return (
                  <div key={user.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs font-bold text-orange-400">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
                      <p className="text-xs text-zinc-500">{user.role} · {user.shift_type}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <UserCheck className="h-3 w-3 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-semibold">Active</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
