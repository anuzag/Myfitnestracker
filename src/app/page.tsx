"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/components/providers/auth-provider";
import { useTracking } from "@/hooks/use-tracking";
import { insforge } from "@/lib/insforge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, LogOut, MapPin, TrendingUp, History, Flame } from "lucide-react";

// Dynamically import map component
const MapComp = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-900 animate-pulse" />,
});

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const tracking = useTracking();
  const [stats, setStats] = useState({ distance: 0, duration: 0, calories: 0 });

  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        const { data, error } = await insforge.database
          .from("activities")
          .select("distance, duration, calories")
          .eq("user_id", user.id);

        if (!error && data) {
          const totalDistance = data.reduce((acc: number, curr: any) => acc + (curr.distance || 0), 0);
          const totalDuration = data.reduce((acc: number, curr: any) => acc + (curr.duration || 0), 0);
          const totalCalories = data.reduce((acc: number, curr: any) => acc + (curr.calories || 0), 0);
          setStats({
            distance: totalDistance,
            duration: Math.floor(totalDuration / 60),
            calories: totalCalories
          });
        }
      };
      fetchStats();
    }
  }, [user]);


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-black">
        <div className="mb-8 p-4 glass rounded-full neon-shadow">
          <Activity className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-4 neon-text text-green-500">
          MyFitnessTracker
        </h1>
        <p className="max-w-lg text-lg text-zinc-400 mb-10">
          Track your activity, monitor your progress, and reach your fitness goals with real-time geolocation tracking.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signin"
            className="flex h-12 items-center justify-center rounded-full bg-green-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            Get Started
          </Link>
          <Link
            href="/signup"
            className="flex h-12 items-center justify-center rounded-full border border-zinc-800 px-8 text-sm font-semibold transition-colors hover:bg-zinc-900"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-black p-6 sm:p-10">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight neon-text text-green-500">
            {new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 18 ? "Good Afternoon" : "Good Evening"}, {user.profile?.name || user.email.split('@')[0]}!
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Ready to push your limits today?</p>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
         {/* Welcome Card & Real-time Info */}
         <div className="sm:col-span-2 lg:col-span-4 glass p-8 rounded-[2.5rem] border border-green-500/10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[100px] -z-10 group-hover:bg-green-500/10 transition-all duration-700" />
            <div className="relative">
                <div className="h-24 w-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 neon-shadow animate-pulse">
                    <TrendingUp className="h-10 w-10 text-green-500" />
                </div>
            </div>
            <div className="text-center md:text-left flex-1">
                <h3 className="text-2xl font-bold mb-2">You're crushing it!</h3>
                <p className="text-zinc-400 leading-relaxed mb-6">
                    You've covered <span className="text-green-500 font-bold">{stats.distance.toFixed(1)} km</span> over <span className="text-white font-bold">{stats.duration} mins</span> of activity. 
                    Keep the momentum going to reach your weekly goal!
                </p>
                <Link 
                    href="/track" 
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95"
                >
                    <Activity className="h-5 w-5" />
                    Record New Activity
                </Link>
            </div>
         </div>

        {/* Stats Grid */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-4 border border-zinc-900 group hover:border-green-500/20 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <MapPin className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-bold text-zinc-300">Lifetime</h3>
          </div>
          <div className="mt-2">
            <span className="text-4xl font-black tabular-nums">{stats.distance.toFixed(1)}</span>
            <span className="ml-2 text-zinc-500 font-bold">KM</span>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl flex flex-col gap-4 border border-zinc-900 group hover:border-orange-500/20 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="font-bold text-zinc-300">Burned</h3>
          </div>
          <div className="mt-2">
            <span className="text-4xl font-black tabular-nums text-orange-500">{stats.calories}</span>
            <span className="ml-2 text-zinc-500 font-bold">KCAL</span>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl flex flex-col gap-4 border border-zinc-900 group hover:border-blue-500/20 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-bold text-zinc-300">Time spent</h3>
          </div>
          <div className="mt-2">
            <span className="text-4xl font-black tabular-nums text-white">{stats.duration}</span>
            <span className="ml-2 text-zinc-500 font-bold">MIN</span>
          </div>
        </div>

        <div onClick={() => router.push('/history')} className="glass p-6 rounded-3xl flex flex-col gap-4 border border-zinc-900 group hover:border-green-500/20 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-900 rounded-xl group-hover:bg-green-600 transition-colors">
              <History className="h-6 w-6 text-zinc-400 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-zinc-300">View History</h3>
          </div>
          <div className="mt-auto text-xs text-zinc-500 font-medium uppercase tracking-tighter">
             Review your past performance
          </div>
        </div>

        {/* Live Map Widget */}
        <div className="sm:col-span-2 lg:col-span-4 glass p-6 rounded-[2.5rem] border border-zinc-900 flex flex-col gap-4 h-[300px] overflow-hidden group">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="font-bold text-zinc-200">Your Live Location</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] text-zinc-500 uppercase font-black">Live</span>
                </div>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden border border-zinc-800">
               <MapComp 
                center={tracking.currentLocation ? [tracking.currentLocation.lat, tracking.currentLocation.lng] : [13.0827, 80.2707]} 
                path={[]} 
               />
            </div>
        </div>
      </div>
    </div>
  );
}
