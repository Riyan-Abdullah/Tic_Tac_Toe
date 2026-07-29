'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useOnlineStore } from '@/store/useOnlineStore'
import { useOnlineGame } from '@/hooks/useOnlineGame'
import { Button } from '@/components/ui/Button'
import { Trophy, Handshake, LogOut, RotateCcw } from 'lucide-react'
import Link from 'next/link'

interface RestartDialogProps {
  roomCode: string
}

export function RestartDialog({ roomCode }: RestartDialogProps) {
  const { winner, isGameOver, restartVotes, players, mySymbol } = useOnlineStore()
  const { voteRestart, leaveRoom, userId } = useOnlineGame(roomCode)

  if (!isGameOver) return null

  const myUserId = userId.current
  const hasVoted = myUserId ? restartVotes.includes(myUserId) : false
  const opponentCount = Object.keys(players).length

  let title = ''
  let color = ''
  if (winner === 'X') {
    title = mySymbol === 'X' ? '🏆 You Win!' : '💀 You Lose'
    color = mySymbol === 'X' ? 'text-primary' : 'text-red-500'
  } else if (winner === 'O') {
    title = mySymbol === 'O' ? '🏆 You Win!' : '💀 You Lose'
    color = mySymbol === 'O' ? 'text-primary' : 'text-red-500'
  } else {
    title = "🤝 It's a Draw!"
    color = 'text-slate-300'
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-sm rounded-2xl glass border border-primary/30 text-center overflow-hidden"
        >
          <div className="h-1 w-full bg-gradient-to-r from-primary to-yellow-500" />
          <div className="p-8">
            <h2 className={`text-3xl font-extrabold mb-2 ${color}`}>{title}</h2>
            <p className="text-slate-400 mb-6 text-sm">
              {hasVoted
                ? `Waiting for opponent... (${restartVotes.length}/${opponentCount} voted)`
                : 'Want to play again?'}
            </p>
            <div className="flex flex-col gap-3">
              {!hasVoted && (
                <Button className="w-full gap-2" onClick={voteRestart}>
                  <RotateCcw className="w-4 h-4" /> Play Again
                </Button>
              )}
              {hasVoted && (
                <div className="py-2 text-sm text-primary font-semibold animate-pulse">
                  ✓ Vote submitted — waiting for opponent...
                </div>
              )}
              <Link href="/dashboard">
                <Button variant="outline" className="w-full gap-2" onClick={leaveRoom}>
                  <LogOut className="w-4 h-4" /> Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
