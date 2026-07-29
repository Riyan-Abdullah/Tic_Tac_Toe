'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useOnlineStore } from '@/store/useOnlineStore'
import { useWebSocket } from '@/hooks/useWebSocket'
import { RoomCodeDisplay } from '@/components/online/RoomCodeDisplay'
import { PlayerCard } from '@/components/online/PlayerCard'
import { ConnectionStatus } from '@/components/online/ConnectionStatus'
import { Button } from '@/components/ui/Button'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface WaitingRoomPageProps {
  params: Promise<{ roomCode: string }>
}

export default function WaitingRoomPage({ params }: WaitingRoomPageProps) {
  const { roomCode } = use(params)
  const router = useRouter()
  const { players, connectionStatus } = useOnlineStore()
  const { sendAction, disconnect, userId } = useWebSocket(roomCode)

  const playerCount = Object.keys(players).length

  // Once 2 players are in, redirect to the game
  useEffect(() => {
    if (playerCount === 2 && connectionStatus === 'connected') {
      router.push(`/play/online/${roomCode}`)
    }
  }, [playerCount, connectionStatus, roomCode, router])

  const handleLeave = () => {
    disconnect()
    router.push('/play/online')
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-12 px-4">
      {/* Animated ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold text-white mb-2">Waiting Room</h1>
          <p className="text-muted-foreground">Waiting for your opponent to join...</p>
        </motion.div>

        <RoomCodeDisplay code={roomCode} />

        {/* Player Slots */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-8 items-center"
        >
          {/* Player X — always the creator (me) */}
          <PlayerCard
            label="Player X"
            symbol="X"
            isYou
            isConnected
          />

          <div className="text-2xl font-extrabold text-muted-foreground">VS</div>

          {/* Player O — waiting */}
          <div className="flex flex-col items-center gap-3">
            {playerCount >= 2 ? (
              <PlayerCard
                label="Player O"
                symbol="O"
                isConnected
              />
            ) : (
              <div className="w-40 h-40 rounded-2xl glass border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                <span className="text-xs text-muted-foreground">Waiting...</span>
              </div>
            )}
          </div>
        </motion.div>

        <ConnectionStatus />

        <div className="text-center text-sm text-muted-foreground px-6 py-4 rounded-xl glass border border-white/10">
          Share the room code with your opponent. The game starts automatically when they join!
        </div>

        <Button variant="outline" onClick={handleLeave} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Leave Room
        </Button>
      </div>
    </div>
  )
}
