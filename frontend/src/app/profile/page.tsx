"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User, Mail, Calendar, Settings } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        try {
          const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
          if (data && !error) {
            setProfile(data);
          }
        } catch(err) {
          console.error(err);
        }
      }
      setLoading(false);
    };
    getUser();
  }, [supabase]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 flex justify-center">
        <Skeleton className="h-[400px] w-full max-w-md rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return null; // Handled by middleware
  }

  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Player Profile</h1>
        <p className="text-slate-400">Manage your account settings and preferences.</p>
      </div>

      <Card className="glass overflow-hidden">
        <div 
          className="h-32 bg-gradient-to-r from-slate-800 via-primary/20 to-slate-800 bg-cover bg-center relative"
          style={profile?.banner ? { backgroundImage: `url(${profile.banner})` } : {}}
        >
          {profile?.banner && <div className="absolute inset-0 bg-black/30" />}
        </div>
        <CardContent className="px-6 sm:px-10 pb-10 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-8 relative z-10">
            <div className="h-32 w-32 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center shadow-xl overflow-hidden group">
              {profile?.avatar ? (
                 <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                 <User className="h-16 w-16 text-slate-400 group-hover:text-primary transition-colors" />
              )}
            </div>
            <div className="text-center sm:text-left mb-2">
              <h2 className="text-2xl font-bold">{(user.user_metadata?.username || "Player").split('@')[0]}</h2>
              <p className="text-primary font-medium">{profile?.bio || "TicTac Contender"}</p>
            </div>
            <div className="sm:ml-auto">
              <Link href="/settings">
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" /> Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-1">
                <Mail className="h-4 w-4" /> Email Address
              </div>
              <p className="bg-slate-900/50 p-3 rounded-md text-slate-200 border border-slate-800">
                {user.email}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-1">
                <Calendar className="h-4 w-4" /> Joined Date
              </div>
              <p className="bg-slate-900/50 p-3 rounded-md text-slate-200 border border-slate-800">
                {joinDate}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-900/50 border-t border-slate-800 px-6 sm:px-10 py-4">
          <form action="/auth/signout" method="post" className="w-full flex justify-end">
            <Button variant="destructive">
              Logout
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
