import { useGameStore, Difficulty } from '@/store/useGameStore'
import { Button } from '@/components/ui/Button'

export function DifficultySelector() {
  const { difficulty, setDifficulty, board, winner } = useGameStore()
  
  // Disable selector if game has started (board has moves) and is not over
  const hasStarted = board.some((cell) => cell !== null)
  const disabled = hasStarted && winner === null

  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard']

  return (
    <div className="flex flex-col items-center mb-8 gap-2">
      <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">AI Difficulty</span>
      <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
        {difficulties.map((diff) => (
          <Button
            key={diff}
            variant={difficulty === diff ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDifficulty(diff)}
            disabled={disabled && difficulty !== diff}
            className={`
              rounded-md px-6 transition-all duration-300
              ${difficulty === diff ? (
                diff === 'Easy' ? 'bg-success hover:bg-success-dark text-white' :
                diff === 'Medium' ? 'bg-primary hover:bg-primary-dark text-white' :
                'bg-rose-500 hover:bg-rose-600 text-white'
              ) : 'text-slate-400 hover:text-white hover:bg-slate-700'}
            `}
          >
            {diff}
          </Button>
        ))}
      </div>
      {disabled && (
        <span className="text-xs text-slate-500 mt-1">Finish current game to change difficulty</span>
      )}
    </div>
  )
}
