"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { insforge } from "@/lib/insforge";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Clock, Route, Trash2, Flame, Loader2 } from "lucide-react";
import Link from "next/link";

interface Activity {
  id: string;
  type: string;
  distance: number;
  duration: number;
  calories?: number;
  date: string;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await insforge.database
      .from("activities")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (!error && data) {
      setActivities(data as Activity[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/signin");
      } else {
        fetchActivities();
      }
    }
  }, [user, authLoading]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  const deleteActivity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;
    const { error } = await insforge.database
      .from("activities")
      .delete()
      .eq("id", id);

    if (!error) {
      setActivities((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-black text-white p-6 sm:p-10">
      <header className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-green-500 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-xl font-bold neon-text text-green-500">Activity History</h1>
      </header>

      <main className="max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl p-10">
             <Route className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
             <p className="text-zinc-400 text-lg">No activities recorded yet.</p>
             <Link href="/track" className="text-green-500 hover:underline mt-2 inline-block">Start your first walk</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-zinc-900 hover:border-zinc-800 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    activity.type === 'run' ? 'bg-orange-500/10 text-orange-500' :
                    activity.type === 'bike' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                  }`}>
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold capitalize text-zinc-100">{activity.type}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 px-4">
                  <div className="text-center">
                    <div className="text-lg font-black tracking-tight">{activity.distance.toFixed(2)}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">KM</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black tracking-tight text-orange-500">{(activity.calories || 0)}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">KCAL</div>
                  </div>
                  <div className="text-center hidden sm:block">
                    <div className="text-lg font-black tracking-tight">{formatDuration(activity.duration)}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Time</div>
                  </div>
                </div>

                <button
                  onClick={() => deleteActivity(activity.id)}
                  className="p-2 rounded-lg text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
