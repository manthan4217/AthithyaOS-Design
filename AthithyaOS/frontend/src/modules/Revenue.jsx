import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { IndianRupee, FileText, Download, CreditCard, Banknote, Smartphone } from "lucide-react";

const months = [
  { m: "Sep", rev: 824000, exp: 612000 }, { m: "Oct", rev: 912400, exp: 668000 },
  { m: "Nov", rev: 1042000, exp: 712000 }, { m: "Dec", rev: 1184000, exp: 786000 },
  { m: "Jan", rev: 968000, exp: 702000 }, { m: "Feb", rev: 1056000, exp: 738000 },
];

const EXPENSES = [
  { l: "Rent",       v: 180000, c: "#0F172A" },
  { l: "Salaries",   v: 312000, c: "#10B981" },
  { l: "Vendors",    v: 142000, c: "#00E5FF" },
  { l: "Utilities",  v: 48000,  c: "#D4AF37" },
  { l: "Marketing",  v: 36000,  c: "#F59E0B" },
  { l: "Maintenance",v: 20000,  c: "#3B82F6" },
];

export default function Revenue() {
  const total = EXPENSES.reduce((s, e) => s + e.v, 0);

  return (
    <div data-testid="revenue-module" className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "Revenue · Feb",   v: "₹10,56,000", sub: "+8.7%",     i: IndianRupee, t: "bg-emerald-50 text-emerald-700" },
          { l: "Net Profit",      v: "₹3,18,000",  sub: "30.1% margin", i: IndianRupee, t: "bg-cyan-50 text-cyan-700" },
          { l: "GST Output",      v: "₹52,800",    sub: "5% slab",   i: FileText,    t: "bg-amber-50 text-amber-700" },
          { l: "Cash Variance",   v: "+₹120",      sub: "Within ±₹500", i: Banknote, t: "bg-slate-100 text-slate-700" },
        ].map((s, i) => {
          const Icon = s.i;
          return (
            <div key={i} className="glass rounded-2xl p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${s.t} grid place-items-center`}><Icon size={16} /></div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500">{s.l}</div>
                <div className="text-xl font-light tracking-tight">{s.v}</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Revenue vs Expenses · 6 months</div>
              <div className="text-lg font-light tracking-tight">Profit margin trending up · 30.1%</div>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-lg glass flex items-center gap-1"><Download size={12} /> Export PDF</button>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={months}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="m" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/100000}L`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} />
                <Line type="monotone" dataKey="rev" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="exp" stroke="#0F172A" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 glass rounded-2xl p-5">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">Monthly Expenses</div>
          <div className="space-y-3">
            {EXPENSES.map((e) => (
              <div key={e.l}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700">{e.l}</span>
                  <span className="font-medium">₹{(e.v/1000).toFixed(0)}k</span>
                </div>
                <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(e.v/total)*100}%`, background: e.c }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-sm">
            <span className="font-medium">Total</span>
            <span className="font-medium">₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="col-span-12 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-light tracking-tight">Cash Settlement · End of Day</h3>
            <button className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white">Close drawer</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l: "Cash",    v: 18420, i: Banknote,   tint: "bg-amber-50 text-amber-700" },
              { l: "UPI",     v: 21800, i: Smartphone, tint: "bg-emerald-50 text-emerald-700" },
              { l: "Card",    v: 7480,  i: CreditCard, tint: "bg-cyan-50 text-cyan-700" },
              { l: "Wallet",  v: 500,   i: CreditCard, tint: "bg-slate-100 text-slate-700" },
            ].map((p, i) => {
              const Icon = p.i;
              return (
                <div key={i} className="rounded-2xl bg-white border border-slate-200 p-4">
                  <div className={`h-9 w-9 rounded-xl ${p.tint} grid place-items-center mb-3`}><Icon size={15} /></div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">{p.l}</div>
                  <div className="text-lg font-light tracking-tight mt-1">₹{p.v.toLocaleString("en-IN")}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
