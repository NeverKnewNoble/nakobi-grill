"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp, ShoppingBag, Users, AlertTriangle,
  Clock, CheckCheck, Loader2, ArrowRight,
  Package, UserCheck,
} from "lucide-react"
import Link from "next/link"
import {
  fetchDashboardStats,
  fetchRecentOrders,
  fetchTopSellingItems,
  fetchStockAlerts,
  fetchActiveStaff,
  type DashboardStats,
  type RecentOrder,
  type TopItem,
  type StockAlertItem,
  type StaffMember,
} from "@/utils/dashboard"

// ── Status config ──────────────────────────────────────────────────────────
const STATUS = {
  pending:   { label: "Pending",   icon: Clock,      color: "text-amber-400",   bg: "bg-amber-500/10"   },
  preparing: { label: "Preparing", icon: Loader2,    color: "text-orange-400",  bg: "bg-orange-500/10"  },
  ready:     { label: "Ready",     icon: CheckCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
}

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })
}

const EMPTY_STATS: DashboardStats = {
  todayRevenue: 0, ordersToday: 0, dineInToday: 0, takeawayToday: 0,
  activeStaff: 0, totalStaff: 0, stockAlerts: 0, criticalCount: 0, lowCount: 0,
}

export default function DashboardPage() {
  const [stats,      setStats]      = useState<DashboardStats>(EMPTY_STATS)
  const [orders,     setOrders]     = useState<RecentOrder[]>([])
  const [topItems,   setTopItems]   = useState<TopItem[]>([])
  const [alerts,     setAlerts]     = useState<StockAlertItem[]>([])
  const [staff,      setStaff]      = useState<StaffMember[]>([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      fetchDashboardStats(),
      fetchRecentOrders(),
      fetchTopSellingItems(),
      fetchStockAlerts(),
      fetchActiveStaff(),
    ])
      .then(([s, o, t, a, st]) => {
        setStats(s)
        setOrders(o)
        setTopItems(t)
        setAlerts(a)
        setStaff(st)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const maxSold = topItems.length > 0 ? Math.max(...topItems.map((i) => i.sold)) : 1

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{todayLabel()}</p>
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
          <p className="text-2xl font-extrabold text-white">GHC {stats.todayRevenue.toFixed(2)}</p>
          <p className="mt-1 text-xs text-zinc-500">From {stats.ordersToday} orders today</p>
        </div>

        {/* Orders */}
        <div className="rounded-2xl border border-white/5 bg-zinc-900 px-5 py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Orders Today</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              <ShoppingBag className="h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{stats.ordersToday}</p>
          <p className="mt-1 text-xs text-zinc-500">{stats.dineInToday} dine in · {stats.takeawayToday} takeaway</p>
        </div>

        {/* Active staff */}
        <div className="rounded-2xl border border-white/5 bg-zinc-900 px-5 py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Active Staff</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              <Users className="h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{stats.activeStaff}</p>
          <p className="mt-1 text-xs text-zinc-500">of {stats.totalStaff} total staff</p>
        </div>

        {/* Stock alerts */}
        <div className={`rounded-2xl border px-5 py-5 ${stats.stockAlerts > 0 ? "border-red-500/20 bg-red-500/8" : "border-white/5 bg-zinc-900"}`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-widest ${stats.stockAlerts > 0 ? "text-red-400/70" : "text-zinc-500"}`}>Stock Alerts</p>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stats.stockAlerts > 0 ? "bg-red-500/15" : "bg-white/5"}`}>
              <AlertTriangle className={`h-3.5 w-3.5 ${stats.stockAlerts > 0 ? "text-red-400" : "text-zinc-400"}`} />
            </div>
          </div>
          <p className={`text-2xl font-extrabold ${stats.stockAlerts > 0 ? "text-red-400" : "text-white"}`}>{stats.stockAlerts}</p>
          <p className="mt-1 text-xs text-zinc-500">{stats.criticalCount} critical · {stats.lowCount} low</p>
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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-zinc-600">Loading orders…</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-zinc-600">No orders yet today.</td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const cfg = STATUS[order.status] ?? STATUS.pending
                    const Icon = cfg.icon
                    return (
                      <tr key={order.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white">{order.orderNumber}</td>
                        <td className="px-5 py-3.5 text-zinc-400 text-xs max-w-45 truncate">{order.itemsSummary}</td>
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
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Top selling items */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900 p-5">
            <div className="flex items-center justify-between mb-5">
              <p className="font-bold text-white text-sm">Top Selling Items</p>
              <span className="text-xs text-zinc-500">Last 7 days</span>
            </div>
            {loading ? (
              <p className="py-6 text-center text-xs text-zinc-600">Loading…</p>
            ) : topItems.length === 0 ? (
              <p className="py-6 text-center text-xs text-zinc-600">No sales data yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {topItems.map((item, i) => (
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
                    <p className="text-xs font-semibold text-orange-400 w-24 text-right shrink-0">
                      GHC {item.revenue.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
            {loading ? (
              <p className="py-10 text-center text-xs text-zinc-600">Loading…</p>
            ) : alerts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Package className="h-6 w-6 text-zinc-700" />
                <p className="text-xs text-zinc-600">All stock levels are healthy</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-white/5">
                {alerts.map((item) => (
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
            {loading ? (
              <p className="py-10 text-center text-xs text-zinc-600">Loading…</p>
            ) : staff.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Users className="h-6 w-6 text-zinc-700" />
                <p className="text-xs text-zinc-600">No active staff found</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-white/5">
                {staff.map((user) => {
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
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
