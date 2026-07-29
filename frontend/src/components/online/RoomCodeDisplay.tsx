'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

interface RoomCodeDisplayProps {
  code: string
}

export function RoomCodeDisplay({ code }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Room code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/join-room?code=${code}`
    if (navigator.share) {
      await navigator.share({ title: 'Join my TicTac Arena game!', url })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Invite link copied!')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground uppercase tracking-widest">Room Code</p>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex items-center gap-2 px-8 py-4 rounded-2xl glass border-2 border-primary/60 gold-glow"
      >
        <span className="text-4xl font-extrabold tracking-[0.35em] text-primary font-mono">{code}</span>
      </motion.div>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>
    </div>
  )
}
