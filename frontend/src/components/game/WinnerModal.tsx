import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { Button } from '@/components/ui/Button'
import { Trophy, Bot, Handshake } from 'lucide-react'
import Link from 'next/link'

export function WinnerModal() {
  const { winner, isGameOver, resetGame } = useGameStore()

  if (!isGameOver) return null

  let title = ""
  let message = ""
  let Icon = Trophy
  let color = "text-primary"

  if (winner === 'X') {
    title = "Victory!"
    message = "You outsmarted the AI."
    Icon = Trophy
    color = "text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
  } else if (winner === 'O') {
    title = "Defeat"
    message = "The AI claims victory this time."
    Icon = Bot
    color = "text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]"
  } else if (winner === 'Draw') {
    title = "It's a Draw"
    message = "A perfectly balanced battle."
    Icon = Handshake
    color = "text-slate-300"
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/90 shadow-2xl glass text-center relative"
        >
          {/* Top colored accent */}
          <div className={`h-2 w-full ${winner === 'X' ? 'bg-primary' : winner === 'O' ? 'bg-rose-500' : 'bg-slate-400'}`} />
          
          <div className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-800/50 shadow-inner"
            >
              <Icon className={`h-12 w-12 ${color}`} />
            </motion.div>
            
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-white">{title}</h2>
            <p className="mb-8 text-slate-400">{message}</p>
            
            <div className="flex flex-col gap-3">
              <Button size="lg" variant="gaming" onClick={resetGame} className="w-full">
                Play Again
              </Button>
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
