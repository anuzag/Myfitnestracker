"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/components/providers/auth-provider";
import { useTracking } from "@/hooks/use-tracking";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, ArrowLeft, Play, Square, Save, Timer, Route, Flame, Loader2 } from "lucide-react";
import Link from "next/link";

// Dynamically import map component due to Leaflet SSR issues
const MapComp = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-900 animate-pulse rounded-2xl" />,
});

export default function TrackPage() {
  const { user, loading } = useAuth();
  const tracking = useTracking();
  const router = useRouter();
  const [activityType, setActivityType] = useState("run");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  const paceValue = tracking.distance > 0 ? (tracking.duration / 60) / tracking.distance : 0;
  const paceMin = Math.floor(paceValue);
  const paceSec = Math.floor((paceValue - paceMin) * 60);
  const paceStr = tracking.distance > 0 ? `${paceMin}:${paceSec.toString().padStart(2, '0')}` : "--:--";

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;
    return hrs > 0 
      ? `${hrs}:${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
      : `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await tracking.saveActivity(user.id, activityType);
    if (error) {
       alert(error instanceof Error ? error.message : String(error));
    } else {
       router.push("/");
       router.refresh();
    }
    setIsSaving(false);
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden font-sans">
      {/* Immersive Map Background */}
      <div className="absolute inset-0 z-0">
        <MapComp
          center={tracking.currentLocation ? [tracking.currentLocation.lat, tracking.currentLocation.lng] : [13.0827, 80.2707]}
          path={tracking.path.map((p) => [p.lat, p.lng])}
        />
      </div>

      {/* Floating Header */}
      <header className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          {!tracking.isTracking && (
            <Link href="/" className="p-3 glass rounded-full border border-zinc-800 hover:bg-zinc-900 transition-all group">
              <ArrowLeft className="h-6 w-6 text-zinc-400 group-hover:text-white" />
            </Link>
          )}
          <div className="glass px-4 py-2 rounded-full border border-zinc-800 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${tracking.isTracking ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-[10px] uppercase font-black tracking-widest text-zinc-200">
              {tracking.isTracking ? 'Recording' : 'Ready'}
            </span>
          </div>
        </div>

        {!tracking.isTracking && (
          <div className="flex bg-zinc-900/90 backdrop-blur-xl p-1 rounded-full border border-zinc-800 pointer-events-auto">
            {['walk', 'run', 'bike'].map((type) => (
              <button
                key={type}
                onClick={() => setActivityType(type)}
                className={`px-6 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                  activityType === type ? "bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Strava-style Performance Shelf */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-10 pointer-events-none">
        <div className="max-w-3xl mx-auto flex flex-col gap-6 pointer-events-auto">
          
          {/* Main Performance Metrics */}
          <div className="glass p-8 md:p-12 rounded-[2.5rem] border border-zinc-800/50 shadow-2xl backdrop-blur-3xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
              
              <div className="flex flex-col gap-1 items-center md:items-start group">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                   <MapPin className="h-4 w-4" />
                   <span className="text-[10px] uppercase font-black tracking-widest">Distance</span>
                </div>
                <div className="flex items-baseline gap-1 group-hover:scale-105 transition-transform origin-left">
                  <span className="text-5xl md:text-6xl font-black tabular-nums tracking-tighter">{tracking.distance.toFixed(2)}</span>
                  <span className="text-sm font-bold text-zinc-500">km</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 items-center md:items-start group">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                   <Timer className="h-4 w-4" />
                   <span className="text-[10px] uppercase font-black tracking-widest">Time</span>
                </div>
                <div className="text-5xl md:text-6xl font-black tabular-nums tracking-tighter group-hover:scale-105 transition-transform origin-left">
                   {formatDuration(tracking.duration)}
                </div>
              </div>

              <div className="flex flex-col gap-1 items-center md:items-start group">
                <div className="flex items-center gap-2 text-orange-500/80 mb-1">
                   <Flame className="h-4 w-4" />
                   <span className="text-[10px] uppercase font-black tracking-widest">Calories</span>
                </div>
                <div className="text-5xl md:text-6xl font-black tabular-nums tracking-tighter text-orange-500 group-hover:scale-105 transition-transform origin-left">
                   {Math.floor(tracking.calories)}
                </div>
              </div>

              <div className="flex flex-col gap-1 items-center md:items-start group">
                <div className="flex items-center gap-2 text-blue-500/80 mb-1">
                   <Route className="h-4 w-4" />
                   <span className="text-[10px] uppercase font-black tracking-widest">Avg Pace</span>
                </div>
                <div className="flex items-baseline gap-1 group-hover:scale-105 transition-transform origin-left">
                  <span className="text-5xl md:text-6xl font-black tabular-nums tracking-tighter text-blue-500">{paceStr}</span>
                  <span className="text-sm font-bold text-zinc-500">/km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Controls */}
          <div className="flex items-center justify-center gap-6">
            {!tracking.isTracking ? (
              <>
                {tracking.path.length > 5 ? (
                   <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-white hover:bg-zinc-100 text-black h-20 rounded-full font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50 active:scale-95"
                  >
                    {isSaving ? <Loader2 className="animate-spin h-6 w-6" /> : <Save className="h-6 w-6" />}
                    Finish & Save
                  </button>
                ) : (
                  <button
                    onClick={() => tracking.startTracking(activityType)}
                    className="h-28 w-28 md:h-32 md:w-32 bg-green-600 hover:bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.3)] transition-all transform hover:scale-110 active:scale-90 group"
                  >
                    <Play className="fill-white h-10 w-10 md:h-12 md:w-12 ml-1" />
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={tracking.stopTracking}
                className="h-28 w-28 md:h-32 md:w-32 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.3)] transition-all transform hover:scale-110 active:scale-90 group animate-glow-red"
              >
                <Square className="fill-white h-10 w-10 md:h-12 md:w-12" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Error Message */}
      {tracking.error && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center z-50 p-6 pointer-events-none">
          <div className="glass px-6 py-4 rounded-3xl border border-red-500/20 text-red-500 font-bold flex items-center gap-3 shadow-2xl animate-in zoom-in-95 pointer-events-auto">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>GPS: {tracking.error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
