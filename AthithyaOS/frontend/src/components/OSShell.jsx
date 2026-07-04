import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ChefHat, Grid3x3, ShoppingCart, Boxes, Users, Calendar, Sparkles,
  Wallet, Settings, LogOut, Search, Bell, Mic, Wifi, BatteryFull, Cloud, Receipt,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import Dashboard from "@/modules/Dashboard";
import KDS from "@/modules/KDS";
import Tables from "@/modules/Tables";
import POS from "@/modules/POS";
import Inventory from "@/modules/Inventory";
import Staff from "@/modules/Staff";
import Reservations from "@/modules/Reservations";
import AIInsights from "@/modules/AIInsights";
import Revenue from "@/modules/Revenue";
import SettingsModule from "@/modules/Settings";

import CommandPalette from "@/components/CommandPalette";
import NotificationCenter from "@/components/NotificationCenter";
import VoiceAssistant from "@/components/VoiceAssistant";

const ALL_MODULES = [
  { key: "dashboard",   label: "Dashboard",    icon: LayoutDashboard, comp: Dashboard,   roles: ["owner","manager","waiter"] },
  { key: "kds",         label: "Kitchen (KDS)",icon: ChefHat,         comp: KDS,         roles: ["owner","manager","waiter"] },
  { key: "tables",      label: "Tables",       icon: Grid3x3,         comp: Tables,      roles: ["owner","manager","waiter"] },
  { key: "pos",         label: "POS / Orders", icon: ShoppingCart,    comp: POS,         roles: ["owner","manager","waiter"] },
  { key: "reservations",label: "Reservations", icon: Calendar,        comp: Reservations,roles: ["owner","manager","waiter"] },
  { key: "inventory",   label: "Inventory",    icon: Boxes,           comp: Inventory,   roles: ["owner","manager"] },
  { key: "staff",       label: "Staff",        icon: Users,           comp: Staff,       roles: ["owner","manager"] },
  { key: "revenue",     label: "Revenue & GST",icon: Wallet,          comp: Revenue,     roles: ["owner","manager"] },
  { key: "ai",          label: "AI Insights",  icon: Sparkles,        comp: AIInsights,  roles: ["owner","manager"] },
  { key: "settings",    label: "Settings",     icon: Settings,        comp: SettingsModule, roles: ["owner"] },
];

export default function OSShell() {
  const { user, logout } = useAuth();
  const visible = ALL_MODULES.filter((m) => m.roles.includes(user.role));
  const [active, setActive] = useState(visible[0].key);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    const k = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdOpen(true); }
      if (e.key === "Escape") { setCmdOpen(false); setNotifOpen(false); }
    };
    window.addEventListener("keydown", k);
    return () => { clearInterval(t); window.removeEventListener("keydown", k); };
  }, []);

  const ActiveComp = visible.find((m) => m.key === active)?.comp || Dashboard;

  const greet = () => {
    const h = clock.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div data-testid="os-shell" className="min-h-screen athithya-desktop relative overflow-hidden">
      {/* Top Bar */}
      <div data-testid="os-topbar" className="fixed top-3 left-1/2 -translate-x-1/2 z-40 glass rounded-full px-5 h-9 flex items-center gap-4 text-xs text-slate-700">
        <span className="flex items-center gap-1.5"><Cloud size={13} /> Mumbai · 28°C</span>
        <span className="w-px h-3 bg-slate-300/60" />
        <span className="font-medium">{clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        <span className="w-px h-3 bg-slate-300/60" />
        <Wifi size={13} /><BatteryFull size={13} />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside data-testid="os-sidebar" className="fixed top-0 left-0 h-screen w-[280px] glass border-r border-white/40 z-30 flex flex-col">
          <div className="px-5 pt-6 pb-5 border-b border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-xl bg-slate-900 grid place-items-center">
                <svg width="22" height="22" viewBox="0 0 200 200" fill="none">
                  <path d="M55 130 L100 50 L145 130 Z M75 115 H125" stroke="#00E5FF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Athithya</div>
                <div className="text-sm font-medium tracking-tight">Hospitality OS</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] uppercase tracking-widest text-slate-400">Workspace</div>
            {visible.map((m) => {
              const Icon = m.icon;
              const isActive = active === m.key;
              return (
                <button
                  key={m.key}
                  data-testid={`nav-${m.key}`}
                  onClick={() => setActive(m.key)}
                  className={`relative w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 text-sm transition-all ${
                    isActive ? "bg-slate-900 text-white shadow-md" : "text-slate-700 hover:bg-white/70"
                  }`}
                >
                  <Icon size={17} strokeWidth={1.8} />
                  <span className="font-medium">{m.label}</span>
                  {isActive && <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-cyan-300" />}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-200/60">
            <div className="rounded-2xl p-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center gap-3">
              <img src={user.avatar} alt="" className="h-9 w-9 rounded-full ring-2 ring-emerald-400/60" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-[11px] text-white/60 uppercase tracking-wider">{user.role}</div>
              </div>
              <button data-testid="logout-btn" onClick={async () => { await logout(); toast.success("Signed out"); }}
                      className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10 text-white/80" title="Logout">
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="ml-[280px] flex-1 min-h-screen px-8 pt-16 pb-28">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">{greet()}, {user.name.split(" ")[0]}</div>
              <h1 className="text-3xl font-light tracking-tight mt-1 capitalize">
                {visible.find((m) => m.key === active)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button data-testid="open-cmd" onClick={() => setCmdOpen(true)}
                      className="h-10 px-4 rounded-xl glass flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                <Search size={15} /> Search anything <kbd className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-slate-900 text-white">⌘K</kbd>
              </button>
              <button data-testid="open-notif" onClick={() => setNotifOpen(true)}
                      className="relative h-10 w-10 rounded-xl glass grid place-items-center text-slate-700 hover:text-slate-900">
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
              </button>
              <div className="h-10 px-3 rounded-xl glass flex items-center gap-2 text-sm">
                <Receipt size={14} className="text-emerald-600" />
                <span className="font-medium">₹48,200</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">today</span>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            >
              <ActiveComp role={user.role} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Dock */}
      <div data-testid="os-dock" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 glass rounded-2xl px-3 py-2 flex items-center gap-1">
        {visible.slice(0, 7).map((m) => {
          const Icon = m.icon;
          return (
            <button key={m.key} data-testid={`dock-${m.key}`} onClick={() => setActive(m.key)} title={m.label}
                    className={`h-11 w-11 rounded-xl grid place-items-center transition-all hover:-translate-y-1 ${
                      active === m.key ? "bg-slate-900 text-white" : "bg-white/60 text-slate-700 hover:bg-white"
                    }`}>
              <Icon size={18} strokeWidth={1.8} />
            </button>
          );
        })}
        <div className="w-px h-7 bg-slate-300/70 mx-1" />
        <VoiceAssistant onCommand={(cmd) => {
          const map = { dashboard:"dashboard", kitchen:"kds", orders:"pos", reports:"revenue", inventory:"inventory", insights:"ai", reservations:"reservations", tables:"tables" };
          const found = Object.keys(map).find((k) => cmd.toLowerCase().includes(k));
          if (found) { setActive(map[found]); toast.success(`Opening ${map[found]}`); }
        }} />
      </div>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} modules={visible} onNavigate={setActive} />
      <NotificationCenter open={notifOpen} onOpenChange={setNotifOpen} />
    </div>
  );
}
