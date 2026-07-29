'use client'

import { useCallback } from 'react'
import { useOnlineStore } from '@/store/useOnlineStore'
import { useWebSocket } from './useWebSocket'
import { audioManager } from '@/utils/audioManager'

export function useOnlineGame(roomCode: string | null) {
  const { board, xIsNext, winner, isGameOver, mySymbol } = useOnlineStore()
  const { sendAction, disconnect, userId } = useWebSocket(roomCode)

  const isMyTurn = mySymbol
    ? (xIsNext && mySymbol === 'X') || (!xIsNext && mySymbol === 'O')
    : false

  const handleMove = useCallback(
    (index: number) => {
      if (board[index] || winner || !isMyTurn || isGameOver) return
      sendAction({ type: 'move', index })
      audioManager.play('move')
    },
    [board, winner, isMyTurn, isGameOver, sendAction]
  )

  const voteRestart = useCallback(() => {
    sendAction({ type: 'restart_vote' })
  }, [sendAction])

  const leaveRoom = useCallback(() => {
    disconnect()
  }, [disconnect])

  return {
    handleMove,
    voteRestart,
    leaveRoom,
    isMyTurn,
    userId,
  }
}
