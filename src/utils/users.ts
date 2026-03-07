import type { User, UserRole, CreateUserPayload, EditUserPayload } from "@/types/users"
import { isValidEmail } from "@/utils/generalUtils"

export const EMPTY_FORM: CreateUserPayload = {
  full_name: "",
  email: "",
  password: "",
  role: "Order Taker",
  shift_type: "Day Shift",
  status: "active",
}

export const roleColor: Record<UserRole, string> = {
  Admin: "bg-orange-500/15 text-orange-400",
  "Inventory Manager": "bg-sky-500/15 text-sky-400",
  "Order Taker": "bg-emerald-500/15 text-emerald-400",
}

export function validateUserForm(
  form: CreateUserPayload
): Partial<Record<keyof CreateUserPayload, string>> {
  const errors: Partial<Record<keyof CreateUserPayload, string>> = {}
  if (!form.full_name.trim()) errors.full_name = "Full name is required"
  if (!form.email.trim()) errors.email = "Email is required"
  else if (!isValidEmail(form.email)) errors.email = "Enter a valid email"
  if (!form.password) errors.password = "Password is required"
  else if (form.password.length < 6) errors.password = "Minimum 6 characters"
  return errors
}

export function buildNewUser(form: CreateUserPayload): User {
  return {
    id: crypto.randomUUID(),
    ...form,
    created_at: new Date().toISOString().split("T")[0],
  }
}

export function filterUsers(users: User[], search: string): User[] {
  const q = search.toLowerCase()
  return users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
  )
}

export function toggleUserStatus(users: User[], id: string): User[] {
  return users.map((u) =>
    u.id === id
      ? { ...u, status: u.status === "active" ? "inactive" : "active" }
      : u
  )
}

export const EMPTY_EDIT_FORM: EditUserPayload = {
  full_name: "",
  email: "",
  role: "Order Taker",
  shift_type: "Day Shift",
  status: "active",
}

export function userToEditForm(user: User): EditUserPayload {
  return {
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    shift_type: user.shift_type,
    status: user.status,
  }
}

export function validateEditForm(
  form: EditUserPayload
): Partial<Record<keyof EditUserPayload, string>> {
  const errors: Partial<Record<keyof EditUserPayload, string>> = {}
  if (!form.full_name.trim()) errors.full_name = "Full name is required"
  if (!form.email.trim()) errors.email = "Email is required"
  else if (!isValidEmail(form.email)) errors.email = "Enter a valid email"
  return errors
}

export function updateUser(users: User[], id: string, payload: EditUserPayload): User[] {
  return users.map((u) => (u.id === id ? { ...u, ...payload } : u))
}

export function deleteUser(users: User[], id: string): User[] {
  return users.filter((u) => u.id !== id)
}



// ********** SUPABASE FUNCTIONS ***************
