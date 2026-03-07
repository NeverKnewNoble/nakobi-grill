"use client"

import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  LogOut,
  Settings,
  UtensilsCrossed,
  ChevronRight,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    url: "/portal/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    url: "/portal/orders",
    icon: ClipboardList,
  },
  {
    title: "Inventory",
    url: "/portal/inventory",
    icon: Package,
  },
  {
    title: "Users",
    url: "/portal/users",
    icon: Users,
  },
]

// Mock user — swap with real session data later
const currentUser = {
  name: "Larry Noble",
  role: "Admin",
  avatar: "LN",
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      {/* ── Header / Brand ── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-sm tracking-tight">
                  Nakobi
                </span>
                <span className="text-xs text-muted-foreground">
                  Grill POS
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Nav ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="gap-0 p-0">
        <SidebarSeparator className="mx-0 mb-1" />

        {/* Settings & Sign out */}
        <SidebarMenu className="px-2 pb-1">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings" size="sm">
              <a href="/portal/settings">
                <Settings />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Sign out"
              size="sm"
              className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <a href="/logout">
                <LogOut />
                <span>Sign out</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="mx-0 mt-1" />

        {/* User card */}
        <SidebarMenu className="p-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={`${currentUser.name} · ${currentUser.role}`}
              className="group/user rounded-xl border border-white/5 bg-white/3 px-3 py-2 hover:border-orange-500/20 hover:bg-orange-500/8"
            >
              {/* Avatar with online dot */}
              <div className="relative shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-extrabold text-white shadow-md shadow-orange-500/30">
                  {currentUser.avatar}
                </div>
                <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-emerald-400" />
              </div>

              {/* Name & role */}
              <div className="flex flex-1 flex-col leading-none overflow-hidden">
                <span className="truncate text-sm font-semibold text-sidebar-foreground">
                  {currentUser.name}
                </span>
                <span className="truncate text-xs text-orange-400/80">
                  {currentUser.role}
                </span>
              </div>

              <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-sidebar-foreground/30 transition-transform group-hover/user:translate-x-0.5" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
