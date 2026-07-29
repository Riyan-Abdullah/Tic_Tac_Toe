import { useGameStore } from '@/store/useGameStore'
import { Card, CardContent } from '@/components/ui/Card'
import { Trophy, Target, Swords, Gamepad2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function ScoreBoard() {
  const { scores } = useGameStore()

  const stats = [
    { label: 'Wins', value: scores.wins, icon: Trophy, color: 'text-primary' },
    { label: 'Losses', value: scores.losses, icon: Target, color: 'text-rose-500' },
    { label: 'Draws', value: scores.draws, icon: Swords, color: 'text-slate-400' },
    { label: 'Played', value: scores.played, icon: Gamepad2, color: 'text-success' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl mx-auto mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
          >
            <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50">
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <Icon className={`w-5 h-5 mb-2 ${stat.color}`} />
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">{stat.label}</span>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
