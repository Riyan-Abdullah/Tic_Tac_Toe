import { create } from 'zustand'

export type OnlinePlayer = 'X' | 'O' | null
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'opponent_disconnected'

interface OnlineGameState {
  roomCode: string | null
  players: Record<string, string> // user_id -> symbol ('X' or 'O')
  board: OnlinePlayer[]
  xIsNext: boolean
  winner: OnlinePlayer | 'Draw' | null
  winningLine: number[] | null
  isGameOver: boolean
  connectionStatus: ConnectionStatus
  mySymbol: 'X' | 'O' | null
  restartVotes: string[]

  // Actions
  setRoomCode: (code: string) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  syncState: (state: any, myUserId: string) => void
  resetStore: () => void
}

export const useOnlineStore = create<OnlineGameState>((set, get) => ({
  roomCode: null,
  players: {},
  board: Array(9).fill(null),
  xIsNext: true,
  winner: null,
  winningLine: null,
  isGameOver: false,
  connectionStatus: 'disconnected',
  mySymbol: null,
  restartVotes: [],

  setRoomCode: (code: string) => set({ roomCode: code }),

  setConnectionStatus: (status: ConnectionStatus) => set({ connectionStatus: status }),

  syncState: (state: any, myUserId: string) => {
    const isGameOver = state.winner !== null
    set({
      board: state.board,
      xIsNext: state.xIsNext,
      winner: state.winner,
      winningLine: state.winningLine,
      players: state.players,
      restartVotes: state.restartVotes,
      isGameOver,
      mySymbol: (state.players[myUserId] as 'X' | 'O') || null,
      // Auto-heal if opponent reconnected
      ...(get().connectionStatus === 'opponent_disconnected' ? { connectionStatus: 'connected' } : {}),
    })
  },

  resetStore: () =>
    set({
      roomCode: null,
      players: {},
      board: Array(9).fill(null),
      xIsNext: true,
      winner: null,
      winningLine: null,
      isGameOver: false,
      connectionStatus: 'disconnected',
      mySymbol: null,
      restartVotes: [],
    }),
}))
