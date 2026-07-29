"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader2, Send, MessageSquare, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

function ChatContent() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [user, setUser] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get("user");
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
         setUser(session.user);
         
         // Fetch Friends
         const friendsRes = await fetch(`${API_URL}/friends/${session.user.id}`);
         if (friendsRes.ok) {
            const fd = await friendsRes.json();
            setFriends(fd.friends || []);
         }
         
         // Connect WS
         wsRef.current = new WebSocket(`${WS_URL}/ws/global?token=${session.access_token}`);
         wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "new_message") {
               setMessages(prev => [...prev, data.message]);
            }
         };
         
         // Fetch Chat History if a user is selected
         if (selectedUserId) {
            fetchHistory(session.user.id, selectedUserId);
         } else {
            setLoading(false);
         }
      }
    };
    init();
    
    return () => {
       if (wsRef.current) wsRef.current.close();
    };
  }, [supabase, selectedUserId]);

  const fetchHistory = async (myId: string, otherId: string) => {
      setLoading(true);
      try {
         const res = await fetch(`${API_URL}/chat/history?user_id=${myId}&other_user_id=${otherId}`);
         if (res.ok) {
            const d = await res.json();
            setMessages(d.messages || []);
         }
      } catch(err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
  };

  const sendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim() || !selectedUserId || !user) return;
      
      const payload = {
         receiver_id: selectedUserId,
         content: content,
         type: "direct"
      };
      
      setContent(""); // optimistic clear
      
      try {
         const res = await fetch(`${API_URL}/chat/send?user_id=${user.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
         });
         if (res.ok) {
            const d = await res.json();
            // WS will broadcast to receiver, but for sender we manually append since WS might not echo back to sender in our logic
            if (d.message.sender_id === user.id) {
                setMessages(prev => [...prev, d.message]);
            }
         }
      } catch(err) {
         console.error(err);
      }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
       <div className="flex items-center gap-4 mb-6 shrink-0">
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
          <MessageSquare className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Messages</h1>
        </div>
      </div>
      
      <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
         {/* Contacts Sidebar */}
         <Card className="w-1/3 bg-slate-900/40 border-slate-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800">
               <h2 className="font-bold text-slate-300">Friends</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
               {friends.length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-8">No friends yet.</div>
               ) : (
                  friends.map(f => (
                     <a 
                       key={f.id} 
                       href={`/chat?user=${f.id}`}
                       className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedUserId === f.id ? 'bg-slate-800/80 border border-slate-700' : 'hover:bg-slate-800/40 border border-transparent'}`}
                     >
                        <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden shrink-0">
                           {f.avatar ? <img src={f.avatar} alt="avatar" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-slate-400" />}
                        </div>
                        <div className="font-bold text-sm text-white truncate">{f.username}</div>
                     </a>
                  ))
               )}
            </div>
         </Card>
         
         {/* Chat Area */}
         <Card className="flex-1 bg-slate-900/60 border-slate-800 flex flex-col overflow-hidden">
            {!selectedUserId ? (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                  <p>Select a friend to start chatting</p>
               </div>
            ) : loading ? (
               <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
               </div>
            ) : (
               <>
                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                     {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                           No messages yet. Say hi!
                        </div>
                     ) : (
                        messages.map(m => {
                           const isMe = m.sender_id === user?.id;
                           return (
                              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary text-black rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm'}`}>
                                    <div className="text-sm">{m.content}</div>
                                    <div className={`text-[10px] mt-1 ${isMe ? 'text-black/60 text-right' : 'text-slate-500'}`}>
                                       {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                 </div>
                              </div>
                           );
                        })
                     )}
                     <div ref={messagesEndRef} />
                  </div>
                  <div className="p-4 bg-slate-900 border-t border-slate-800">
                     <form onSubmit={sendMessage} className="flex gap-2">
                        <Input 
                           value={content}
                           onChange={e => setContent(e.target.value)}
                           placeholder="Type a message..." 
                           className="bg-black/50 border-slate-700 h-12"
                        />
                        <Button type="submit" variant="gaming" className="h-12 px-6">
                           <Send className="w-5 h-5" />
                        </Button>
                     </form>
                  </div>
               </>
            )}
         </Card>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ChatContent />
    </Suspense>
  );
}
