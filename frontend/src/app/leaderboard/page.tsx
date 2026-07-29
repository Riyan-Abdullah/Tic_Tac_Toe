"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { RankBadge } from "@/components/ui/RankBadge";
import { Loader2, Trophy, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  // Pagination
  const limit = 50;
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const offset = (page - 1) * limit;
        const res = await fetch(`${API_URL}/leaderboard?limit=${limit}&offset=${offset}&sort_by=${sortBy}`);
        if (res.ok) {
          const data = await res.json();
          setPlayers(data.players || []);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [page, sortBy]);

  const filteredPlayers = players.filter(p => p.username?.toLowerCase().includes(search.toLowerCase()));
  const top3 = filteredPlayers.slice(0, 3);
  const rest = filteredPlayers.slice(3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white flex items-center justify-center gap-4">
          <Trophy className="w-10 h-10 text-yellow-500" />
          Global Leaderboard
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">Climb the ranks and claim your spot among the Legends of TicTac Arena.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between glass cyber-border p-5 rounded-2xl z-20 relative">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/70 group-focus-within:text-primary transition-colors" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search players..."
            className="pl-10 bg-[#0A0F1E]/80 border-primary/30 w-full text-white placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-primary focus-visible:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-end">
          <Button variant={sortBy === 'rating' ? 'gaming' : 'outline'} onClick={() => setSortBy('rating')} size="sm" className="whitespace-nowrap">Rating</Button>
          <Button variant={sortBy === 'wins' ? 'gaming' : 'outline'} onClick={() => setSortBy('wins')} size="sm" className="whitespace-nowrap">Wins</Button>
          <Button variant={sortBy === 'win_rate' ? 'gaming' : 'outline'} onClick={() => setSortBy('win_rate')} size="sm" className="whitespace-nowrap">Win Rate</Button>
          <Button variant={sortBy === 'games_played' ? 'gaming' : 'outline'} onClick={() => setSortBy('games_played')} size="sm" className="whitespace-nowrap">Games</Button>
        </div>
      </div>

      {loading && players.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Top 3 Podium (Only show if on page 1 and no search or matching search) */}
          {page === 1 && top3.length > 0 && (
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 mb-16 pt-10">
              {/* Rank 2 - Silver */}
              {top3[1] && (
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="order-2 md:order-1 flex flex-col items-center">
                  <div className="text-xl font-bold text-slate-300 mb-2">#2</div>
                  <Card className="w-40 h-48 bg-slate-800/80 border-slate-400/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.8)]" />
                    <div className="w-16 h-16 rounded-full bg-slate-700 mb-3 overflow-hidden border-2 border-slate-400">
                      {top3[1].avatar ? <img src={top3[1].avatar} alt="avatar" /> : null}
                    </div>
                    <Link href={`/profile/${top3[1].username}`} className="font-bold text-sm truncate w-full text-center hover:text-primary">{top3[1].username}</Link>
                    <div className="text-primary font-black mt-1">{top3[1].rating}</div>
                  </Card>
                </motion.div>
              )}

              {/* Rank 1 - Gold */}
              {top3[0] && (
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="order-1 md:order-2 flex flex-col items-center z-10 md:-translate-y-8">
                  <div className="text-3xl font-black text-yellow-400 mb-2 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">#1</div>
                  <Card className="w-48 h-56 bg-gradient-to-b from-yellow-900/40 to-slate-900 border-yellow-500 flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                    <div className="absolute top-0 w-full h-2 bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,1)]" />
                    <Trophy className="absolute top-2 right-2 w-5 h-5 text-yellow-500/50" />
                    <div className="w-20 h-20 rounded-full bg-slate-800 mb-3 overflow-hidden border-4 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                      {top3[0].avatar ? <img src={top3[0].avatar} alt="avatar" /> : null}
                    </div>
                    <Link href={`/profile/${top3[0].username}`} className="font-extrabold text-lg truncate w-full text-center text-white hover:text-primary">{top3[0].username}</Link>
                    <div className="text-yellow-400 font-black text-xl mt-1">{top3[0].rating}</div>
                  </Card>
                </motion.div>
              )}

              {/* Rank 3 - Bronze */}
              {top3[2] && (
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="order-3 md:order-3 flex flex-col items-center">
                  <div className="text-lg font-bold text-amber-600 mb-2">#3</div>
                  <Card className="w-36 h-40 bg-slate-900 border-amber-700/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.8)]" />
                    <div className="w-12 h-12 rounded-full bg-slate-800 mb-3 overflow-hidden border-2 border-amber-700">
                      {top3[2].avatar ? <img src={top3[2].avatar} alt="avatar" /> : null}
                    </div>
                    <Link href={`/profile/${top3[2].username}`} className="font-bold text-xs truncate w-full text-center hover:text-primary">{top3[2].username}</Link>
                    <div className="text-primary font-black mt-1 text-sm">{top3[2].rating}</div>
                  </Card>
                </motion.div>
              )}
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="w-full overflow-x-auto bg-slate-900/60 rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400 text-sm uppercase tracking-widest">
                  <th className="p-4 font-semibold w-16 text-center">Rank</th>
                  <th className="p-4 font-semibold">Player</th>
                  <th className="p-4 font-semibold">Rating</th>
                  <th className="p-4 font-semibold hidden md:table-cell">Tier</th>
                  <th className="p-4 font-semibold hidden sm:table-cell">Win Rate</th>
                  <th className="p-4 font-semibold hidden lg:table-cell">Games</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((p, idx) => {
                  const currentRank = (page - 1) * limit + (page === 1 ? idx + 4 : idx + 1);
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="p-4 text-center font-mono text-slate-500">{currentRank}</td>
                      <td className="p-4">
                        <Link href={`/profile/${p.username}`} className="flex items-center gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 overflow-hidden shrink-0">
                            {p.avatar && <img src={p.avatar} alt="avatar" className="w-full h-full object-cover" />}
                          </div>
                          <span className="font-bold text-white group-hover:text-primary transition-colors">{p.username}</span>
                        </Link>
                      </td>
                      <td className="p-4 font-black text-primary">{p.rating}</td>
                      <td className="p-4 hidden md:table-cell"><RankBadge rank={p.rank} /></td>
                      <td className="p-4 hidden sm:table-cell text-slate-300">{p.win_rate}%</td>
                      <td className="p-4 hidden lg:table-cell text-slate-400">{p.games_played}</td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>

            {filteredPlayers.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                No players found.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-8">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <span className="text-slate-400 text-sm">Page {page}</span>
            <Button variant="outline" disabled={players.length < limit} onClick={() => setPage(p => p + 1)} className="gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
