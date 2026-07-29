'use client'

import { motion } from 'framer-motion'
import { User, Bot } from 'lucide-react'

interface PlayerCardProps {
  label: string
  symbol: 'X' | 'O'
  isYou?: boolean
  isConnected?: boolean
  isWaiting?: boolean
}

export function PlayerCard({ label, symbol, isYou, isConnected, isWaiting }: PlayerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        flex flex-col items-center gap-3 p-5 rounded-2xl glass w-40
        ${isYou ? 'border-primary/50' : 'border-white/10'}
        border-2
      `}
    >
      <div
        className={`
          w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold
          ${symbol === 'X' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white'}
        `}
      >
        {symbol}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white">{label}</p>
        {isYou && <span className="text-xs text-primary font-bold uppercase tracking-widest">You</span>}
      </div>
      <div className={`w-2 h-2 rounded-full ${isWaiting ? 'bg-yellow-500 animate-pulse' : isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
    </motion.div>
  )
}
