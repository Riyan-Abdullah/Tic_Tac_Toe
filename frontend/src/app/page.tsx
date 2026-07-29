"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Zap, Bot, Trophy, Users, Activity, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const features = [
    {
      title: "Fast Multiplayer",
      description: "Experience ultra-low latency matches with our optimized global infrastructure.",
      icon: <Zap className="h-6 w-6 text-primary" />,
    },
    {
      title: "AI Opponent",
      description: "Practice your strategies against our advanced AI engine. (Coming Soon)",
      icon: <Bot className="h-6 w-6 text-slate-400" />,
    },
    {
      title: "Leaderboard",
      description: "Climb the ranks and show the world you are the ultimate TicTac champion.",
      icon: <Trophy className="h-6 w-6 text-yellow-500" />,
    },
    {
      title: "Real-time Matches",
      description: "Connect instantly with players around the world for thrilling real-time gameplay.",
      icon: <Users className="h-6 w-6 text-success" />,
    },
    {
      title: "Player Statistics",
      description: "Track your wins, losses, and win streaks with detailed player analytics.",
      icon: <Activity className="h-6 w-6 text-primary-dark" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col items-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl relative"
        >
          {/* Cyber glowing orb behind text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white relative z-10">
            Welcome to <br className="md:hidden" /><span className="text-primary neon-text-primary">TicTac Arena</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Play. Compete. Climb the Leaderboard. The next generation of competitive Tic-Tac-Toe awaits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" variant="gaming" className="w-full sm:w-auto min-w-[250px]">
                  Enter Arena (Dashboard)
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button size="lg" variant="gaming" className="w-full sm:w-auto min-w-[200px]">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[200px] border-primary/50 hover:bg-primary/10">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
        
        {/* Animated Cyber Tic-Tac-Toe Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 w-full max-w-4xl aspect-video rounded-3xl glass cyber-border flex items-center justify-center overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-[#0A0F1E] to-secondary/5 group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-700" />
          
          {/* Tic-Tac-Toe Grid */}
          <div className="relative z-10 grid grid-cols-3 gap-4 p-4 w-64 h-64 md:w-80 md:h-80">
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-3 pointer-events-none">
              <div className="border-r-4 border-primary/20 shadow-[2px_0_10px_rgba(0,229,255,0.2)]" />
              <div className="border-r-4 border-primary/20 shadow-[2px_0_10px_rgba(0,229,255,0.2)]" />
              <div />
            </div>
            <div className="absolute inset-0 grid grid-rows-3 pointer-events-none">
              <div className="border-b-4 border-primary/20 shadow-[0_2px_10px_rgba(0,229,255,0.2)]" />
              <div className="border-b-4 border-primary/20 shadow-[0_2px_10px_rgba(0,229,255,0.2)]" />
              <div />
            </div>

            {/* X and O Cells */}
            <div className="flex items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="text-5xl md:text-7xl font-bold text-primary neon-text-primary drop-shadow-[0_0_15px_rgba(0,229,255,0.8)]">X</motion.div>
            </div>
            <div className="flex items-center justify-center" />
            <div className="flex items-center justify-center">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl md:text-7xl font-bold text-secondary neon-text-secondary drop-shadow-[0_0_15px_rgba(255,0,127,0.8)]">O</motion.div>
            </div>
            <div className="flex items-center justify-center" />
            <div className="flex items-center justify-center">
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="text-5xl md:text-7xl font-bold text-primary neon-text-primary drop-shadow-[0_0_15px_rgba(0,229,255,0.8)]">X</motion.div>
            </div>
            <div className="flex items-center justify-center" />
            <div className="flex items-center justify-center">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 1.5 }} className="text-5xl md:text-7xl font-bold text-secondary neon-text-secondary drop-shadow-[0_0_15px_rgba(255,0,127,0.8)]">O</motion.div>
            </div>
            <div className="flex items-center justify-center" />
            <div className="flex items-center justify-center">
              <Gamepad2 className="w-12 h-12 text-slate-500/50" />
            </div>
          </div>

          <div className="absolute font-semibold text-primary/70 text-sm md:text-lg uppercase tracking-[0.3em] bottom-6 neon-text-primary">
            System Online
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-[#060913] py-24 border-t border-slate-800/50 relative overflow-hidden">
        {/* Background glow for features */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-white">Why <span className="text-primary neon-text-primary">TicTac Arena?</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Built for competitive players looking for a premium gaming experience.</p>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="h-full group hover:border-primary/50 transition-all duration-300 hover:neon-glow-primary hover:-translate-y-2 bg-[#0A0F1E]/80">
                  <CardHeader>
                    <div className="p-4 bg-slate-900/80 rounded-xl w-fit mb-4 shadow-inner border border-slate-700/50 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
