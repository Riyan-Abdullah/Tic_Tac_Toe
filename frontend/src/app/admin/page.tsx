"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShieldAlert, Users, Trophy, Gamepad2, ShieldCheck, Flag } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) {
          router.push("/login");
          return;
       }
       setUser(user);
       
       try {
         // Verify admin
         const adminRes = await supabase.from("admins").select("*").eq("user_id", user.id);
         if (!adminRes.data || adminRes.data.length === 0) {
            router.push("/");
            return;
         }
         
         const [statsRes, repRes] = await Promise.all([
            fetch(`${API_URL}/admin/dashboard?user_id=${user.id}`),
            fetch(`${API_URL}/admin/reports?user_id=${user.id}`)
         ]);
         
         if (statsRes.ok) setStats(await statsRes.json());
         if (repRes.ok) {
            const data = await repRes.json();
            setReports(data.reports || []);
         }
       } catch(err) {
         console.error(err);
       } finally {
         setLoading(false);
       }
    };
    init();
  }, [supabase, router]);

  const resolveReport = async (id: string) => {
     try {
       const res = await fetch(`${API_URL}/admin/reports/${id}/resolve?user_id=${user?.id}`, { method: "POST" });
       if (res.ok) {
          toast.success("Report resolved.");
          setReports(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" } : r));
       }
     } catch(err) {
       toast.error("Error resolving report.");
     }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Admin...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-red-900/50 rounded-xl border border-red-500/50 text-red-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">System Admin</h1>
          <p className="text-slate-400">Platform overview and moderation.</p>
        </div>
      </div>
      
      {stats && (
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="bg-slate-900/40 border-slate-800">
               <CardContent className="p-6 flex flex-col items-center">
                  <Users className="w-8 h-8 text-blue-500 mb-2" />
                  <div className="text-3xl font-bold text-white">{stats.total_users}</div>
                  <div className="text-sm text-slate-500">Total Users</div>
               </CardContent>
            </Card>
            <Card className="bg-slate-900/40 border-slate-800">
               <CardContent className="p-6 flex flex-col items-center">
                  <Gamepad2 className="w-8 h-8 text-primary mb-2" />
                  <div className="text-3xl font-bold text-white">{stats.total_matches}</div>
                  <div className="text-sm text-slate-500">Matches Played</div>
               </CardContent>
            </Card>
            <Card className="bg-slate-900/40 border-slate-800">
               <CardContent className="p-6 flex flex-col items-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
                  <div className="text-3xl font-bold text-white">{stats.total_tournaments}</div>
                  <div className="text-sm text-slate-500">Tournaments</div>
               </CardContent>
            </Card>
            <Card className="bg-slate-900/40 border-slate-800 border-red-500/20">
               <CardContent className="p-6 flex flex-col items-center">
                  <Flag className="w-8 h-8 text-red-500 mb-2" />
                  <div className="text-3xl font-bold text-red-500">{stats.pending_reports}</div>
                  <div className="text-sm text-red-500/70">Pending Reports</div>
               </CardContent>
            </Card>
         </div>
      )}
      
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
         <ShieldCheck className="w-6 h-6 text-primary" /> Active Reports
      </h2>
      
      <Card className="bg-slate-900/40 border-slate-800">
         <CardContent className="p-0">
            {reports.length === 0 ? (
               <div className="p-8 text-center text-slate-500">No active reports. Good job!</div>
            ) : (
               <div className="divide-y divide-slate-800">
                  {reports.map(r => (
                     <div key={r.id} className="p-6 flex justify-between items-center hover:bg-slate-800/30 transition-colors">
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 text-xs rounded uppercase font-bold ${r.status === 'resolved' ? 'bg-success/20 text-success' : 'bg-red-500/20 text-red-500'}`}>
                                 {r.status}
                              </span>
                              <span className="text-slate-400 text-sm">{new Date(r.created_at).toLocaleString()}</span>
                           </div>
                           <p className="text-white font-bold mb-1">
                              {r.reporter.username} <span className="text-slate-500 font-normal">reported</span> {r.reported.username}
                           </p>
                           <p className="text-slate-400 text-sm">"{r.reason}"</p>
                        </div>
                        {r.status === 'pending' && (
                           <Button onClick={() => resolveReport(r.id)} variant="outline" className="border-success/50 text-success hover:bg-success/20">
                              Resolve
                           </Button>
                        )}
                     </div>
                  ))}
               </div>
            )}
         </CardContent>
      </Card>
    </div>
  );
}
