import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Which roles can access each portal route prefix
const ROUTE_ROLES: Record<string, string[]> = {
  "/portal/dashboard": ["Admin"],
  "/portal/orders":    ["Admin", "Order Taker"],
  "/portal/inventory": ["Admin", "Inventory Manager"],
  "/portal/users":     ["Admin"],
  "/portal/settings":  ["Admin"],
}

// Where each role lands by default
const ROLE_HOME: Record<string, string> = {
  "Admin":             "/portal/dashboard",
  "Inventory Manager": "/portal/inventory",
  "Order Taker":       "/portal/orders",
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Unauthenticated → login
  if (!user && pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Already authenticated → skip login page
  if (user && pathname === "/login") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    const home = ROLE_HOME[profile?.role ?? ""] ?? "/portal/dashboard"
    return NextResponse.redirect(new URL(home, request.url))
  }

  // Role-based route protection for portal pages
  if (user && pathname.startsWith("/portal")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = profile?.role as string | undefined
    const home = ROLE_HOME[role ?? ""] ?? "/portal/dashboard"

    // Redirect bare /portal to the role's home page
    if (pathname === "/portal") {
      return NextResponse.redirect(new URL(home, request.url))
    }

    // Find the most-specific route rule that matches the current path
    const matchedRoute = Object.keys(ROUTE_ROLES)
      .sort((a, b) => b.length - a.length) // longest prefix first
      .find((route) => pathname.startsWith(route))

    if (matchedRoute && role && !ROUTE_ROLES[matchedRoute].includes(role)) {
      return NextResponse.redirect(new URL(home, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
