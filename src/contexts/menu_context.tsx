"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { MenuItem, AddMenuItemPayload } from "@/types/orders"
import {
  fetchCategories,
  fetchMenuItems,
  addCategorySupabase,
  removeCategorySupabase,
  addMenuItemSupabase,
  removeMenuItemSupabase,
} from "@/utils/settings"

interface MenuContextValue {
  categories: string[]
  menuItems: MenuItem[]
  addCategory: (name: string) => Promise<void>
  removeCategory: (name: string) => Promise<void>
  addMenuItem: (payload: AddMenuItemPayload) => Promise<void>
  removeMenuItem: (id: string) => Promise<void>
}

const MenuContext = createContext<MenuContextValue | null>(null)

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<string[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error)
    fetchMenuItems().then(setMenuItems).catch(console.error)
  }, [])

  async function refreshAll() {
    const [cats, items] = await Promise.all([fetchCategories(), fetchMenuItems()])
    setCategories(cats)
    setMenuItems(items)
  }

  async function addCategory(name: string) {
    const trimmed = name.trim()
    if (!trimmed || categories.includes(trimmed)) return
    await addCategorySupabase(trimmed)
    setCategories((prev) => [...prev, trimmed])
  }

  async function removeCategory(name: string) {
    // Optimistic update
    setCategories((prev) => prev.filter((c) => c !== name))
    setMenuItems((prev) => prev.filter((i) => i.category !== name))
    try {
      await removeCategorySupabase(name)
    } catch {
      // Revert on failure
      await refreshAll()
    }
  }

  async function addMenuItem(payload: AddMenuItemPayload) {
    await addMenuItemSupabase(payload)
    const items = await fetchMenuItems()
    setMenuItems(items)
  }

  async function removeMenuItem(id: string) {
    // Optimistic update
    setMenuItems((prev) => prev.filter((i) => i.id !== id))
    try {
      await removeMenuItemSupabase(id)
    } catch {
      // Revert on failure
      const items = await fetchMenuItems()
      setMenuItems(items)
    }
  }

  return (
    <MenuContext.Provider value={{ categories, menuItems, addCategory, removeCategory, addMenuItem, removeMenuItem }}>
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu() {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error("useMenu must be used within MenuProvider")
  return ctx
}
