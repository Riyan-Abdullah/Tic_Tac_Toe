"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, Search, Play, Users } from "lucide-react";
import Link from "next/link";

export default function SpectatePage() {
  const [roomCode, setRoomCode] = useState("");
  
  // In a real implementation, we would query the backend for a list of active rooms.
  // For this MVP, we provide a way to enter a room code directly to spectate it.
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white flex items-center justify-center gap-4">
          <Eye className="w-10 h-10 text-primary" />
          Spectator Mode
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto mb-6">Watch live matches, learn from the pros, and chat with other spectators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="p-8 flex flex-col h-full items-center justify-center text-center">
               <Search className="w-12 h-12 text-slate-500 mb-4 opacity-50" />
               <h2 className="text-xl font-bold text-white mb-2">Find a Match</h2>
               <p className="text-slate-400 mb-6 text-sm">Enter a specific room code to jump straight into the action.</p>
               
               <div className="flex gap-2 w-full max-w-xs">
                  <Input 
                     placeholder="Room Code" 
                     value={roomCode}
                     onChange={e => setRoomCode(e.target.value.toUpperCase())}
                     className="bg-black/50 border-slate-700 text-center font-mono uppercase tracking-widest"
                  />
                  <Link href={`/play/online/${roomCode}?mode=spectate`} className={roomCode.length !== 6 ? "pointer-events-none opacity-50" : ""}>
                     <Button variant="gaming">Watch</Button>
                  </Link>
               </div>
            </CardContent>
         </Card>
         
         <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="p-8 flex flex-col h-full">
               <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-red-500" /> Featured Live Matches
               </h2>
               
               <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                  <Users className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">No featured matches right now.</p>
                  <p className="text-xs mt-1">Check back later for high-ELO games.</p>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
