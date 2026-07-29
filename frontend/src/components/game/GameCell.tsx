import { motion } from 'framer-motion'
import { Player } from '@/store/useGameStore'
import { cn } from '@/lib/utils'

interface GameCellProps {
  value: Player
  onClick: () => void
  isWinningCell: boolean
  disabled: boolean
}

export function GameCell({ value, onClick, isWinningCell, disabled }: GameCellProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      className={cn(
        "relative flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-xl border-2 border-slate-700/50 bg-[#141414] text-4xl sm:text-6xl font-bold backdrop-blur-sm transition-all duration-300",
        !value && !disabled && "hover:bg-[#1a1a1a] hover:border-primary/50 cursor-pointer",
        value && "cursor-default",
        disabled && !value && "cursor-not-allowed opacity-80",
        isWinningCell && "border-primary bg-primary/10 gold-glow z-10 scale-105"
      )}
    >
      {value && (
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={cn(
            "drop-shadow-lg",
            value === 'X' ? "text-primary" : "text-white"
          )}
        >
          {value}
        </motion.span>
      )}
    </button>
  )
}
