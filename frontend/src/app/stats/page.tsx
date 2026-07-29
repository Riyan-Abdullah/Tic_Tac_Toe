"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, BarChart2, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const res = await fetch(`${API_URL}/stats/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setStats(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const o = stats?.overview || {};
  const adv = stats?.advanced || {};

  // Chart Data preparation
  const winRateData = [
    { name: "Wins", value: o.wins || 0 },
    { name: "Losses", value: o.losses || 0 },
    { name: "Draws", value: o.draws || 0 },
  ];
  const COLORS = ["#10b981", "#ef4444", "#64748b"];

  // Mocking weekly progression based on recent matches for demonstration
  // In a full production app, the backend would group this by date.
  const recent = stats?.recent_matches || [];
  let currentRating = o.rating || 1000;
  
  // Reconstruct rating history backwards
  const ratingHistory = recent.slice().reverse().map((m: any, index: number) => {
      const isWinner = m.winner_id === m.player_x || m.winner_id === m.player_o; // Simplification for chart demo
      const rating = currentRating;
      currentRating -= isWinner ? 30 : -25; // reverse Elo shift
      return {
          name: `Match ${index + 1}`,
          rating: rating
      }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
          <BarChart2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Advanced Analytics</h1>
          <p className="text-slate-400">Deep dive into your competitive performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
             <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-2">Avg Duration</div>
             <div className="text-3xl font-black text-white">{adv.average_duration || 0}s</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
             <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-2">Avg Moves</div>
             <div className="text-3xl font-black text-white">{adv.average_moves || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
             <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-2">Fastest Win</div>
             <div className="text-3xl font-black text-primary">{adv.fastest_victory ? `${adv.fastest_victory}s` : '--'}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
             <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-2">Fav Mode</div>
             <div className="text-3xl font-black text-white uppercase">{adv.favorite_mode || 'None'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Rating Trend Line Chart */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Rating Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             {ratingHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ratingHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} domain={['auto', 'auto']} />
                    <RechartsTooltip 
                       contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                       itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Line type="monotone" dataKey="rating" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4, fill: '#D4AF37' }} />
                  </LineChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-full text-slate-500">Not enough data to display trend.</div>
             )}
          </CardContent>
        </Card>

        {/* Win/Loss Pie Chart */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" /> Match Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {o.games_played > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winRateData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {winRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                       contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                       itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">Play matches to see outcomes.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
