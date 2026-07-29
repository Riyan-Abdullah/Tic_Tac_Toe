import { useEffect } from 'react'
import { useGameStore, Player } from '@/store/useGameStore'
import { useMinimaxAI } from './useMinimaxAI'
import { audioManager } from '@/utils/audioManager'

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
]

export function useGame() {
  const { board, xIsNext, winner, difficulty, makeMove, setWinner, isGameOver } = useGameStore()
  const { calculateMove } = useMinimaxAI()

  // Check for winner
  useEffect(() => {
    if (winner || isGameOver) return

    let currentWinner: Player | 'Draw' | null = null
    let winningLine: number[] | null = null

    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const [a, b, c] = WINNING_COMBINATIONS[i]
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        currentWinner = board[a]
        winningLine = [a, b, c]
        break
      }
    }

    if (!currentWinner && !board.includes(null)) {
      currentWinner = 'Draw'
    }

    if (currentWinner) {
      setWinner(currentWinner, winningLine)
      if (currentWinner === 'X') audioManager.play('win')
      else if (currentWinner === 'O') audioManager.play('lose')
      else audioManager.play('draw')
    }
  }, [board, winner, setWinner, isGameOver])

  // AI Turn
  useEffect(() => {
    // If it's O's turn and the game isn't over, trigger AI
    if (!xIsNext && !winner && !isGameOver) {
      const timer = setTimeout(() => {
        const move = calculateMove(board, difficulty)
        if (move !== -1) {
          makeMove(move)
          audioManager.play('move')
        }
      }, 500 + Math.random() * 300) // 500-800ms natural delay

      return () => clearTimeout(timer)
    }
  }, [xIsNext, winner, isGameOver, board, difficulty, calculateMove, makeMove])

  const handlePlayerMove = (index: number) => {
    if (board[index] || winner || !xIsNext) return
    makeMove(index)
    audioManager.play('move')
  }

  return { handlePlayerMove }
}
