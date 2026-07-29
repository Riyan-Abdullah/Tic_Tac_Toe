"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Loader2, History as HistoryIcon, Clock, Move } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          const res = await fetch(`${API_URL}/history/${user.id}?limit=50`);
          if (res.ok) {
            const data = await res.json();
            setHistory(data.history || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [supabase]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
          <HistoryIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Match History</h1>
          <p className="text-slate-400">Review your past battles and analyze your performance.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : history.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-20 text-slate-500">
            <HistoryIcon className="w-12 h-12 mb-4 opacity-20" />
            <p>You haven't played any matches yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {history.map((m) => {
            const isWinner = m.winner_id === user?.id;
            const isDraw = m.result === "draw";
            
            let opponent = null;
            if (m.player_x === user?.id) {
               opponent = m.po;
            } else {
               opponent = m.px;
            }
            
            return (
              <div key={m.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-16 rounded-full shrink-0 ${isDraw ? 'bg-slate-500' : isWinner ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                       <span className="uppercase text-xs font-bold tracking-widest text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                         {m.game_mode}
                       </span>
                       {m.difficulty && (
                         <span className="uppercase text-xs font-bold tracking-widest text-amber-500 bg-amber-900/30 border border-amber-900/50 px-2 py-0.5 rounded-full">
                           {m.difficulty}
                         </span>
                       )}
                     </div>
                     
                     <div className="flex items-center gap-2 text-lg">
                       <span className="font-medium text-slate-300">vs</span>
                       {opponent ? (
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-slate-700 overflow-hidden border border-slate-500">
                             {opponent.avatar && <img src={opponent.avatar} alt="avatar" className="w-full h-full object-cover" />}
                           </div>
                           <span className="font-bold text-white">{opponent.username}</span>
                         </div>
                       ) : (
                         <span className="font-bold text-white">Guest / AI</span>
                       )}
                     </div>
                     <div className="text-xs text-slate-500 mt-1">
                       {new Date(m.created_at).toLocaleString()}
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 md:gap-12 w-full md:w-auto justify-between md:justify-end border-t md:border-none border-slate-800 pt-4 md:pt-0">
                   <div className="flex gap-6">
                     <div className="flex flex-col items-center">
                       <Clock className="w-4 h-4 text-slate-500 mb-1" />
                       <span className="text-sm text-slate-300 font-mono">{m.duration_seconds ? `${m.duration_seconds}s` : '--'}</span>
                     </div>
                     <div className="flex flex-col items-center">
                       <Move className="w-4 h-4 text-slate-500 mb-1" />
                       <span className="text-sm text-slate-300 font-mono">{m.moves || 0} moves</span>
                     </div>
                   </div>
                   
                   <div className={`w-24 text-right font-black uppercase tracking-widest text-lg ${isDraw ? 'text-slate-400' : isWinner ? 'text-success drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'text-red-500'}`}>
                     {isDraw ? 'Draw' : isWinner ? 'Victory' : 'Defeat'}
                   </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
