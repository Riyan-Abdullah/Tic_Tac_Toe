"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Settings, Volume2, Shield, Moon, Monitor, EyeOff, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
     theme: 'dark', sound_volume: 80, music_volume: 50, notifications_enabled: true, privacy: 'public'
  });
  const [profile, setProfile] = useState<any>({
     avatar: '', banner: '', bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
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
         // Fetch Settings
         const resSettings = await fetch(`${API_URL}/settings/${user.id}`);
         if (resSettings.ok) setSettings(await resSettings.json());

         // Fetch Profile
         const resProfile = await fetch(`${API_URL}/profile/${user.user_metadata?.username || user.email}`);
         if (resProfile.ok) {
           const pData = await resProfile.json();
           setProfile({ avatar: pData.avatar || '', banner: pData.banner || '', bio: pData.bio || '' });
         }
       } catch(err) {
         console.error(err);
       } finally {
         setLoading(false);
       }
    };
    init();
  }, [supabase, router]);

  const handleFileUpload = async (field: 'avatar' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
     if (!e.target.files || e.target.files.length === 0) return;
     const file = e.target.files[0];
     
     const formData = new FormData();
     formData.append("file", file);
     
     try {
       const res = await fetch(`${API_URL}/profile/upload`, {
         method: "POST",
         body: formData,
       });
       
       if (res.ok) {
         const data = await res.json();
         setProfile(prev => ({ ...prev, [field]: data.url }));
         toast.success(`${field} uploaded successfully.`);
       } else {
         toast.error(`Failed to upload ${field}.`);
       }
     } catch (err) {
       toast.error(`Error uploading ${field}.`);
     }
  };

  const handleSaveSettings = async () => {
     if (!user) return;
     setSaving(true);
     try {
       const res = await fetch(`${API_URL}/settings/${user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings)
       });
       if (res.ok) {
          localStorage.setItem('sound_volume', settings.sound_volume.toString())
          toast.success("Settings saved successfully.");
       } else {
          toast.error("Failed to save settings.");
       }
     } catch(err) {
       toast.error("Error saving settings.");
     } finally {
       setSaving(false);
     }
  };

  const handleSaveProfile = async () => {
     if (!user) return;
     setSavingProfile(true);
     try {
       const res = await fetch(`${API_URL}/profile/update/${user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile)
       });
       if (res.ok) {
          toast.success("Profile saved successfully.");
       } else {
          toast.error("Failed to save profile.");
       }
     } catch(err) {
       toast.error("Error saving profile.");
     } finally {
       setSavingProfile(false);
     }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Settings...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-slate-300">
          <Settings className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Settings</h1>
          <p className="text-slate-400">Manage your account preferences.</p>
        </div>
      </div>
      
      <div className="space-y-6">
         {/* Profile Customization */}
         <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6">
               <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-secondary" /> Profile Customization
               </h2>
               
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-300 mb-2">Avatar Image</label>
                     <div className="flex items-center gap-4">
                        {profile.avatar && (
                           <img src={profile.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-slate-700" />
                        )}
                        <input 
                           type="file"
                           accept="image/*"
                           onChange={(e) => handleFileUpload('avatar', e)}
                           className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-300 mb-2">Banner Image</label>
                     <div className="space-y-2">
                        {profile.banner && (
                           <img src={profile.banner} alt="Banner" className="w-full h-24 rounded-lg object-cover border border-slate-700" />
                        )}
                        <input 
                           type="file"
                           accept="image/*"
                           onChange={(e) => handleFileUpload('banner', e)}
                           className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                     <textarea 
                        rows={3}
                        placeholder="Tell the arena about yourself..."
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all resize-none"
                     ></textarea>
                  </div>
                  <div className="flex justify-end pt-2">
                     <Button onClick={handleSaveProfile} disabled={savingProfile} className="bg-secondary hover:bg-secondary/80 text-white shadow-[0_0_15px_rgba(255,0,127,0.4)]">
                        {savingProfile ? 'Saving...' : 'Save Profile'}
                     </Button>
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Audio Settings */}
         <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6">
               <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-primary" /> Audio & Sound
               </h2>
               
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between mb-2 text-sm text-slate-300">
                        <span>Master Volume</span>
                        <span>{settings.sound_volume}%</span>
                     </div>
                     <input 
                        type="range" min="0" max="100" 
                        value={settings.sound_volume}
                        onChange={(e) => setSettings({...settings, sound_volume: parseInt(e.target.value)})}
                        className="w-full accent-primary"
                     />
                  </div>
                  <div>
                     <div className="flex justify-between mb-2 text-sm text-slate-300">
                        <span>Music Volume</span>
                        <span>{settings.music_volume}%</span>
                     </div>
                     <input 
                        type="range" min="0" max="100" 
                        value={settings.music_volume}
                        onChange={(e) => setSettings({...settings, music_volume: parseInt(e.target.value)})}
                        className="w-full accent-primary"
                     />
                  </div>
                  <div className="flex justify-end pt-2">
                     <Button onClick={handleSaveSettings} disabled={saving} variant="gaming" className="px-6 py-2">
                        {saving ? 'Saving...' : 'Save Audio'}
                     </Button>
                  </div>
               </div>
            </CardContent>
         </Card>
         
         {/* Privacy */}
         <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="p-6">
               <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" /> Privacy & Security
               </h2>
               
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                     <div>
                        <div className="text-white font-bold">Profile Visibility</div>
                        <div className="text-sm text-slate-400">Who can see your stats and history.</div>
                     </div>
                     <select 
                        value={settings.privacy}
                        onChange={(e) => setSettings({...settings, privacy: e.target.value})}
                        className="bg-slate-900 border border-slate-700 text-white rounded p-2"
                     >
                        <option value="public">Public</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Private</option>
                     </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                     <div>
                        <div className="text-white font-bold">Push Notifications</div>
                        <div className="text-sm text-slate-400">Receive alerts for tournaments and invites.</div>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={settings.notifications_enabled} onChange={(e) => setSettings({...settings, notifications_enabled: e.target.checked})} />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                     </label>
                  </div>
                  <div className="flex justify-end pt-2">
                     <Button onClick={handleSaveSettings} disabled={saving} variant="gaming" className="px-6 py-2">
                        {saving ? 'Saving...' : 'Save Privacy'}
                     </Button>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
      
      <div className="mt-8 flex justify-end">
         <Button onClick={() => window.location.href = "/profile"} variant="outline" className="px-8 py-6 text-lg border-slate-600 hover:bg-slate-800">
            Back to Profile
         </Button>
      </div>
    </div>
  );
}
