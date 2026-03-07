"use client"

import { useState } from "react"
import { Search, PackagePlus, PackageMinus, Package, SearchX, Plus, Trash2 } from "lucide-react"
import type { InventoryItem, AddInventoryPayload } from "@/types/inventory"
import { SEED_INVENTORY } from "@/utils/sampleData"
import { filterInventory, restockItem, stockOutItem, deleteInventoryItem, EMPTY_INVENTORY_FORM, validateInventoryForm, buildNewInventoryItem } from "@/utils/inventory"
import RestockModal from "@/components/_ui/restock_modal"
import StockOutModal from "@/components/_ui/stock_out_modal"
import AddInventoryModal from "@/components/_ui/add_inventory_modal"
import DeleteAlert from "@/components/_ui/delete_alert"
import { StatusBadge } from "@/helpers/inventory_ui"
import EmptyState from "@/components/_ui/empty_state"




// ************* PAGE *********************
export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(SEED_INVENTORY)
  const [search, setSearch] = useState("")
  const [restockTarget, setRestockTarget] = useState<InventoryItem | null>(null)
  const [stockOutTarget, setStockOutTarget] = useState<InventoryItem | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState<AddInventoryPayload>(EMPTY_INVENTORY_FORM)
  const [addErrors, setAddErrors] = useState<Partial<Record<keyof AddInventoryPayload, string>>>({})
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null)

  const filtered = filterInventory(items, search)

  const lowCount = items.filter((i) => i.status === "low").length
  const criticalCount = items.filter((i) => i.status === "critical").length

  function handleRestock(id: string, qty: number) {
    setItems((prev) => restockItem(prev, id, qty))
    setRestockTarget(null)
  }

  function handleStockOut(id: string, qty: number) {
    setItems((prev) => stockOutItem(prev, id, qty))
    setStockOutTarget(null)
  }

  function handleAddItem() {
    const errs = validateInventoryForm(addForm)
    if (Object.keys(errs).length > 0) { setAddErrors(errs); return }
    setItems((prev) => [...prev, buildNewInventoryItem(addForm, prev.length)])
    setAddForm(EMPTY_INVENTORY_FORM)
    setAddErrors({})
    setAddOpen(false)
  }

  function handleAddClose() {
    setAddForm(EMPTY_INVENTORY_FORM)
    setAddErrors({})
    setAddOpen(false)
  }

  function handleConfirmDelete() {
    setItems((prev) => deleteInventoryItem(prev, deleteTarget!.id))
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-sm text-zinc-500">Track and manage ingredient stock levels</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/5 bg-zinc-900 px-5 py-4">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Total Items</p>
          <p className="mt-1 text-3xl font-extrabold text-white">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 px-5 py-4">
          <p className="text-xs uppercase tracking-widest text-amber-500/70">Low Stock</p>
          <p className="mt-1 text-3xl font-extrabold text-amber-400">{lowCount}</p>
        </div>
        <div className="rounded-2xl border border-red-500/10 bg-red-500/5 px-5 py-4">
          <p className="text-xs uppercase tracking-widest text-red-500/70">Critical</p>
          <p className="mt-1 text-3xl font-extrabold text-red-400">{criticalCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-white/10 bg-zinc-900 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-[border,box-shadow]"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">Ingredient</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">Current Stock</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">Threshold</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">Weekly Usage</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">Status</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">Last Updated</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-zinc-500 w-px whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon={search ? SearchX : Package}
                    title={search ? "No ingredients found" : "No inventory items"}
                    description={
                      search
                        ? `No ingredients match "${search}". Try a different search term.`
                        : "Your inventory is empty. Add ingredients to get started."
                    }
                    action={
                      !search ? (
                        <button
                          onClick={() => setAddOpen(true)}
                          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-400 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Item
                        </button>
                      ) : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4 font-medium text-white">{item.ingredient}</td>
                  <td className="px-5 py-4 text-zinc-300">
                    {item.current_stock}{" "}
                    <span className="text-xs text-zinc-500">{item.unit}</span>
                  </td>
                  <td className="px-5 py-4 text-zinc-400">
                    {item.threshold}{" "}
                    <span className="text-xs text-zinc-500">{item.unit}</span>
                  </td>
                  <td className="px-5 py-4 text-zinc-400">
                    {item.weekly_usage}{" "}
                    <span className="text-xs text-zinc-500">{item.unit}</span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-4 text-zinc-500 text-xs">{item.last_updated}</td>
                  <td className="px-5 py-4 w-px whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRestockTarget(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <PackagePlus className="h-3.5 w-3.5" />
                        Restock
                      </button>
                      <button
                        onClick={() => setStockOutTarget(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-400 hover:bg-orange-500/20 transition-colors"
                      >
                        <PackageMinus className="h-3.5 w-3.5" />
                        Stock Out
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddInventoryModal
        open={addOpen}
        form={addForm}
        errors={addErrors}
        onClose={handleAddClose}
        onAdd={handleAddItem}
        onFormChange={(patch) => setAddForm((f) => ({ ...f, ...patch }))}
      />
      <DeleteAlert
        open={deleteTarget !== null}
        title="Delete Ingredient"
        description={`Are you sure you want to remove "${deleteTarget?.ingredient ?? ""}" from inventory? This cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
      <RestockModal
        item={restockTarget}
        onClose={() => setRestockTarget(null)}
        onConfirm={handleRestock}
      />
      <StockOutModal
        item={stockOutTarget}
        onClose={() => setStockOutTarget(null)}
        onConfirm={handleStockOut}
      />
    </div>
  )
}
