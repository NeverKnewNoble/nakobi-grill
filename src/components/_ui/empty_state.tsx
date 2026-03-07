import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/3">
        <Icon className="h-6 w-6 text-zinc-600" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-zinc-300">{title}</p>
        <p className="text-xs text-zinc-600 max-w-xs">{description}</p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
