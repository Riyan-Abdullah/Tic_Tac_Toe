'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { RoomCodeDisplay } from '@/components/online/RoomCodeDisplay'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function CreateRoomPage() {
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function initRoom() {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          toast.error("You must be logged in to create a room")
          router.push('/login')
          return
        }

        const res = await fetch(`${API_URL}/room/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        
        if (!res.ok) {
           const text = await res.text().catch(() => "Could not read text");
           console.error("Backend Error Status:", res.status, "Text:", text);
           
           let errData = null;
           try { errData = JSON.parse(text); } catch(e) {}
           
           throw new Error(errData?.detail ? (typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail)) : `Status ${res.status}: ${text}`);
        }
          
        const data = await res.json()
        setRoomCode(data.room_code)
        toast.success('Room created! Share the code with a friend.')
      } catch (err: any) {
        console.error(err)
        toast.error(err.message || 'Failed to create room.')
      } finally {
        setIsCreating(false)
      }
    }
    
    initRoom()
  }, [router])

  const handleEnterRoom = () => {
    if (roomCode) {
      router.push(`/waiting-room/${roomCode}`)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-12 px-4">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/play/online" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-8 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Lobby
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl glass border border-primary/20 flex flex-col items-center gap-8 text-center"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2">Room Created</h1>
            <p className="text-muted-foreground">Share this code with your opponent to begin.</p>
          </div>

          {roomCode ? (
            <RoomCodeDisplay code={roomCode} />
          ) : (
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          )}

          <div className="w-full space-y-3">
            <Button onClick={handleEnterRoom} disabled={!roomCode} className="w-full gap-2">
              Enter Waiting Room
            </Button>
            <p className="text-xs text-muted-foreground">
              You will play as <span className="text-primary font-bold">X</span> (first move).
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
