'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useOnlineStore } from '@/store/useOnlineStore'
import { audioManager } from '@/utils/audioManager'
import { createClient } from '@/utils/supabase/client'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
const HEARTBEAT_INTERVAL_MS = 25_000
const RECONNECT_DELAY_MS = 3_000
const MAX_RECONNECT_ATTEMPTS = 5

export function useWebSocket(roomCode: string | null) {
  const wsRef = useRef<WebSocket | null>(null)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const userIdRef = useRef<string | null>(null)

  const { setConnectionStatus, syncState, resetStore } = useOnlineStore()

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
  }, [])

  const startHeartbeat = useCallback(() => {
    stopHeartbeat()
    heartbeatRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }))
      }
    }, HEARTBEAT_INTERVAL_MS)
  }, [stopHeartbeat])

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      let data: any
      try {
        data = JSON.parse(event.data)
      } catch {
        return
      }

      switch (data.type) {
        case 'sync_state':
          if (userIdRef.current) {
            syncState(data.state, userIdRef.current)
          }
          break
        case 'match_started':
          setConnectionStatus('connected')
          audioManager.play('join_room')
          break
        case 'opponent_disconnected':
          setConnectionStatus('opponent_disconnected')
          break
        case 'game_restarted':
          // State will be synced via subsequent sync_state message
          break
        case 'error':
          console.error('[WS] Error from server:', data.message)
          break
        case 'pong':
          // Heartbeat acknowledged
          break
      }
    },
    [syncState, setConnectionStatus]
  )

  const connect = useCallback(async () => {
    if (!roomCode) return

    setConnectionStatus('connecting')

    // Get Supabase session token
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setConnectionStatus('disconnected')
      return
    }

    userIdRef.current = session.user.id
    const token = session.access_token

    const url = `${WS_URL}/ws/game/${roomCode}?token=${token}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0
      setConnectionStatus('connected')
      startHeartbeat()
    }

    ws.onmessage = handleMessage

    ws.onclose = () => {
      stopHeartbeat()
      setConnectionStatus('disconnected')

      // Auto-reconnect
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current++
        setTimeout(() => connect(), RECONNECT_DELAY_MS)
      }
    }

    ws.onerror = (err) => {
      console.error('[WS] Error:', err)
    }
  }, [roomCode, setConnectionStatus, startHeartbeat, stopHeartbeat, handleMessage])

  const sendAction = useCallback((action: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(action))
    }
  }, [])

  const disconnect = useCallback(() => {
    stopHeartbeat()
    wsRef.current?.close()
    wsRef.current = null
    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS // Prevent auto-reconnect on intentional close
    resetStore()
  }, [stopHeartbeat, resetStore])

  useEffect(() => {
    if (roomCode) {
      connect()
    }
    return () => {
      stopHeartbeat()
      wsRef.current?.close()
    }
  }, [roomCode]) // eslint-disable-line react-hooks/exhaustive-deps

  return { sendAction, disconnect, userId: userIdRef }
}
