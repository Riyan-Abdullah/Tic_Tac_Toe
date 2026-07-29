"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, Trophy, Swords, UserPlus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        try {
          const res = await fetch(`${API_URL}/notifications/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setNotifications(data.notifications || []);
          }
        } catch(e) {
          console.error(e);
        }
      }
    };
    fetchNotifications();
  }, [supabase]);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/notifications/read/${id}`, { method: "POST" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } catch(e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    if (!user) return;
    try {
      await fetch(`${API_URL}/notifications/read-all/${user.id}`, { method: "POST" });
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    } catch(e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
     if (type === 'friend_request') return <UserPlus className="w-4 h-4 text-primary" />;
     if (type === 'tournament') return <Trophy className="w-4 h-4 text-yellow-500" />;
     return <Bell className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A0A0A]" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
             <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
                <h3 className="font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                    Mark all as read
                  </button>
                )}
             </div>
             
             <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No new notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => !n.read_at && markAsRead(n.id)}
                      className={`flex gap-3 p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-pointer ${n.read_at ? 'opacity-60' : 'bg-slate-800/20'}`}
                    >
                       <div className="shrink-0 mt-1">
                          {getIcon(n.type)}
                       </div>
                       <div className="flex-1">
                          <h4 className={`text-sm font-bold ${n.read_at ? 'text-slate-300' : 'text-white'}`}>{n.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-500 block mt-2">
                             {new Date(n.created_at).toLocaleString()}
                          </span>
                       </div>
                       {!n.read_at && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
                    </div>
                  ))
                )}
             </div>
          </div>
        </>
      )}
    </div>
  );
}
