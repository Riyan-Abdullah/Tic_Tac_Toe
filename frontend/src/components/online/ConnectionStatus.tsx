'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useOnlineStore } from '@/store/useOnlineStore'
import { Wifi, WifiOff, Loader2, UserCheck, AlertTriangle } from 'lucide-react'

export function ConnectionStatus() {
  const { connectionStatus } = useOnlineStore()

  const config = {
    connecting: { icon: Loader2, label: 'Connecting...', color: 'text-yellow-500', spin: true },
    connected: { icon: Wifi, label: 'Connected', color: 'text-green-500', spin: false },
    disconnected: { icon: WifiOff, label: 'Disconnected', color: 'text-red-500', spin: false },
    opponent_disconnected: { icon: AlertTriangle, label: 'Opponent Disconnected', color: 'text-yellow-500', spin: false },
  }

  const { icon: Icon, label, color, spin } = config[connectionStatus]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={connectionStatus}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        className={`flex items-center gap-2 text-sm font-medium ${color}`}
      >
        <Icon className={`w-4 h-4 ${spin ? 'animate-spin' : ''}`} />
        <span>{label}</span>
      </motion.div>
    </AnimatePresence>
  )
}
