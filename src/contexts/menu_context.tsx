"use client"

import { createContext, useContext, useState } from "react"
import type { MenuItem, AddMenuItemPayload } from "@/types/orders"
import { SEED_MENU } from "@/utils/sampleData"

export const DEFAULT_CATEGORIES = ["Grills", "Rice & Sides", "Snacks", "Drinks"]

interface MenuContextValue {
  categories: string[]
  menuItems: MenuItem[]
  addCategory: (name: string) => void
  removeCategory: (name: string) => void
  addMenuItem: (payload: AddMenuItemPayload) => void
  removeMenuItem: (id: string) => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(SEED_MENU)

  function addCategory(name: string) {
    const trimmed = name.trim()
    if (!trimmed || categories.includes(trimmed)) return
    setCategories((prev) => [...prev, trimmed])
  }

  function removeCategory(name: string) {
    setCategories((prev) => prev.filter((c) => c !== name))
    setMenuItems((prev) => prev.filter((i) => i.category !== name))
  }

  function addMenuItem(payload: AddMenuItemPayload) {
    const item: MenuItem = {
      id: crypto.randomUUID(),
      name: payload.name.trim(),
      description: payload.description.trim(),
      price: parseFloat(payload.price),
      category: payload.category,
    }
    setMenuItems((prev) => [...prev, item])
  }

  function removeMenuItem(id: string) {
    setMenuItems((prev) => prev.filter((i) => i.id !== id))
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
