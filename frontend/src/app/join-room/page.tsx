'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { JoinRoomForm } from '@/components/online/JoinRoomForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function JoinRoomContent() {
  const searchParams = useSearchParams()
  const prefill = searchParams.get('code') || ''

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-12 px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/play/online" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-8 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Lobby
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl glass border border-white/10 flex flex-col gap-6"
        >
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white mb-2">Join a Room</h1>
            <p className="text-muted-foreground">Enter the 6-character room code to join the battle.</p>
          </div>

          <JoinRoomForm />

          <p className="text-xs text-center text-muted-foreground">
            You will play as <span className="text-white font-bold">O</span>.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function JoinRoomPage() {
  return (
    <Suspense>
      <JoinRoomContent />
    </Suspense>
  )
}
