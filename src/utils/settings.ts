import { supabase } from "@/lib/supabase/client"
import type { User } from "@/types/users"
import type { MenuItem, AddMenuItemPayload } from "@/types/orders"

// ── Profile ────────────────────────────────────────────────────────────────

/** Fetch the currently logged-in user's profile row. */
export async function fetchCurrentProfile(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error) return null
  return data as User
}

// ── Categories ─────────────────────────────────────────────────────────────

/** Fetch all menu categories ordered by sort_order. Returns names only. */
export async function fetchCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("menu_categories")
    .select("name")
    .order("sort_order", { ascending: true })

  if (error) throw error
  return (data ?? []).map((r: { name: string }) => r.name)
}

/** Insert a new category. Throws on duplicate name (unique constraint). */
export async function addCategorySupabase(name: string): Promise<void> {
  const { count } = await supabase
    .from("menu_categories")
    .select("*", { count: "exact", head: true })

  const { error } = await supabase
    .from("menu_categories")
    .insert({ name, sort_order: (count ?? 0) + 1 })

  if (error) throw error
}

/**
 * Delete a category and all its menu items.
 * menu_items.category_id is ON DELETE RESTRICT so we delete items first.
 */
export async function removeCategorySupabase(name: string): Promise<void> {
  const { data: cat, error: catErr } = await supabase
    .from("menu_categories")
    .select("id")
    .eq("name", name)
    .single()

  if (catErr || !cat) throw new Error("Category not found")

  // Delete all menu items in this category first (RESTRICT constraint)
  const { error: itemsErr } = await supabase
    .from("menu_items")
    .delete()
    .eq("category_id", cat.id)

  if (itemsErr) throw itemsErr

  const { error: catDeleteErr } = await supabase
    .from("menu_categories")
    .delete()
    .eq("id", cat.id)

  if (catDeleteErr) throw catDeleteErr
}

// ── Menu Items ─────────────────────────────────────────────────────────────

/** Fetch all available menu items, joining category name. */
export async function fetchMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select(`
      id,
      name,
      description,
      price,
      menu_categories!inner ( name )
    `)
    .eq("is_available", true)
    .order("created_at", { ascending: true })

  if (error) throw error

  return (data ?? []).map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    price: item.price,
    category: item.menu_categories.name,
  }))
}

/** Insert a new menu item. Looks up category_id from name. */
export async function addMenuItemSupabase(payload: AddMenuItemPayload): Promise<void> {
  const { data: cat, error: catErr } = await supabase
    .from("menu_categories")
    .select("id")
    .eq("name", payload.category)
    .single()

  if (catErr || !cat) throw new Error("Category not found")

  const { error } = await supabase
    .from("menu_items")
    .insert({
      category_id: cat.id,
      name: payload.name.trim(),
      description: payload.description.trim(),
      price: parseFloat(payload.price),
    })

  if (error) throw error
}

/** Hard-delete a menu item by id. */
export async function removeMenuItemSupabase(id: string): Promise<void> {
  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", id)

  if (error) throw error
}
