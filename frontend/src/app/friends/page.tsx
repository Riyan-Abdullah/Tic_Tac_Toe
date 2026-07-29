"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Users, Search, UserPlus, MessageSquare, UserMinus, ShieldAlert, Check, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addUsername, setAddUsername] = useState("");
  const [user, setUser] = useState<any>(null);
  
  const supabase = createClient();

  const fetchFriendsAndRequests = async (uid: string) => {
      try {
        const [friendsRes, requestsRes] = await Promise.all([
           fetch(`${API_URL}/friends/${uid}`),
           fetch(`${API_URL}/friends/requests/${uid}`)
        ]);
        
        if (friendsRes.ok) {
           const d = await friendsRes.json();
           setFriends(d.friends || []);
        }
        
        if (requestsRes.ok) {
           const d = await requestsRes.json();
           setRequests(d.requests || []);
        }
      } catch(err) {
        console.error("Failed to fetch friends", err);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) {
         fetchFriendsAndRequests(currentUser.id);
      }
    };
    init();
  }, [supabase]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsername.trim() || !user) return;
    
    // First, lookup user by username
    const { data: profiles } = await supabase.from("profiles").select("id").eq("username", addUsername.trim());
    if (!profiles || profiles.length === 0) {
       toast.error("User not found!");
       return;
    }
    
    const receiverId = profiles[0].id;
    
    try {
      const res = await fetch(`${API_URL}/friends/requests/send/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: receiverId })
      });
      
      if (res.ok) {
         toast.success("Friend request sent!");
         setAddUsername("");
      } else {
         const data = await res.json();
         toast.error(data.detail || "Failed to send request.");
      }
    } catch(err) {
      toast.error("An error occurred.");
    }
  };

  const handleRequestAction = async (requestId: string, status: string) => {
     try {
       const res = await fetch(`${API_URL}/friends/requests/handle/${requestId}`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ status })
       });
       
       if (res.ok) {
          toast.success(`Request ${status}!`);
          if (user) fetchFriendsAndRequests(user.id);
       } else {
          toast.error("Failed to update request.");
       }
     } catch(err) {
       toast.error("An error occurred.");
     }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
     if (!confirm("Are you sure you want to remove this friend?")) return;
     
     try {
       const res = await fetch(`${API_URL}/friends/${friendshipId}`, { method: "DELETE" });
       if (res.ok) {
          toast.success("Friend removed.");
          if (user) fetchFriendsAndRequests(user.id);
       }
     } catch(err) {
       toast.error("Failed to remove friend.");
     }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const filteredFriends = friends.filter(f => f.username?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Friends</h1>
          <p className="text-slate-400">Manage your connections and find players to play with.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            {/* Search Friends */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search friends..."
                className="pl-10 bg-slate-900/50 border-slate-800 h-12 text-lg"
              />
            </div>
            
            {/* Friends List */}
            <div className="space-y-4">
              {filteredFriends.length === 0 ? (
                 <div className="text-center py-12 text-slate-500">
                   {search ? "No friends found matching your search." : "You haven't added any friends yet."}
                 </div>
              ) : (
                 filteredFriends.map((f, idx) => (
                    <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: idx * 0.05 }}
                       key={f.id} 
                       className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                    >
                       <Link href={`/profile/${f.username}`} className="flex items-center gap-4 group">
                          <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden border-2 border-transparent group-hover:border-primary transition-all">
                             {f.avatar && <img src={f.avatar} alt="Avatar" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                             <h3 className="font-bold text-white group-hover:text-primary transition-colors">{f.username}</h3>
                             <div className="text-xs text-slate-400">Rating: <span className="text-primary font-bold">{f.rating}</span></div>
                          </div>
                       </Link>
                       <div className="flex gap-2">
                          <Link href={`/chat?user=${f.id}`}>
                            <Button variant="outline" size="sm" className="gap-2 bg-slate-800 hover:bg-slate-700 border-none">
                              <MessageSquare className="w-4 h-4" /> Message
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => handleRemoveFriend(f.friendship_id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 border-slate-700">
                            <UserMinus className="w-4 h-4" />
                          </Button>
                       </div>
                    </motion.div>
                 ))
              )}
            </div>
         </div>
         
         <div className="space-y-8">
            {/* Add Friend */}
            <Card className="bg-slate-900/40 border-slate-800">
              <CardContent className="p-6">
                 <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <UserPlus className="w-5 h-5 text-primary" /> Add Friend
                 </h2>
                 <form onSubmit={handleSendRequest} className="flex gap-2">
                    <Input 
                      placeholder="Username..." 
                      value={addUsername} 
                      onChange={(e) => setAddUsername(e.target.value)}
                      className="bg-black/50 border-slate-700"
                    />
                    <Button type="submit" variant="gaming">Send</Button>
                 </form>
              </CardContent>
            </Card>
            
            {/* Pending Requests */}
            <Card className="bg-slate-900/40 border-slate-800">
              <CardContent className="p-6">
                 <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <ShieldAlert className="w-5 h-5 text-yellow-500" /> Pending Requests
                 </h2>
                 
                 <div className="space-y-3">
                   {requests.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No pending requests.</p>
                   ) : (
                      requests.map(r => (
                         <div key={r.id} className="flex flex-col gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden shrink-0">
                                 {r.sender.avatar && <img src={r.sender.avatar} alt="Avatar" className="w-full h-full object-cover" />}
                               </div>
                               <div className="flex-1 min-w-0">
                                 <div className="font-bold text-sm text-white truncate">{r.sender.username}</div>
                                 <div className="text-xs text-slate-400">Rating: {r.sender.rating}</div>
                               </div>
                            </div>
                            <div className="flex gap-2 w-full">
                               <Button size="sm" onClick={() => handleRequestAction(r.id, 'accepted')} className="flex-1 bg-success hover:bg-success/80 text-white font-bold h-8">
                                 <Check className="w-4 h-4 mr-1" /> Accept
                               </Button>
                               <Button size="sm" onClick={() => handleRequestAction(r.id, 'rejected')} variant="outline" className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10 h-8">
                                 <X className="w-4 h-4 mr-1" /> Reject
                               </Button>
                            </div>
                         </div>
                      ))
                   )}
                 </div>
              </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
