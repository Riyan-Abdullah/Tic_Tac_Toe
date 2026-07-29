export type SoundType = 'move' | 'win' | 'lose' | 'draw' | 'join_room' | 'player_connected'

class AudioManager {
  private isMuted: boolean = false
  private audioCtx: AudioContext | null = null

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContext) {
        this.audioCtx = new AudioContext()
      }
    }
  }

  public getVolume(): number {
    if (typeof window === 'undefined') return 0.8
    const stored = localStorage.getItem('sound_volume')
    return stored ? parseInt(stored) / 100 : 0.8
  }

  public play(sound: SoundType) {
    if (this.isMuted) return
    this.initAudio()
    if (!this.audioCtx) return

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume()
    }

    const vol = this.getVolume()
    if (vol === 0) return

    const t = this.audioCtx.currentTime
    const osc = this.audioCtx.createOscillator()
    const gainNode = this.audioCtx.createGain()

    osc.connect(gainNode)
    gainNode.connect(this.audioCtx.destination)

    switch (sound) {
      case 'move':
        osc.type = 'sine'
        osc.frequency.setValueAtTime(600, t)
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1)
        gainNode.gain.setValueAtTime(0.3 * vol, t)
        gainNode.gain.exponentialRampToValueAtTime(0.01 * vol, t + 0.1)
        osc.start(t)
        osc.stop(t + 0.1)
        break
      case 'win':
        osc.type = 'square'
        osc.frequency.setValueAtTime(400, t)
        osc.frequency.setValueAtTime(600, t + 0.1)
        osc.frequency.setValueAtTime(800, t + 0.2)
        osc.frequency.setValueAtTime(1200, t + 0.3)
        gainNode.gain.setValueAtTime(0.2 * vol, t)
        gainNode.gain.linearRampToValueAtTime(0, t + 0.6)
        osc.start(t)
        osc.stop(t + 0.6)
        break
      case 'lose':
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(400, t)
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.5)
        gainNode.gain.setValueAtTime(0.2 * vol, t)
        gainNode.gain.linearRampToValueAtTime(0, t + 0.5)
        osc.start(t)
        osc.stop(t + 0.5)
        break
      case 'draw':
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(300, t)
        osc.frequency.setValueAtTime(250, t + 0.2)
        gainNode.gain.setValueAtTime(0.2 * vol, t)
        gainNode.gain.linearRampToValueAtTime(0, t + 0.5)
        osc.start(t)
        osc.stop(t + 0.5)
        break
      case 'join_room':
        osc.type = 'sine'
        osc.frequency.setValueAtTime(440, t)
        osc.frequency.setValueAtTime(880, t + 0.15)
        gainNode.gain.setValueAtTime(0, t)
        gainNode.gain.linearRampToValueAtTime(0.2 * vol, t + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01 * vol, t + 0.4)
        osc.start(t)
        osc.stop(t + 0.4)
        break
      case 'player_connected':
        osc.type = 'square'
        osc.frequency.setValueAtTime(800, t)
        osc.frequency.exponentialRampToValueAtTime(1600, t + 0.1)
        gainNode.gain.setValueAtTime(0.1 * vol, t)
        gainNode.gain.exponentialRampToValueAtTime(0.01 * vol, t + 0.2)
        osc.start(t)
        osc.stop(t + 0.2)
        break
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted
    return this.isMuted
  }

  public getMutedState() {
    return this.isMuted
  }
}

export const audioManager = new AudioManager()
