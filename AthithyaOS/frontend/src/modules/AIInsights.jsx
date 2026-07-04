import React, { useEffect, useState } from "react";
import { api } from "@/context/AuthContext";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Sparkles, TrendingUp, ChefHat, Trash2, Award, AlertCircle, Lightbulb } from "lucide-react";

const PRIORITY = { high: "border-red-400 bg-red-50/40", medium: "border-amber-400 bg-amber-50/40", low: "border-slate-300 bg-slate-50/40" };

export default function AIInsights() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/ai/insights").then((r) => setD(r.data)).catch(() => {}); }, []);
  if (!d) return <div className="text-sm text-slate-500">Loading AI insights…</div>;

  return (
    <div data-testid="ai-insights-module" className="space-y-5">
      {/* JARVIS hero */}
      <div className="glass-dark rounded-3xl p-8 relative overflow-hidden text-white">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full jarvis-orb opacity-25" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative grid md:grid-cols-3 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-cyan-300/80 mb-3">
              <Sparkles size={12} /> Athithya AI
            </div>
            <h2 className="text-4xl font-light tracking-tight leading-tight">Tonight will be <span className="text-emerald-300">+18%</span> busier</h2>
            <p className="text-white/60 text-sm mt-2 max-w-md">Based on weather, weekend patterns, and the 4 large reservations between 7–9 PM, we recommend a +2 staff increase.</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 p-4">
              <div className="text-[10px] uppercase tracking-widest text-white/40">Predicted Today</div>
              <div className="text-2xl font-light mt-1">₹{d.revenue_prediction.today.toLocaleString("en-IN")}</div>
              <div className="text-[11px] text-emerald-300 mt-1">{d.revenue_prediction.trend} trend</div>
            </div>
            <div className="rounded-2xl border border-white/10 p-4">
              <div className="text-[10px] uppercase tracking-widest text-white/40">Tomorrow</div>
              <div className="text-2xl font-light mt-1">₹{d.revenue_prediction.tomorrow.toLocaleString("en-IN")}</div>
              <div className="text-[11px] text-cyan-300 mt-1">+9.5% vs avg</div>
            </div>
            <div className="rounded-2xl border border-white/10 p-4">
              <div className="text-[10px] uppercase tracking-widest text-white/40">This Week</div>
              <div className="text-2xl font-light mt-1">₹{(d.revenue_prediction.week / 1000).toFixed(0)}k</div>
              <div className="text-[11px] text-amber-300 mt-1">On track</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7 glass rounded-2xl p-5">
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Busy hours forecast</div>
          <div className="text-lg font-light tracking-tight mb-3">Today · expected load</div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={d.busy_hours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} />
                <Bar dataKey="load" fill="#00E5FF" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Star performers</div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center"><Award size={16} /></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Best dish · {d.best_dish.name}</div>
                  <div className="text-xs text-slate-500">{d.best_dish.orders} orders · ₹{d.best_dish.revenue.toLocaleString("en-IN")}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-700 grid place-items-center"><ChefHat size={16} /></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Fastest chef · {d.fastest_chef.name}</div>
                  <div className="text-xs text-slate-500">Avg prep {d.fastest_chef.avg_prep}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 grid place-items-center"><TrendingUp size={16} /></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Top waiter · {d.best_waiter.name}</div>
                  <div className="text-xs text-slate-500">₹{d.best_waiter.tips} tips · {d.best_waiter.rating}★</div>
                </div>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-5 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-red-50 text-red-700 grid place-items-center"><Trash2 size={18} /></div>
            <div className="flex-1">
              <div className="text-sm font-medium">Food waste · {d.food_waste.percentage}%</div>
              <div className="text-xs text-slate-500">{d.food_waste.trend} from last week · saving ₹{d.food_waste.saving}</div>
            </div>
          </div>
        </div>

        <div className="col-span-12 glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-amber-500" />
            <h3 className="text-lg font-light tracking-tight">Actionable recommendations</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {d.recommendations.map((r) => (
              <div key={r.id} className={`rounded-2xl p-4 border-l-4 ${PRIORITY[r.priority]} bg-white`}>
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className={r.priority === "high" ? "text-red-500" : "text-amber-500"} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{r.title}</div>
                    <div className="text-xs text-emerald-700 mt-1 font-medium">{r.impact}</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">{r.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
