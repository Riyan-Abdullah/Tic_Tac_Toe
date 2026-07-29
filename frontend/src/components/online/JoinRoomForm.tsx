'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LogIn, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
export function JoinRoomForm() {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length !== 6) {
      toast.error('Room code must be exactly 6 characters')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error("You must be logged in to join a room")
        router.push('/login')
        return
      }

      const res = await fetch(`${API_URL}/room/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ room_code: trimmed })
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || "Failed to join room")
      }

      router.push(`/waiting-room/${trimmed}`)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to join room.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleJoin}
      className="flex flex-col gap-4"
    >
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Enter 6-digit code"
        maxLength={6}
        className="text-center text-xl font-bold tracking-widest bg-[#111] border-primary/30 focus:border-primary uppercase"
        aria-label="Room Code"
      />
      <Button type="submit" disabled={isLoading || code.length !== 6} className="gap-2 w-full">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
        {isLoading ? 'Joining...' : 'Join Room'}
      </Button>
    </motion.form>
  )
}
