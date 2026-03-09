"use client"

import { useState, useEffect } from "react"
import {
  User, UtensilsCrossed, Plus, Trash2, Tag, Mail,
  Shield, Clock4, CheckCircle, XCircle,
} from "lucide-react"
import { Button } from "@heroui/react"
import type { AddMenuItemPayload } from "@/types/orders"
import type { User as UserProfile } from "@/types/users"
import { useMenu } from "@/contexts/menu_context"
import { getCategoryIcon } from "@/helpers/orders_ui"
import { EMPTY_MEAL, Field } from "@/helpers/settings_ui"
import { fetchCurrentProfile } from "@/utils/settings"



// *************** Settings page ***************
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "menu">("profile")
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    fetchCurrentProfile()
      .then((p) => setRole(p?.role ?? null))
      .catch(console.error)
  }, [])

  const isAdmin = role === "Admin"

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage your profile and restaurant menu</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/5 bg-zinc-900 p-1 w-fit">
        <button
          onClick={() => setActiveTab("profile")}
          className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
            activeTab === "profile" ? "bg-orange-500 text-white" : "text-zinc-400 hover:text-white"
          }`}
        >
          <User className="h-4 w-4" />
          User Info
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab("menu")}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
              activeTab === "menu" ? "bg-orange-500 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
            Menu
          </button>
        )}
      </div>

      {activeTab === "profile" || !isAdmin ? <ProfileTab /> : <MenuTab />}
    </div>
  )
}

// ── Profile Tab ───────────────────────────────────────────────────────────
function ProfileTab() {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetchCurrentProfile().then(setProfile).catch(console.error)
  }, [])

  const initials = profile
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "…"

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {/* Avatar + name card */}
      <div className="flex items-center gap-5 rounded-2xl border border-white/5 bg-zinc-900 px-6 py-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-500/15 text-xl font-extrabold text-orange-400">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-white">{profile?.full_name ?? "Loading…"}</p>
          <p className="text-sm text-zinc-500">{profile?.email ?? ""}</p>
        </div>
      </div>

      {/* Info rows */}
      {profile && (
        <div className="rounded-2xl border border-white/5 bg-zinc-900 overflow-hidden divide-y divide-white/5">
          <InfoRow icon={Mail} label="Email" value={profile.email} />
          <InfoRow icon={Shield} label="Role" value={profile.role} valueColor="text-orange-400" />
          <InfoRow icon={Clock4} label="Shift" value={profile.shift_type} />
          <InfoRow
            icon={profile.status === "active" ? CheckCircle : XCircle}
            label="Status"
            value={profile.status === "active" ? "Active" : "Inactive"}
            valueColor={profile.status === "active" ? "text-emerald-400" : "text-red-400"}
          />
          <InfoRow icon={User} label="Member since" value={profile.created_at} />
        </div>
      )}
    </div>
  )
}

function InfoRow({
  icon: Icon, label, value, valueColor = "text-white",
}: { icon: React.ElementType; label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
        <Icon className="h-3.5 w-3.5 text-zinc-500" />
      </div>
      <span className="flex-1 text-sm text-zinc-400">{label}</span>
      <span className={`text-sm font-semibold ${valueColor}`}>{value}</span>
    </div>
  )
}

// ── Menu Tab ──────────────────────────────────────────────────────────────
function MenuTab() {
  const { categories, menuItems, addCategory, removeCategory, addMenuItem, removeMenuItem } = useMenu()

  // Category form
  const [newCategory, setNewCategory] = useState("")
  const [catError, setCatError] = useState("")

  // Meal form
  const [showMealForm, setShowMealForm] = useState(false)
  const [mealForm, setMealForm] = useState<AddMenuItemPayload>({ ...EMPTY_MEAL, category: categories[0] ?? "" })
  const [mealErrors, setMealErrors] = useState<Partial<Record<keyof AddMenuItemPayload, string>>>({})

  // Meal filter
  const [filterCat, setFilterCat] = useState("All")
  const visibleMeals = filterCat === "All" ? menuItems : menuItems.filter((m) => m.category === filterCat)

  function handleAddCategory() {
    const trimmed = newCategory.trim()
    if (!trimmed) { setCatError("Enter a category name"); return }
    if (categories.includes(trimmed)) { setCatError("Category already exists"); return }
    addCategory(trimmed)
    setNewCategory("")
    setCatError("")
  }

  function handleAddMeal() {
    const errs: Partial<Record<keyof AddMenuItemPayload, string>> = {}
    if (!mealForm.name.trim()) errs.name = "Name is required"
    if (!mealForm.price || isNaN(parseFloat(mealForm.price)) || parseFloat(mealForm.price) <= 0)
      errs.price = "Enter a valid price"
    if (!mealForm.category) errs.category = "Select a category"
    if (Object.keys(errs).length > 0) { setMealErrors(errs); return }
    addMenuItem(mealForm)
    setMealForm({ ...EMPTY_MEAL, category: categories[0] ?? "" })
    setMealErrors({})
    setShowMealForm(false)
  }

  const inputClass = (err?: string) =>
    `h-10 w-full rounded-md border bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-[border,box-shadow] ${
      err ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          : "border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
    }`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

      {/* ── LEFT: Categories ── */}
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-white/5 bg-zinc-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="font-bold text-white text-sm">Categories</p>
            <p className="text-xs text-zinc-500 mt-0.5">Meal categories shown in the order modal</p>
          </div>

          {/* Add category input */}
          <div className="px-5 py-4 border-b border-white/5 flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New category name..."
                value={newCategory}
                onChange={(e) => { setNewCategory(e.target.value); setCatError("") }}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                className="h-9 flex-1 rounded-lg border border-white/10 bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-[border,box-shadow]"
              />
              <button
                onClick={handleAddCategory}
                className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-400 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
            {catError && <p className="text-xs text-red-400">{catError}</p>}
          </div>

          {/* Category list */}
          <div className="divide-y divide-white/5">
            {categories.length === 0 ? (
              <p className="px-5 py-8 text-center text-xs text-zinc-600">No categories yet.</p>
            ) : (
              categories.map((cat) => {
                const count = menuItems.filter((m) => m.category === cat).length
                return (
                  <div key={cat} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                      {getCategoryIcon(cat)}
                    </div>
                    <span className="flex-1 text-sm font-medium text-white">{cat}</span>
                    <span className="text-xs text-zinc-500">{count} meal{count !== 1 ? "s" : ""}</span>
                    <button
                      onClick={() => removeCategory(cat)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      title={count > 0 ? "Deleting category will also remove its meals" : "Delete category"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Meals ── */}
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-white/5 bg-zinc-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <p className="font-bold text-white text-sm">Meals</p>
              <p className="text-xs text-zinc-500 mt-0.5">{menuItems.length} items across all categories</p>
            </div>
            <button
              onClick={() => { setShowMealForm((v) => !v); setMealErrors({}) }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-400 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Meal
            </button>
          </div>

          {/* Add meal form */}
          {showMealForm && (
            <div className="border-b border-white/5 px-5 py-5 flex flex-col gap-4 bg-white/2">
              <Field label="Meal Name" error={mealErrors.name}>
                <input
                  type="text"
                  placeholder="e.g. Beef Suya"
                  value={mealForm.name}
                  onChange={(e) => setMealForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass(mealErrors.name)}
                />
              </Field>

              <Field label="Description">
                <input
                  type="text"
                  placeholder="Short description..."
                  value={mealForm.description}
                  onChange={(e) => setMealForm((f) => ({ ...f, description: e.target.value }))}
                  className={inputClass()}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (GHC)" error={mealErrors.price}>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 12.00"
                    value={mealForm.price}
                    onChange={(e) => setMealForm((f) => ({ ...f, price: e.target.value }))}
                    className={inputClass(mealErrors.price)}
                  />
                </Field>
                <Field label="Category" error={mealErrors.category}>
                  <select
                    value={mealForm.category}
                    onChange={(e) => setMealForm((f) => ({ ...f, category: e.target.value }))}
                    className={`h-10 w-full rounded-md border bg-zinc-800 px-3 text-sm text-white outline-none transition-[border,box-shadow] ${
                      mealErrors.category ? "border-red-500/50" : "border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowMealForm(false); setMealErrors({}) }}
                  className="flex-1 rounded-full border border-white/10 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  onPress={handleAddMeal}
                  className="flex-1 rounded-full bg-orange-500 py-2 text-xs font-semibold text-white hover:bg-orange-400 transition-colors"
                >
                  Add Meal
                </Button>
              </div>
            </div>
          )}

          {/* Category filter tabs */}
          <div className="flex gap-2 px-5 py-3 border-b border-white/5 overflow-x-auto">
            {["All", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterCat === cat
                    ? "bg-orange-500 text-white"
                    : "border border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Meals list */}
          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
            {visibleMeals.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10">
                <Tag className="h-6 w-6 text-zinc-700" />
                <p className="text-xs text-zinc-600">No meals in this category.</p>
              </div>
            ) : (
              visibleMeals.map((meal) => (
                <div key={meal.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{meal.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-zinc-500 truncate">{meal.description || "—"}</span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                    {meal.category}
                  </span>
                  <span className="shrink-0 text-sm font-bold text-orange-400">GHC {meal.price.toFixed(2)}</span>
                  <button
                    onClick={() => removeMenuItem(meal.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-600 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
