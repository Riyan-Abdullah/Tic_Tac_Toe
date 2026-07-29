'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnlineStore } from '@/store/useOnlineStore'
import { useOnlineGame } from '@/hooks/useOnlineGame'
import { OnlineGameBoard } from '@/components/online/OnlineGameBoard'
import { ConnectionStatus } from '@/components/online/ConnectionStatus'
import { RestartDialog } from '@/components/online/RestartDialog'
import { PlayerCard } from '@/components/online/PlayerCard'
import { Button } from '@/components/ui/Button'
import { LogOut, Bot, User } from 'lucide-react'
import { SoundToggle } from '@/components/game/SoundToggle'

interface OnlineGamePageProps {
  params: Promise<{ roomCode: string }>
}

export default function OnlineGamePage({ params }: OnlineGamePageProps) {
  const { roomCode } = use(params)
  const router = useRouter()
  const { xIsNext, winner, mySymbol, players, connectionStatus } = useOnlineStore()
  const { leaveRoom, userId } = useOnlineGame(roomCode)

  const myUserId = userId.current
  const isMyTurn = mySymbol
    ? (xIsNext && mySymbol === 'X') || (!xIsNext && mySymbol === 'O')
    : false

  // Determine status label
  let statusText = ''
  let statusColor = 'text-white'
  if (winner) {
    statusText = 'Game Over'
  } else if (connectionStatus === 'opponent_disconnected') {
    statusText = 'Opponent Disconnected — Waiting...'
    statusColor = 'text-yellow-500'
  } else if (isMyTurn) {
    statusText = 'Your Turn'
    statusColor = 'text-primary'
  } else {
    statusText = "Opponent's Turn..."
    statusColor = 'text-muted-foreground'
  }

  const handleLeave = () => {
    leaveRoom()
    router.push('/play/online')
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center py-8 px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </div>

      <SoundToggle />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-6">
        {/* Header */}
        <div className="flex justify-between items-center w-full max-w-xl">
          <h1 className="text-2xl font-extrabold text-white">
            Arena <span className="text-primary">Battle</span>
          </h1>
          <div className="flex items-center gap-4">
            <ConnectionStatus />
            <Button variant="ghost" size="sm" onClick={handleLeave} className="gap-2 text-red-500 hover:text-red-400">
              <LogOut className="w-4 h-4" /> Leave
            </Button>
          </div>
        </div>

        {/* Player cards row */}
        <div className="flex gap-6 items-center justify-center w-full">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl glass border border-primary/30">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">X</div>
            <span className="text-sm text-white font-medium">{mySymbol === 'X' ? 'You' : 'Opponent'}</span>
            {(xIsNext && !winner) && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
          </div>

          <span className="text-lg font-bold text-muted-foreground">VS</span>

          <div className="flex items-center gap-3 px-5 py-3 rounded-xl glass border border-white/10">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">O</div>
            <span className="text-sm text-white font-medium">{mySymbol === 'O' ? 'You' : 'Opponent'}</span>
            {(!xIsNext && !winner) && <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse" />}
          </div>
        </div>

        {/* Status */}
        <AnimatePresence mode="wait">
          <motion.p
            key={statusText}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={`text-lg font-semibold ${statusColor}`}
          >
            {statusText}
          </motion.p>
        </AnimatePresence>

        {/* Game Board */}
        <OnlineGameBoard roomCode={roomCode} />

        <p className="text-xs text-muted-foreground text-center">
          Room: <span className="font-mono text-primary tracking-widest">{roomCode}</span>
        </p>
      </div>

      {/* Result / Restart Modal */}
      <RestartDialog roomCode={roomCode} />
    </div>
  )
}
