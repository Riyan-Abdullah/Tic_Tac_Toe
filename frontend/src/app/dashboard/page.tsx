"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Trophy, Swords, Target, TrendingUp, Users, Gamepad2, Loader2, Star, Award, History, BarChart2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { RankBadge } from "@/components/ui/RankBadge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          const res = await fetch(`${API_URL}/stats/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setStats(data);
          }
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const o = stats?.overview || {};
  const recent = stats?.recent_matches || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Welcome back, {user?.user_metadata?.username || "Player"}!
          </h1>
          <p className="text-slate-400">Your competitive standing in the Arena.</p>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 font-semibold uppercase tracking-widest">Current Rating</span>
            <span className="text-3xl font-black text-white">{o.rating || 1000}</span>
          </div>
          <RankBadge rank={o.rank || "Beginner"} className="mt-2 text-sm px-4 py-1" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Link href="/play/online" className="w-full">
          <Button variant="gaming" className="w-full h-16 text-lg gap-3">
            <Users className="w-5 h-5" /> Play Online
          </Button>
        </Link>
        
        <Link href="/play" className="w-full">
          <Button variant="secondary" className="w-full h-16 text-lg gap-3 border border-slate-700 hover:border-slate-500">
            <Target className="w-5 h-5" /> Play vs AI
          </Button>
        </Link>
        
        <Link href="/leaderboard" className="w-full">
          <Button variant="outline" className="w-full h-16 text-lg gap-3 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10">
            <Trophy className="w-5 h-5" /> Leaderboard
          </Button>
        </Link>
        
        <div className="flex gap-2 w-full">
          <Link href="/history" className="w-full flex-1">
            <Button variant="outline" className="w-full h-16 gap-2">
              <History className="w-4 h-4" /> History
            </Button>
          </Link>
          <Link href="/stats" className="w-full flex-1">
            <Button variant="outline" className="w-full h-16 gap-2">
              <BarChart2 className="w-4 h-4" /> Stats
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-4 text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" /> Performance Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard title="Games" value={o.games_played || 0} icon={Gamepad2} description="Total Matches" />
              <StatCard title="Win Rate" value={`${o.win_rate || 0}%`} icon={Trophy} description="Overall" />
              <StatCard title="Wins" value={o.wins || 0} icon={Target} description="Victories" />
              <StatCard title="Streak" value={o.current_streak || 0} icon={TrendingUp} description={`Best: ${o.best_streak || 0}`} />
            </div>
          </div>
          
          <div>
             <h2 className="text-xl font-bold tracking-tight mb-4 text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" /> Recent Achievements
            </h2>
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="py-8 flex flex-col items-center justify-center text-slate-500">
                 <Link href="/achievements">
                    <Button variant="link" className="text-primary">View all achievements</Button>
                 </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Recent Matches */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" /> Recent Matches
            </h2>
            <Link href="/history" className="text-xs text-primary hover:underline">View All</Link>
          </div>
          
          <div className="flex flex-col gap-3">
            {recent.length === 0 ? (
              <Card className="border-slate-800 bg-slate-900/40">
                <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Swords className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No matches yet</p>
                </CardContent>
              </Card>
            ) : (
              recent.map((m: any) => {
                const isWinner = m.winner_id === user?.id;
                const isDraw = m.result === "draw";
                
                return (
                  <div key={m.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-10 rounded-full ${isDraw ? 'bg-slate-500' : isWinner ? 'bg-success' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-bold text-sm text-white capitalize">{m.game_mode} Match</p>
                        <p className="text-xs text-slate-400">{new Date(m.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={`font-bold uppercase tracking-widest text-xs ${isDraw ? 'text-slate-400' : isWinner ? 'text-success' : 'text-red-500'}`}>
                         {isDraw ? 'Draw' : isWinner ? 'Victory' : 'Defeat'}
                       </span>
                       <p className="text-xs text-slate-500 mt-1">{m.moves || 0} Moves</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
