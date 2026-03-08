import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/_ui/app-sidebar"
import { MenuProvider } from "@/contexts/menu_context"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <MenuProvider>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <main className="flex flex-1 flex-col min-w-0 bg-zinc-950">
            <div className="flex h-12 items-center border-b border-white/5 px-4">
              <SidebarTrigger className="text-zinc-400 hover:text-white" />
            </div>
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </TooltipProvider>
    </MenuProvider>
  )
}