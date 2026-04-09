"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  History, 
  Activity, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  TrendingUp,
  MapPin
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { name: "Dashboard", icon: Home, href: "/" },
    { name: "Start Track", icon: Activity, href: "/track" },
    { name: "History", icon: History, href: "/history" },
  ];

  if (!user) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 glass rounded-xl border border-zinc-800 lg:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 left-0 h-screen w-72 bg-zinc-950 border-r border-zinc-900 z-40
        transition-transform duration-300 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-10 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
                <Activity className="h-6 w-6 text-green-500" />
            </div>
            <h1 className="text-xl font-bold neon-text text-green-500">MyFitness</h1>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center justify-between p-3 rounded-xl transition-all group
                  ${pathname === item.href 
                    ? "bg-green-600/10 text-green-500 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${pathname === item.href ? "text-green-500" : "text-zinc-500 group-hover:text-white"}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                {pathname === item.href && (
                   <ChevronRight className="h-4 w-4" />
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-6">
            {/* User Profile Card */}
            <div className="p-4 glass rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                        <User className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{user.profile?.name || user.email}</p>
                        <p className="text-[10px] text-zinc-500 truncate">Premium Member</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <button className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors">
                        <Settings className="h-3 w-3" />
                        Settings
                    </button>
                    <button 
                        onClick={() => signOut()}
                        className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="h-3 w-3" />
                        Sign Out
                    </button>
                </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Layout Spacer for Desktop */}
      <div className="hidden lg:block w-72 flex-shrink-0" />
    </>
  );
}
