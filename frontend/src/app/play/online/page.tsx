'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Plus, LogIn, Zap, Users, Globe } from 'lucide-react'

export default function OnlineLobbyPage() {
  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-12 px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <Globe className="w-4 h-4" />
            <span>Online Multiplayer</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">
            <span className="text-white">Challenge </span>
            <span className="text-primary">the World</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Create a private room or join a friend's game. Real-time battles, instant moves.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Create Room */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group p-8 rounded-2xl glass border border-primary/20 hover:border-primary/60 hover:gold-glow transition-all duration-300 flex flex-col gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Create Room</h2>
              <p className="text-muted-foreground text-sm">
                Generate a unique room code and invite your opponent. You'll play as{' '}
                <span className="text-primary font-bold">X</span>.
              </p>
            </div>
            <Link href="/create-room">
              <Button className="w-full gap-2">
                <Plus className="w-4 h-4" /> Create Room
              </Button>
            </Link>
          </motion.div>

          {/* Join Room */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group p-8 rounded-2xl glass border border-white/10 hover:border-primary/40 hover:gold-glow transition-all duration-300 flex flex-col gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Join Room</h2>
              <p className="text-muted-foreground text-sm">
                Enter a room code to join a game. You'll play as{' '}
                <span className="text-white font-bold">O</span>.
              </p>
            </div>
            <Link href="/join-room">
              <Button variant="secondary" className="w-full gap-2">
                <LogIn className="w-4 h-4" /> Join Room
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mt-12"
        >
          {[
            { icon: Zap, label: 'Real-Time Sync' },
            { icon: Users, label: 'Private Rooms' },
            { icon: Globe, label: 'Play Anywhere' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-muted-foreground"
            >
              <Icon className="w-4 h-4 text-primary" />
              {label}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
