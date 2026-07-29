import { GameCell } from './GameCell'
import { useGameStore } from '@/store/useGameStore'
import { useGame } from '@/hooks/useGame'
import { motion } from 'framer-motion'

export function GameBoard() {
  const { board, winningLine, xIsNext, winner } = useGameStore()
  const { handlePlayerMove } = useGame()

  const isPlayerTurn = xIsNext && !winner

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
            onClick={() => handlePlayerMove(index)}
            isWinningCell={winningLine?.includes(index) ?? false}
            disabled={!isPlayerTurn || winner !== null}
          />
        ))}
      </div>
      
      {/* Optional Animated Background Glow for the Board */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-rose-500/5 rounded-2xl pointer-events-none" />
    </motion.div>
  )
}
