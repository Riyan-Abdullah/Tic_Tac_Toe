"use client";

import { GameBoard } from '@/components/game/GameBoard'
import { ScoreBoard } from '@/components/game/ScoreBoard'
import { GameStatus } from '@/components/game/GameStatus'
import { DifficultySelector } from '@/components/game/DifficultySelector'
import { GameControls } from '@/components/game/GameControls'
import { WinnerModal } from '@/components/game/WinnerModal'
import { SoundToggle } from '@/components/game/SoundToggle'

export default function PlayPage() {
  return (
    <div className="relative min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-slate-900 to-slate-900 -z-10" />
      
      <SoundToggle />
      
      <div className="w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Arena <span className="text-primary">Match</span>
        </h1>

        <ScoreBoard />
        
        <DifficultySelector />
        
        <GameStatus />
        
        <GameBoard />
        
        <GameControls />
      </div>

      <WinnerModal />
    </div>
  )
}
