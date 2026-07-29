import { useGameStore } from '@/store/useGameStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, User } from 'lucide-react'

export function GameStatus() {
  const { xIsNext, winner, isGameOver } = useGameStore()

  let statusMessage = "Player's Turn"
  let Icon = User
  let iconColor = "text-primary"

  if (winner) {
    if (winner === 'Draw') {
      statusMessage = "It's a Draw!"
      Icon = User
      iconColor = "text-slate-400"
    } else if (winner === 'X') {
      statusMessage = "You Won!"
      Icon = User
      iconColor = "text-primary"
    } else {
      statusMessage = "AI Won!"
      Icon = Bot
      iconColor = "text-rose-500"
    }
  } else if (!xIsNext && !isGameOver) {
    statusMessage = "AI Thinking..."
    Icon = Bot
    iconColor = "text-rose-500"
  }

  return (
    <div className="flex justify-center mb-8 h-12 items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={statusMessage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 px-6 py-3 rounded-full glass border border-slate-700/50"
        >
          <Icon className={`w-6 h-6 ${iconColor} ${!xIsNext && !isGameOver && !winner ? 'animate-pulse' : ''}`} />
          <span className="text-lg font-semibold tracking-wide">{statusMessage}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
