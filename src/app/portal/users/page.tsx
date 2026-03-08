"use client"

import { useState, useEffect, useRef } from "react"
import { UserPlus, Search, MoreHorizontal, Users, SearchX, Pencil, Trash2 } from "lucide-react"
import { Button } from "@heroui/react"
import type { User, UserRole, UserStatus, CreateUserPayload, EditUserPayload } from "@/types/users"
import CreateUserModal from "@/components/_ui/create_user_modal"
import EditUserModal from "@/components/_ui/edit_user_modal"
import DeleteAlert from "@/components/_ui/delete_alert"
import EmptyState from "@/components/_ui/empty_state"
import {
  EMPTY_FORM,
  EMPTY_EDIT_FORM,
  roleColor,
  validateUserForm,
  validateEditForm,
  filterUsers,
  toggleUserStatus,
  userToEditForm,
  fetchUsers,
  updateUserSupabase,
  toggleUserStatusSupabase,
} from "@/utils/users"
import { createUserAction, deleteUserAction } from "@/actions/users"
import { roleIcon, Avatar } from "@/helpers/users_ui"
import { toast } from "sonner"



// ── Row action menu ───────────────────────────────────────────────────────
function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-white/10 bg-zinc-800 py-1 shadow-xl">
          <button
            onClick={() => { setOpen(false); onEdit() }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={() => { setOpen(false); onDelete() }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ***************. Page ******************
export default function UsersPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [form, setForm] = useState<CreateUserPayload>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserPayload, string>>>({})

  // Edit
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<EditUserPayload>(EMPTY_EDIT_FORM)
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof EditUserPayload, string>>>({})

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function refresh() {
    const data = await fetchUsers()
    setUsers(data)
  }

  const filtered = filterUsers(users, search)

  async function handleCreate() {
    const next = validateUserForm(form)
    if (Object.keys(next).length > 0) { setErrors(next); return }
    const toastId = toast.loading("Creating user…")
    const result = await createUserAction(form)
    if (result.error) {
      setErrors({ email: result.error })
      toast.error(result.error, { id: toastId })
      return
    }
    await refresh()
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(false)
    toast.success("User created successfully!", { id: toastId })
  }

  function handleClose() {
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(false)
  }

  async function handleToggleStatus(id: string, currentStatus: UserStatus) {
    setUsers((prev) => toggleUserStatus(prev, id))
    try {
      await toggleUserStatusSupabase(id, currentStatus)
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      toast.success(`User set to ${newStatus}`)
    } catch {
      setUsers((prev) => toggleUserStatus(prev, id))
      toast.error("Failed to update status. Please try again.")
    }
  }

  function handleOpenEdit(user: User) {
    setEditTarget(user)
    setEditForm(userToEditForm(user))
    setEditErrors({})
  }

  async function handleSaveEdit() {
    const errs = validateEditForm(editForm)
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return }
    const toastId = toast.loading("Saving changes…")
    try {
      await updateUserSupabase(editTarget!.id, editForm)
      await refresh()
      setEditTarget(null)
      toast.success("User updated successfully!", { id: toastId })
    } catch {
      setEditErrors({ full_name: "Failed to save. Please try again." })
      toast.error("Failed to save changes.", { id: toastId })
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    const name = deleteTarget.full_name
    const id = deleteTarget.id
    setDeleteTarget(null)
    const toastId = toast.loading("Deleting user…")
    const result = await deleteUserAction(id)
    if (!result.error) {
      await refresh()
      toast.success(`${name} has been removed.`, { id: toastId })
    } else {
      toast.error("Failed to delete user.", { id: toastId })
    }
  }

  return (
    <div className="bg-zinc-950 p-6 text-white">
      {/* ── Page header ── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage staff accounts, roles, and shift assignments.
          </p>
        </div>
        <Button
          onPress={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          New User
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(
          [
            { label: "Total", value: users.length, color: "text-white" },
            { label: "Active", value: users.filter((u) => u.status === "active").length, color: "text-emerald-400" },
            { label: "Inactive", value: users.filter((u) => u.status === "inactive").length, color: "text-red-400" },
            { label: "Night Shift", value: users.filter((u) => u.shift_type === "Night Shift").length, color: "text-sky-400" },
          ] as const
        ).map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/5 bg-white/3 px-5 py-4">
            <p className="text-xs uppercase tracking-widest text-zinc-500">{stat.label}</p>
            <p className={`mt-1 text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/5 bg-white/3 px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-zinc-500" />
        <input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
        />
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-xl border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/2 text-xs uppercase tracking-widest text-zinc-500">
              <th className="px-4 py-3 text-left">User</th>
              <th className="hidden px-4 py-3 text-left sm:table-cell">Role</th>
              <th className="hidden px-4 py-3 text-left md:table-cell">Shift</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="hidden px-4 py-3 text-left lg:table-cell">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-zinc-500">
                  Loading users…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={search ? SearchX : Users}
                    title={search ? "No users found" : "No users yet"}
                    description={
                      search
                        ? `No users match "${search}". Try a different name or email.`
                        : "No staff accounts have been created. Press \"New User\" to add one."
                    }
                    action={
                      !search ? (
                        <button
                          onClick={() => setModalOpen(true)}
                          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-400 transition-colors"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          New User
                        </button>
                      ) : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              filtered.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b border-white/5 transition-colors hover:bg-white/2 ${
                    i === filtered.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.full_name} />
                      <div className="leading-none">
                        <p className="font-semibold text-white">{user.full_name}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${roleColor[user.role]}`}>
                      {roleIcon[user.role]}
                      {user.role}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-400 md:table-cell">
                    {user.shift_type}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                        user.status === "active"
                          ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                          : "bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {user.status === "active" ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-500 lg:table-cell">
                    {user.created_at}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RowMenu
                      onEdit={() => handleOpenEdit(user)}
                      onDelete={() => setDeleteTarget(user)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        open={modalOpen}
        form={form}
        errors={errors}
        onClose={handleClose}
        onCreate={handleCreate}
        onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
      />

      {/* Edit User Modal */}
      <EditUserModal
        open={editTarget !== null}
        form={editForm}
        errors={editErrors}
        onClose={() => setEditTarget(null)}
        onSave={handleSaveEdit}
        onFormChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))}
      />

      {/* Delete Alert */}
      <DeleteAlert
        open={deleteTarget !== null}
        title="Delete User"
        description={`Are you sure you want to delete ${deleteTarget?.full_name ?? "this user"}? This action cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
