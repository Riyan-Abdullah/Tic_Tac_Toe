import { useCallback } from 'react'
import { Player, Difficulty } from '@/store/useGameStore'

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
]

export function useMinimaxAI() {
  const checkWinner = (board: Player[]): Player | 'Draw' | null => {
    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const [a, b, c] = WINNING_COMBINATIONS[i]
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    if (!board.includes(null)) return 'Draw'
    return null
  }

  const getAvailableMoves = (board: Player[]): number[] => {
    return board.map((cell, index) => (cell === null ? index : -1)).filter((i) => i !== -1)
  }

  const getRandomMove = (board: Player[]): number => {
    const available = getAvailableMoves(board)
    if (available.length === 0) return -1
    const randomIndex = Math.floor(Math.random() * available.length)
    return available[randomIndex]
  }

  const getWinningOrBlockingMove = (board: Player[], player: Player): number => {
    const available = getAvailableMoves(board)
    for (const move of available) {
      const boardCopy = [...board]
      boardCopy[move] = player
      if (checkWinner(boardCopy) === player) return move
    }
    return -1
  }

  // Minimax Algorithm
  const minimax = (board: Player[], depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(board)
    if (result === 'O') return 10 - depth
    if (result === 'X') return depth - 10
    if (result === 'Draw') return 0

    const available = getAvailableMoves(board)

    if (isMaximizing) {
      let bestScore = -Infinity
      for (const move of available) {
        board[move] = 'O'
        const score = minimax(board, depth + 1, false)
        board[move] = null
        bestScore = Math.max(score, bestScore)
      }
      return bestScore
    } else {
      let bestScore = Infinity
      for (const move of available) {
        board[move] = 'X'
        const score = minimax(board, depth + 1, true)
        board[move] = null
        bestScore = Math.min(score, bestScore)
      }
      return bestScore
    }
  }

  const getBestMove = (board: Player[]): number => {
    const available = getAvailableMoves(board)
    let bestScore = -Infinity
    let moveIndex = -1

    // Optimization: if it's the very first move of the AI, take center or random corner
    if (available.length === 9) {
      return 4 // Center
    }
    if (available.length === 8 && board[4] === null) {
      return 4 // Take center if player didn't
    }

    for (const move of available) {
      board[move] = 'O'
      const score = minimax(board, 0, false)
      board[move] = null
      if (score > bestScore) {
        bestScore = score
        moveIndex = move
      }
    }
    return moveIndex
  }

  const calculateMove = useCallback((board: Player[], difficulty: Difficulty): number => {
    const availableMoves = getAvailableMoves(board)
    if (availableMoves.length === 0) return -1

    switch (difficulty) {
      case 'Easy':
        return getRandomMove(board)
      case 'Medium':
        // Try to win first
        let move = getWinningOrBlockingMove(board, 'O')
        if (move !== -1) return move
        // Block player from winning
        move = getWinningOrBlockingMove(board, 'X')
        if (move !== -1) return move
        // Otherwise random
        return getRandomMove(board)
      case 'Hard':
        return getBestMove([...board])
      default:
        return getRandomMove(board)
    }
  }, [])

  return { calculateMove }
}
