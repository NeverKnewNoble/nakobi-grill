export type UserRole = "Admin" | "Inventory Manager" | "Order Taker"
export type ShiftType = "Day Shift" | "Night Shift"
export type UserStatus = "active" | "inactive"

export interface User {
  id: string
  full_name: string
  email: string
  role: UserRole
  shift_type: ShiftType
  status: UserStatus
  created_at: string
}

export interface CreateUserPayload {
  full_name: string
  email: string
  password: string
  role: UserRole
  shift_type: ShiftType
  status: UserStatus
}

export interface EditUserPayload {
  full_name: string
  email: string
  role: UserRole
  shift_type: ShiftType
  status: UserStatus
}
