"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Loader2, Award, Trophy, Shield, Flame, Crown, Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const IconMap: Record<string, any> = {
  Trophy: Trophy,
  Shield: Shield,
  Flame: Flame,
  Crown: Crown,
  Award: Award
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const res = await fetch(`${API_URL}/achievements/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setAchievements(data.achievements || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch achievements", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAchievements();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white flex items-center justify-center gap-4">
          <Award className="w-10 h-10 text-yellow-500" />
          Achievements
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto mb-6">Complete challenges to earn points and showcase your skills.</p>
        
        {/* Progress Bar */}
        <div className="max-w-xl mx-auto bg-slate-900 rounded-full h-4 border border-slate-800 overflow-hidden relative">
           <div 
             className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]"
             style={{ width: `${progress}%` }}
           />
        </div>
        <p className="text-sm text-slate-400 mt-2 font-medium">
          {unlockedCount} / {totalCount} Unlocked ({Math.round(progress)}%)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach) => {
          const Icon = IconMap[ach.icon] || Award;
          const isUnlocked = ach.unlocked;
          
          return (
            <Card key={ach.id} className={`border ${isUnlocked ? 'border-yellow-500/50 bg-gradient-to-br from-slate-900 to-yellow-900/10' : 'border-slate-800 bg-slate-900/50 grayscale hover:grayscale-0 transition-all duration-500'}`}>
              <CardContent className="p-6 flex gap-4 items-center">
                <div className={`p-4 rounded-xl flex items-center justify-center shrink-0 ${isUnlocked ? 'bg-yellow-500/20 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-slate-800 text-slate-500'}`}>
                  {isUnlocked ? <Icon className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg mb-1 ${isUnlocked ? 'text-yellow-500' : 'text-slate-300'}`}>{ach.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">{ach.description}</p>
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-black tracking-widest text-primary">+{ach.points} PTS</span>
                     {isUnlocked && <span className="text-[10px] text-slate-500">{new Date(ach.unlocked_at).toLocaleDateString()}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
