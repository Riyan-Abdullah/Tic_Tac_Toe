"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Trophy, Users, Search, Plus, Calendar, Swords } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [showCreate, setShowCreate] = useState(false);
  const [newTName, setNewTName] = useState("");
  const [newTDesc, setNewTDesc] = useState("");
  
  const supabase = createClient();

  const fetchTournaments = async () => {
    try {
      const res = await fetch(`${API_URL}/tournaments`);
      if (res.ok) {
         const data = await res.json();
         setTournaments(data.tournaments || []);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       setUser(user);
       fetchTournaments();
    };
    init();
  }, [supabase]);

  const handleCreate = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!user || !newTName.trim()) return;
     
     try {
       const res = await fetch(`${API_URL}/tournaments/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
             name: newTName,
             description: newTDesc,
             creator_id: user.id
          })
       });
       
       if (res.ok) {
          toast.success("Tournament created!");
          setShowCreate(false);
          setNewTName("");
          setNewTDesc("");
          fetchTournaments();
       } else {
          toast.error("Failed to create tournament.");
       }
     } catch(err) {
       toast.error("Error creating tournament.");
     }
  };

  const handleJoin = async (id: string) => {
     if (!user) {
        toast.error("Must be logged in to join");
        return;
     }
     
     try {
       const res = await fetch(`${API_URL}/tournaments/${id}/join/${user.id}`, { method: "POST" });
       if (res.ok) {
          toast.success("Joined tournament!");
          fetchTournaments();
       } else {
          const d = await res.json();
          toast.error(d.detail || "Failed to join");
       }
     } catch(err) {
       toast.error("Error joining tournament.");
     }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Tournaments</h1>
            <p className="text-slate-400">Compete in bracket-style events for glory.</p>
          </div>
        </div>
        
        <Button variant="gaming" onClick={() => setShowCreate(!showCreate)} className="gap-2">
           <Plus className="w-5 h-5" /> Create Tournament
        </Button>
      </div>
      
      {showCreate && (
         <Card className="mb-8 bg-slate-900/60 border-slate-800">
            <CardContent className="p-6">
               <h2 className="font-bold text-lg mb-4 text-white">New Tournament</h2>
               <form onSubmit={handleCreate} className="flex flex-col gap-4">
                  <Input 
                    placeholder="Tournament Name" 
                    value={newTName} 
                    onChange={e => setNewTName(e.target.value)}
                    className="bg-black/50 border-slate-700"
                  />
                  <Input 
                    placeholder="Description (optional)" 
                    value={newTDesc} 
                    onChange={e => setNewTDesc(e.target.value)}
                    className="bg-black/50 border-slate-700"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                     <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                     <Button type="submit" variant="gaming">Launch</Button>
                  </div>
               </form>
            </CardContent>
         </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {tournaments.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">
               No tournaments active. Create one!
            </div>
         ) : (
            tournaments.map(t => (
               <Card key={t.id} className="bg-slate-900/40 border-slate-800 hover:border-slate-700 transition-colors">
                  <CardContent className="p-6 flex flex-col h-full">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <h3 className="font-bold text-lg text-white mb-1">{t.name}</h3>
                           <p className="text-xs text-slate-400">{t.description || "No description provided."}</p>
                        </div>
                        <span className="uppercase text-[10px] font-bold tracking-widest bg-primary/20 text-primary px-2 py-1 rounded-full">
                           {t.status}
                        </span>
                     </div>
                     
                     <div className="flex items-center gap-4 text-sm text-slate-300 mb-6 flex-1">
                        <div className="flex items-center gap-1"><Users className="w-4 h-4 text-slate-500" /> Max {t.max_players}</div>
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-slate-500" /> {new Date(t.created_at).toLocaleDateString()}</div>
                     </div>
                     
                     <div className="flex gap-2 w-full mt-auto">
                        <Button 
                           variant="gaming" 
                           onClick={() => handleJoin(t.id)} 
                           disabled={t.status !== 'upcoming'}
                           className="w-full flex-1"
                        >
                           Join
                        </Button>
                        <Button variant="outline" className="w-full flex-1 gap-2">
                           <Swords className="w-4 h-4" /> Bracket
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            ))
         )}
      </div>
    </div>
  );
}
