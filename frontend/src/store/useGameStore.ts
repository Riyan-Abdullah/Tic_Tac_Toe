import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Player = 'X' | 'O' | null
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

interface GameScores {
  wins: number
  losses: number
  draws: number
  played: number
}

interface GameState {
  board: Player[]
  xIsNext: boolean
  winner: Player | 'Draw'
  winningLine: number[] | null
  difficulty: Difficulty
  scores: GameScores
  isGameOver: boolean
  
  // Actions
  makeMove: (index: number) => void
  setWinner: (winner: Player | 'Draw', line: number[] | null) => void
  resetGame: () => void
  resetScores: () => void
  setDifficulty: (diff: Difficulty) => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      board: Array(9).fill(null),
      xIsNext: Math.random() > 0.5,
      winner: null,
      winningLine: null,
      difficulty: 'Medium',
      scores: {
        wins: 0,
        losses: 0,
        draws: 0,
        played: 0,
      },
      isGameOver: false,

      makeMove: (index: number) => {
        const { board, winner } = get()
        if (board[index] || winner) return

        const newBoard = [...board]
        newBoard[index] = get().xIsNext ? 'X' : 'O'

        set({
          board: newBoard,
          xIsNext: !get().xIsNext,
        })
      },

      setWinner: (winner: Player | 'Draw', line: number[] | null) => {
        set((state) => {
          if (state.isGameOver) return state // Prevent multiple score updates

          const newScores = { ...state.scores }
          newScores.played += 1
          if (winner === 'X') newScores.wins += 1
          else if (winner === 'O') newScores.losses += 1
          else if (winner === 'Draw') newScores.draws += 1

          return {
            winner,
            winningLine: line,
            scores: newScores,
            isGameOver: true,
          }
        })
      },

      resetGame: () => {
        set({
          board: Array(9).fill(null),
          xIsNext: Math.random() > 0.5,
          winner: null,
          winningLine: null,
          isGameOver: false,
        })
      },

      resetScores: () => {
        set({
          scores: {
            wins: 0,
            losses: 0,
            draws: 0,
            played: 0,
          },
        })
      },

      setDifficulty: (diff: Difficulty) => {
        set({ difficulty: diff })
      },
    }),
    {
      name: 'tictac-arena-storage', // unique name
      storage: createJSONStorage(() => sessionStorage), // persist only for the session
      partialize: (state) => ({ scores: state.scores, difficulty: state.difficulty }),
    }
  )
)
