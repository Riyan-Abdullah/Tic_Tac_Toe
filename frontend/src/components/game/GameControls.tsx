import { useGameStore } from '@/store/useGameStore'
import { Button } from '@/components/ui/Button'
import { RotateCcw, Trash2 } from 'lucide-react'

export function GameControls() {
  const { resetGame, resetScores, board } = useGameStore()
  
  const hasStarted = board.some((cell) => cell !== null)

  return (
    <div className="flex gap-4 justify-center mt-8">
      <Button 
        variant="outline" 
        onClick={resetGame}
        disabled={!hasStarted}
        className="gap-2 border-slate-700/50 hover:bg-slate-800"
      >
        <RotateCcw className="w-4 h-4" /> Restart Game
      </Button>
      <Button 
        variant="destructive" 
        onClick={resetScores}
        className="gap-2"
      >
        <Trash2 className="w-4 h-4" /> Reset Stats
      </Button>
    </div>
  )
}
