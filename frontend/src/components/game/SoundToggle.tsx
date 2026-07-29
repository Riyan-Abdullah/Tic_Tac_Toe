import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Volume2, VolumeX } from 'lucide-react'
import { audioManager } from '@/utils/audioManager'

export function SoundToggle() {
  const [isMuted, setIsMuted] = useState(audioManager.getMutedState())

  const handleToggle = () => {
    setIsMuted(audioManager.toggleMute())
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
      title={isMuted ? "Unmute sounds" : "Mute sounds"}
    >
      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </Button>
  )
}
