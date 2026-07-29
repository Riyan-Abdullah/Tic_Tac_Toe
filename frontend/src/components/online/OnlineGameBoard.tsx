'use client'

import { motion } from 'framer-motion'
import { useOnlineStore } from '@/store/useOnlineStore'
import { GameCell } from '@/components/game/GameCell'
import { useOnlineGame } from '@/hooks/useOnlineGame'

interface OnlineGameBoardProps {
  roomCode: string
}

export function OnlineGameBoard({ roomCode }: OnlineGameBoardProps) {
  const { board, winningLine, xIsNext, winner, mySymbol } = useOnlineStore()
  const { handleMove, isMyTurn } = useOnlineGame(roomCode)

  const disabled = !isMyTurn || winner !== null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative p-4 sm:p-6 rounded-2xl glass mx-auto inline-block"
    >
      <div className="grid grid-cols-3 gap-2 sm:gap-4 relative z-10">
        {board.map((cell, index) => (
          <GameCell
            key={index}
            value={cell}
            onClick={() => handleMove(index)}
            isWinningCell={winningLine?.includes(index) ?? false}
            disabled={disabled}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-white/5 rounded-2xl pointer-events-none" />
    </motion.div>
  )
}
