import React, { useState } from "react";
import { motion } from "framer-motion";
import { Crown, ShieldCheck, ConciergeBell, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ROLES = [
  { key: "owner",   label: "Owner",   email: "owner@athithya.com",   password: "owner123",   icon: Crown,          tint: "from-amber-400 to-amber-600" },
  { key: "manager", label: "Manager", email: "manager@athithya.com", password: "manager123", icon: ShieldCheck,    tint: "from-emerald-400 to-emerald-600" },
  { key: "waiter",  label: "Waiter",  email: "waiter@athithya.com",  password: "waiter123",  icon: ConciergeBell,  tint: "from-cyan-400 to-cyan-600" },
];

export default function Login() {
  const { login } = useAuth();
  const [selected, setSelected] = useState(ROLES[0]);
  const [email, setEmail] = useState(ROLES[0].email);
  const [password, setPassword] = useState(ROLES[0].password);
  const [loading, setLoading] = useState(false);

  const pick = (r) => { setSelected(r); setEmail(r.email); setPassword(r.password); };

  const submit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name}`);
    } catch (err) {
      const d = err?.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div data-testid="login-screen" className="min-h-screen w-full grid lg:grid-cols-[1.1fr_1fr]">
      {/* Left visual */}
      <div className="relative hidden lg:block overflow-hidden">
        <img alt="" src="https://images.unsplash.com/photo-1758194090785-8e09b7288199"
             className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-emerald-900/60" />
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="78" stroke="#10B981" strokeWidth="3" />
              <path d="M55 130 L100 50 L145 130 Z M75 115 H125" stroke="#00E5FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div className="text-xs tracking-[0.4em] text-emerald-300/80">ATHITHYA</div>
              <div className="text-lg font-light tracking-tight">Hospitality OS</div>
            </div>
          </div>

          <div className="space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-amber-300/90 px-3 py-1 rounded-full border border-amber-300/30 bg-amber-300/5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> Enterprise Edition
            </div>
            <h1 className="text-5xl font-light tracking-tight leading-[1.05]">
              The operating system <span className="italic text-emerald-300">your restaurant deserves.</span>
            </h1>
            <p className="text-white/70 text-base leading-relaxed">
              Real-time kitchen orchestration, AI-driven demand forecasts, multi-branch finance, and a touch POS that just flows. All in one calm, premium command center.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[["48", "modules"], ["99.99%", "uptime"], ["<12ms", "KDS sync"]].map(([v, l]) => (
                <div key={l} className="border-l border-white/15 pl-4">
                  <div className="text-2xl font-light">{v}</div>
                  <div className="text-xs uppercase tracking-widest text-white/50">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-white/40 tracking-widest uppercase">© 2026 Athithya Systems · Made for hospitality</div>
        </div>
      </div>

      {/* Right form */}
      <div className="relative athithya-desktop flex items-center justify-center px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="glass-strong rounded-3xl p-8 md:p-10 w-full max-w-md">
          <div className="mb-6">
            <div className="text-xs tracking-[0.4em] uppercase text-slate-500 mb-2">Sign in</div>
            <h2 className="text-3xl font-light tracking-tight">Access your workspace</h2>
            <p className="text-sm text-slate-500 mt-2">Choose your role — credentials auto-fill for the demo.</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = selected.key === r.key;
              return (
                <button
                  key={r.key}
                  data-testid={`role-${r.key}-card`}
                  onClick={() => pick(r)}
                  className={`relative group rounded-2xl p-4 text-left border transition-all ${active ? "border-slate-900 bg-slate-900 text-white shadow-lg -translate-y-0.5" : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md"}`}
                >
                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${r.tint} grid place-items-center text-white mb-3`}>
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div className={`text-sm font-medium ${active ? "text-white" : "text-slate-900"}`}>{r.label}</div>
                  <div className={`text-[11px] mt-0.5 ${active ? "text-white/60" : "text-slate-400"}`}>tap to select</div>
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-slate-500">Email</Label>
              <Input id="email" data-testid="login-email" type="email" value={email}
                     onChange={(e) => setEmail(e.target.value)} className="mt-1 h-11 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs uppercase tracking-widest text-slate-500">Password</Label>
              <Input id="password" data-testid="login-password" type="password" value={password}
                     onChange={(e) => setPassword(e.target.value)} className="mt-1 h-11 rounded-xl" />
            </div>
            <Button data-testid="login-submit" type="submit" disabled={loading}
                    className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white">
              {loading ? <Loader2 className="animate-spin" size={18} /> : (<>Enter Athithya OS <ArrowRight size={16} className="ml-2" /></>)}
            </Button>
          </form>

          <div className="mt-6 text-[11px] text-slate-400 text-center tracking-wide">
            Demo credentials are pre-filled. Use the role cards above to switch.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
