import React, { useEffect, useState } from "react";
import { api } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Utensils, Clock, Smile, Activity, ChefHat, Users, IndianRupee, ArrowUpRight, AlertTriangle } from "lucide-react";

const revenueSeries = [
  { d: "Mon", v: 32200 }, { d: "Tue", v: 38400 }, { d: "Wed", v: 41200 },
  { d: "Thu", v: 47800 }, { d: "Fri", v: 58200 }, { d: "Sat", v: 67400 }, { d: "Sun", v: 48200 },
];
const ordersByHour = [
  { h: "11AM", o: 12 }, { h: "12PM", o: 28 }, { h: "1PM", o: 42 }, { h: "2PM", o: 36 },
  { h: "3PM", o: 18 }, { h: "7PM", o: 38 }, { h: "8PM", o: 54 }, { h: "9PM", o: 46 }, { h: "10PM", o: 22 },
];
const categoryMix = [
  { name: "Mains", v: 42, c: "#0F172A" }, { name: "Chinese", v: 22, c: "#10B981" },
  { name: "Beverages", v: 18, c: "#00E5FF" }, { name: "Desserts", v: 10, c: "#D4AF37" },
  { name: "Starters", v: 8, c: "#F59E0B" },
];

function Stat({ icon: Icon, label, value, sub, tone = "slate", testId }) {
  const tones = {
    slate: "from-slate-900 to-slate-700 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    cyan: "from-cyan-400 to-cyan-600 text-white",
    gold: "from-amber-400 to-amber-600 text-white",
  };
  return (
    <div data-testid={testId} className="neon-card glass rounded-2xl p-5"
         onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', `${e.clientX-r.left}px`); e.currentTarget.style.setProperty('--my', `${e.clientY-r.top}px`); }}>
      <div className="flex items-start justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${tones[tone]} grid place-items-center`}><Icon size={18} /></div>
        <span className="text-[10px] uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <div className="text-2xl font-light tracking-tight text-slate-900">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><ArrowUpRight size={11} className="text-emerald-600" />{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/dashboard/stats").then((r) => setStats(r.data)).catch(() => {}); }, []);

  return (
    <div data-testid="dashboard-module" className="space-y-6">
      {/* Stats Bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <Stat testId="stat-revenue" icon={IndianRupee} label="Revenue Today" value={`₹${(stats?.revenue_today ?? 48200).toLocaleString("en-IN")}`} sub="+12% vs yesterday" tone="emerald" />
        <Stat testId="stat-orders"  icon={Utensils}    label="Active Orders" value={stats?.kitchen_queue ?? 8} sub={`${stats?.orders_today ?? 24} today`} tone="slate" />
        <Stat testId="stat-tables"  icon={Activity}    label="Tables Occupied" value={`${stats?.active_tables ?? 12}/${stats?.total_tables ?? 20}`} sub="60% occupancy" tone="cyan" />
        <Stat testId="stat-staff"   icon={Users}       label="Staff Working" value={stats?.staff_working ?? 7} sub="2 on break" tone="gold" />
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Revenue Chart */}
        <div className="col-span-12 lg:col-span-8 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Revenue · Last 7 days</div>
              <div className="text-xl font-light tracking-tight">₹3,33,400 <span className="text-xs text-emerald-600 font-medium ml-1">+18.4%</span></div>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1"><TrendingUp size={13} className="text-emerald-600" /> Trending up</div>
          </div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="d" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} />
                <Area type="monotone" dataKey="v" stroke="#10B981" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI side */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          <div className="glass rounded-2xl p-5">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">Performance</div>
            {[
              { l: "Customer Satisfaction", v: stats?.customer_satisfaction ?? 92, icon: Smile, color: "#10B981" },
              { l: "Kitchen Efficiency",    v: stats?.kitchen_efficiency ?? 87,    icon: ChefHat, color: "#00E5FF" },
              { l: "Avg Service Time",      v: 78, icon: Clock, color: "#D4AF37", sub: `${stats?.avg_service_time ?? 18} min` },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-700"><Icon size={14} style={{ color: m.color }} /> {m.l}</span>
                    <span className="font-medium">{m.sub || `${m.v}%`}</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${m.v}%` }} transition={{ duration: 0.8 }}
                                className="h-full rounded-full" style={{ background: m.color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="glass-dark rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="text-[10px] uppercase tracking-widest text-emerald-300/80">AI Business Score</div>
            <div className="text-5xl font-light mt-2">87<span className="text-2xl text-white/40">/100</span></div>
            <div className="text-xs text-white/60 mt-1">Above industry benchmark by 14 points</div>
            <button className="mt-4 text-xs text-cyan-300 hover:text-cyan-200">View recommendations →</button>
          </div>
        </div>

        {/* Orders by hour */}
        <div className="col-span-12 lg:col-span-7 glass rounded-2xl p-5">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Orders by Hour</div>
          <div className="text-base font-medium mb-4">Peak rush at 8 PM · 54 orders</div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={ordersByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="h" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} />
                <Bar dataKey="o" fill="#0F172A" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category mix */}
        <div className="col-span-12 lg:col-span-5 glass rounded-2xl p-5">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Sales Mix</div>
          <div className="text-base font-medium mb-2">By category · today</div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoryMix} dataKey="v" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={3}>
                  {categoryMix.map((e, i) => <Cell key={i} fill={e.c} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert strip */}
        <div className="col-span-12 glass rounded-2xl p-4 flex items-center gap-3 border-l-4 border-amber-400">
          <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 grid place-items-center"><AlertTriangle size={16} /></div>
          <div className="flex-1">
            <div className="text-sm font-medium">{stats?.low_stock ?? 2} inventory items below reorder level</div>
            <div className="text-xs text-slate-500">Paneer (4.5kg), Tomato (8kg). Consider auto-reorder before tonight's dinner service.</div>
          </div>
          <button className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white">Review</button>
        </div>
      </div>
    </div>
  );
}
