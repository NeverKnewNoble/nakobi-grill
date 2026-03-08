"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import type { CreateUserPayload } from "@/types/users"

/**
 * Create a new staff account.
 * Uses the service-role admin client so we can call auth.admin.createUser.
 * The handle_new_user trigger auto-creates the profile row with full_name + email.
 * We then update role, shift_type, and status on that profile immediately.
 */
export async function createUserAction(
  form: CreateUserPayload
): Promise<{ error?: string }> {
  const admin = createAdminClient()

  // 1. Create the auth user (auto-confirms email so they can log in right away)
  const { data, error } = await admin.auth.admin.createUser({
    email: form.email,
    password: form.password,
    user_metadata: { full_name: form.full_name },
    email_confirm: true,
  })
  if (error) return { error: error.message }

  // 2. Update the auto-created profile with role, shift_type, status
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: form.full_name,
      role: form.role,
      shift_type: form.shift_type,
      status: form.status,
    })
    .eq("id", data.user.id)

  if (profileError) return { error: profileError.message }
  return {}
}

/**
 * Permanently delete a staff account.
 * Deleting the auth user cascades to the profiles row via ON DELETE CASCADE.
 */
export async function deleteUserAction(
  id: string
): Promise<{ error?: string }> {
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return { error: error.message }
  return {}
}
