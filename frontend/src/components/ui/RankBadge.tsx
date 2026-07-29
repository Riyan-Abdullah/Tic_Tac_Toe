import { cn } from "@/lib/utils"

export type Rank = 
  | 'Beginner'
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Master'
  | 'Grandmaster'
  | 'Legend'

interface RankBadgeProps {
  rank: Rank | string
  className?: string
  showLabel?: boolean
}

const rankColors: Record<string, string> = {
  Beginner: "bg-slate-800 text-slate-300 border-slate-600",
  Bronze: "bg-amber-900/50 text-amber-500 border-amber-700/50",
  Silver: "bg-slate-400/20 text-slate-300 border-slate-400/50",
  Gold: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]",
  Platinum: "bg-teal-500/20 text-teal-400 border-teal-500/50",
  Diamond: "bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]",
  Master: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  Grandmaster: "bg-red-500/20 text-red-500 border-red-500/50",
  Legend: "bg-gradient-to-r from-yellow-500/30 via-amber-500/30 to-yellow-500/30 text-yellow-400 border-yellow-500 animate-pulse shadow-[0_0_25px_rgba(255,215,0,0.5)]",
}

export function RankBadge({ rank, className, showLabel = true }: RankBadgeProps) {
  const colorClass = rankColors[rank as string] || rankColors.Beginner
  
  return (
    <div className={cn(
      "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border",
      colorClass,
      className
    )}>
      {showLabel ? rank : null}
    </div>
  )
}
