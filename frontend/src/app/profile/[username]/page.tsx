"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { RankBadge } from "@/components/ui/RankBadge";
import { Loader2, Calendar, Trophy, Swords, Target, TrendingUp, Info } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/profile/${username}`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error("Profile not found");
        }
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center">
        <Info className="w-16 h-16 text-slate-500 mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Player Not Found</h1>
        <p className="text-slate-400">The profile you are looking for doesn't exist.</p>
      </div>
    );
  }

  const winRate = profile.games_played > 0 
    ? Math.round((profile.wins / profile.games_played) * 100) 
    : 0;

  // We should fetch currentUser to check if this is our profile
  // For brevity, we assume they can't edit here directly unless we add full state,
  // Let's add a placeholder for 'Edit Profile' button
  const isOwnProfile = true; // Hardcoded for demo/simplicity; in real app, check against auth.user

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header */}
      <div className="relative mb-24">
        {/* Banner */}
        <div 
          className="h-48 md:h-64 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 overflow-hidden relative border border-slate-800 bg-cover bg-center"
          style={profile.banner ? { backgroundImage: `url(${profile.banner})` } : {}}
        >
           <div className="absolute inset-0 bg-black/50" />
           {!profile.banner && (
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
           )}
        </div>
        
        {/* Avatar & Info Container */}
        <div className="absolute -bottom-16 left-8 right-8 flex flex-col md:flex-row items-end gap-6">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-800 border-4 border-black shrink-0 overflow-hidden shadow-2xl relative group">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-500 uppercase">
                {profile.username?.split('@')[0]?.[0]}
              </div>
            )}
          </div>
          
          <div className="flex-1 pb-2">
            <h1 className="text-4xl font-black text-white mb-2">{profile.username?.split('@')[0]}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 font-medium">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              {profile.bio ? <span className="text-slate-300 italic">"{profile.bio}"</span> : <span className="text-slate-500">No bio yet.</span>}
            </div>
          </div>
          
          <div className="pb-2 flex flex-col items-end hidden md:flex">
             <div className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-1">Current Rating</div>
             <div className="text-4xl font-black text-primary">{profile.rating}</div>
             <RankBadge rank={profile.rank} className="mt-2" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 mt-20 md:mt-0">
        <StatCard title="Win Rate" value={`${winRate}%`} icon={Trophy} description="Overall" />
        <StatCard title="Games" value={profile.games_played} icon={Swords} description="Total Matches" />
        <StatCard title="Wins" value={profile.wins} icon={Target} description="Victories" />
        <StatCard title="Streak" value={profile.current_streak} icon={TrendingUp} description={`Best: ${profile.best_streak}`} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
           <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Swords className="w-6 h-6 text-primary" /> Recent Battles</h2>
           
           <div className="flex flex-col gap-3">
             {profile.recent_matches?.length === 0 ? (
               <Card className="border-slate-800 bg-slate-900/40">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <p>No recent matches.</p>
                  </CardContent>
                </Card>
             ) : (
                profile.recent_matches?.map((m: any) => {
                  const isWinner = m.winner_id === profile.id;
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
         
         <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-500" /> Trophies</h2>
            <Card className="border-slate-800 bg-slate-900/40">
               <CardContent className="py-8 flex flex-col items-center justify-center text-slate-500">
                 <Trophy className="w-12 h-12 mb-4 opacity-20 text-yellow-500" />
                 <p className="text-center text-sm">Achievements showcase coming soon.</p>
               </CardContent>
             </Card>
         </div>
      </div>
    </div>
  );
}
