"use client"

import { useState, useEffect } from "react"
import {
  ShoppingCart, Trash2, Plus, Minus, ChevronRight, X,
  ClipboardList,
} from "lucide-react"
import { toast } from "sonner"
import type { MenuItem, Order, OrderItem, OrderType } from "@/types/orders"
import {
  addToOrder, removeFromOrder, updateQty, calcTotal,
  filterMenu, cycleStatus,
  fetchOrders, placeOrderSupabase, updateOrderStatusSupabase,
} from "@/utils/orders"
import { TakeOrderModalProps, STATUS_CONFIG, getCategoryIcon } from "@/helpers/orders_ui"
import { useMenu } from "@/contexts/menu_context"




// ****************** Take Order Modal *************************************
function TakeOrderModal({ onClose, onPlace }: TakeOrderModalProps) {
  const { categories, menuItems } = useMenu()
  const allCategories = ["All", ...categories]

  const [activeCategory, setActiveCategory] = useState("All")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [orderType, setOrderType] = useState<OrderType>("Dine In")
  const [placing, setPlacing] = useState(false)

  const visibleMenu = filterMenu(menuItems, activeCategory)
  const total = calcTotal(orderItems)

  function handleAddItem(item: MenuItem) {
    setOrderItems((prev) => addToOrder(prev, item))
  }

  function handleQtyChange(id: string, qty: number) {
    setOrderItems((prev) => updateQty(prev, id, qty))
  }

  function handleRemove(id: string) {
    setOrderItems((prev) => removeFromOrder(prev, id))
  }

  async function handlePlace() {
    if (orderItems.length === 0 || placing) return
    setPlacing(true)
    try {
      await onPlace(orderItems, orderType)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 flex flex-col sm:flex-row w-full max-w-5xl h-[92vh] sm:h-[85vh] rounded-2xl border border-white/8 bg-zinc-900 shadow-2xl overflow-hidden">

        {/* ── LEFT: Menu ── */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0 border-b sm:border-b-0 sm:border-r border-white/5">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 shrink-0">
            <div>
              <p className="text-base font-bold text-white">Take Order</p>
              <p className="text-xs text-zinc-500 mt-0.5">Select items to add to the order</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Order type toggle */}
              <div className="flex rounded-xl border border-white/10 bg-zinc-800 p-1 gap-1">
                {(["Dine In", "Takeaway"] as OrderType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={`rounded-lg px-3 sm:px-4 py-1.5 text-xs font-semibold transition-colors ${
                      orderType === t ? "bg-orange-500 text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/5 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 overflow-x-auto shrink-0">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-orange-500 text-white"
                    : "border border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                }`}
              >
                {getCategoryIcon(cat)}
                {cat}
              </button>
            ))}
          </div>

          {/* Menu grid */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {visibleMenu.map((item) => {
                const inOrder = orderItems.find((o) => o.menuItem.id === item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                    className={`relative text-left rounded-2xl border p-3 sm:p-4 transition-all ${
                      inOrder
                        ? "border-orange-500/40 bg-orange-500/8"
                        : "border-white/5 bg-zinc-800/50 hover:border-white/10 hover:bg-zinc-800"
                    }`}
                  >
                    {inOrder && (
                      <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                        {inOrder.qty}
                      </span>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">{item.category}</p>
                    <p className="font-semibold text-white leading-tight text-sm">{item.name}</p>
                    <p className="mt-1 text-xs text-zinc-500 leading-snug line-clamp-2 hidden sm:block">{item.description}</p>
                    <p className="mt-2 sm:mt-3 text-base font-extrabold text-orange-400">GHC {item.price.toFixed(2)}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Current order ── */}
        <div className="flex flex-col w-full sm:w-72 xl:w-80 shrink-0 max-h-[40vh] sm:max-h-none">
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-5 border-b border-white/5 shrink-0">
            <ShoppingCart className="h-4 w-4 text-orange-400" />
            <span className="font-bold text-white text-sm">Current Order</span>
            {orderItems.length > 0 && (
              <span className="ml-auto text-xs text-zinc-500">{orderType}</span>
            )}
          </div>

          {orderItems.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center px-6 py-4">
              <ShoppingCart className="h-8 w-8 text-zinc-700" />
              <p className="text-xs text-zinc-600">No items yet.<br />Tap a meal to add it.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 sm:py-4 flex flex-col gap-2">
              {orderItems.map(({ menuItem, qty }) => (
                <div key={menuItem.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{menuItem.name}</p>
                    <p className="text-xs text-zinc-500">GHC {(menuItem.price * qty).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQtyChange(menuItem.id, qty - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-white">{qty}</span>
                    <button
                      onClick={() => handleQtyChange(menuItem.id, qty + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleRemove(menuItem.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-600 hover:bg-red-500/10 hover:text-red-400 transition-colors ml-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-white/5 px-4 sm:px-5 py-4 sm:py-5 flex flex-col gap-3 sm:gap-4 shrink-0">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-zinc-400">Total</span>
              <span className="text-xl font-extrabold text-white">GHC {total.toFixed(2)}</span>
            </div>
            <button
              onClick={handlePlace}
              disabled={orderItems.length === 0 || placing}
              className="w-full rounded-full bg-orange-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {placing ? "Placing…" : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Orders Page ────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function refresh() {
    const data = await fetchOrders()
    setOrders(data)
  }

  async function handlePlaceOrder(items: OrderItem[], type: OrderType) {
    const toastId = toast.loading("Placing order…")
    try {
      const order = await placeOrderSupabase(items, type)
      setOrders((prev) => [order, ...prev])
      setModalOpen(false)
      toast.success(`Order ${order.orderNumber} placed!`, { id: toastId })
    } catch {
      toast.error("Failed to place order. Please try again.", { id: toastId })
    }
  }

  async function handleAdvanceStatus(order: Order) {
    const next = cycleStatus(order.status)
    // Optimistic update
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: next } : o))
    try {
      await updateOrderStatusSupabase(order.id, next)
    } catch {
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: order.status } : o))
      toast.error("Failed to update order status.")
    }
  }

  async function handleCancel(order: Order) {
    // Optimistic — remove from list immediately
    setOrders((prev) => prev.filter((o) => o.id !== order.id))
    try {
      await updateOrderStatusSupabase(order.id, "cancelled")
      toast.success(`Order ${order.orderNumber} cancelled.`)
    } catch {
      await refresh()
      toast.error("Failed to cancel order.")
    }
  }

  const activeCount = orders.filter((o) => o.status !== "ready").length

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {loading
              ? "Loading orders…"
              : orders.length === 0
              ? "No active orders"
              : `${activeCount} active · ${orders.length} total`}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400 transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Take New Order
        </button>
      </div>

      {/* Empty / loading state */}
      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 py-24">
          <ClipboardList className="h-10 w-10 text-zinc-700" />
          <div className="text-center">
            <p className="text-sm font-semibold text-zinc-400">No orders yet</p>
            <p className="text-xs text-zinc-600 mt-1">Press "Take New Order" to get started</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white hover:bg-orange-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Take New Order
          </button>
        </div>
      )}

      {/* Orders grid */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status]
            const Icon = cfg.icon
            return (
              <div
                key={order.id}
                className={`flex flex-col rounded-2xl border ${cfg.border} ${cfg.bg} p-5 gap-4`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-extrabold text-white">{order.orderNumber}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                        {order.type}
                      </span>
                      <span className="text-xs text-zinc-600">{order.createdAt}</span>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 rounded-full border border-current/20 px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </div>
                </div>

                {/* Items list */}
                <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                  {order.items.map(({ menuItem, qty }) => (
                    <div key={menuItem.id} className="flex justify-between text-xs">
                      <span className="text-zinc-400">{qty}× {menuItem.name}</span>
                      <span className="text-zinc-500">GHC {(menuItem.price * qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-baseline border-t border-white/5 pt-3">
                  <span className="text-xs text-zinc-500">Total</span>
                  <span className="text-base font-extrabold text-white">GHC {order.total.toFixed(2)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleCancel(order)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-red-500/20 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                  {order.status !== "ready" && (
                    <button
                      onClick={() => handleAdvanceStatus(order)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 py-2 text-xs font-semibold text-white transition-colors"
                    >
                      Mark Ready
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <TakeOrderModal
          onClose={() => setModalOpen(false)}
          onPlace={handlePlaceOrder}
        />
      )}
    </div>
  )
}
