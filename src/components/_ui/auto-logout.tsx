"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"
import { signOut } from "@/lib/auth"

const TIMEOUT_MS      = 15 * 60 * 1000  // 15 minutes
const WARNING_MS      = 14 * 60 * 1000  // warn at 14 minutes (1 min before logout)
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const

export default function AutoLogout() {
  const router       = useRouter()
  const logoutTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningToast = useRef<string | number | null>(null)
  const isAdmin      = useRef(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role !== "Admin") return

      isAdmin.current = true
      startTimers()

      ACTIVITY_EVENTS.forEach((e) =>
        window.addEventListener(e, handleActivity, { passive: true })
      )
    }

    function startTimers() {
      clearTimers()

      warningTimer.current = setTimeout(() => {
        warningToast.current = toast.warning(
          "You will be signed out in 1 minute due to inactivity.",
          { duration: 60_000 }
        )
      }, WARNING_MS)

      logoutTimer.current = setTimeout(async () => {
        if (warningToast.current !== null) toast.dismiss(warningToast.current)
        await signOut()
        toast.info("You were signed out due to inactivity.")
        router.push("/login")
        router.refresh()
      }, TIMEOUT_MS)
    }

    function clearTimers() {
      if (logoutTimer.current)  clearTimeout(logoutTimer.current)
      if (warningTimer.current) clearTimeout(warningTimer.current)
      if (warningToast.current !== null) toast.dismiss(warningToast.current)
      warningToast.current = null
    }

    function handleActivity() {
      if (!isAdmin.current) return
      startTimers()
    }

    init()

    return () => {
      clearTimers()
      ACTIVITY_EVENTS.forEach((e) =>
        window.removeEventListener(e, handleActivity)
      )
    }
  }, [router])

  return null
}
