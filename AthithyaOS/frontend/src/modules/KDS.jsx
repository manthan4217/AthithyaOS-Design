import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChefHat, CheckCircle2, Flame, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const SECTIONS = [
  { key: "all",       label: "All" },
  { key: "main",      label: "Main" },
  { key: "chinese",   label: "Chinese" },
  { key: "tandoor",   label: "Tandoor" },
  { key: "dessert",   label: "Dessert" },
  { key: "beverages", label: "Beverages" },
];

const STATUS_FLOW = { received: "preparing", preparing: "ready", ready: "served" };
const STATUS_META = {
  received:  { tint: "bg-slate-100 text-slate-700",   border: "border-slate-300",  label: "Received" },
  preparing: { tint: "bg-amber-100 text-amber-700",   border: "border-amber-300",  label: "Preparing" },
  ready:     { tint: "bg-emerald-100 text-emerald-700", border: "border-emerald-300", label: "Ready" },
  served:    { tint: "bg-cyan-100 text-cyan-700",     border: "border-cyan-300",   label: "Served" },
};

function elapsed(iso) {
  const m = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  return m;
}

export default function KDS() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("all");
  const [now, setNow] = useState(Date.now()); // tick

  const load = () => api.get("/orders").then((r) => setOrders(r.data || []));
  useEffect(() => { load(); const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);

  const advance = async (o) => {
    const next = STATUS_FLOW[o.status];
    if (!next) return;
    await api.patch(`/orders/${o.id}`, { status: next });
    toast.success(`Order ${o.table_number || ""} → ${next}`);
    load();
  };

  const visible = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === "served" || o.status === "cancelled") return false;
      if (tab === "all") return true;
      return o.items.some((it) => it.section === tab);
    });
  }, [orders, tab]);

  const columns = ["received", "preparing", "ready"];

  return (
    <div data-testid="kds-module" className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {SECTIONS.map((s) => (
          <button key={s.key} data-testid={`kds-section-${s.key}`} onClick={() => setTab(s.key)}
                  className={`px-4 h-9 rounded-xl text-sm transition-all ${tab === s.key ? "bg-slate-900 text-white" : "glass text-slate-700 hover:text-slate-900"}`}>
            {s.label}
          </button>
        ))}
        <div className="ml-auto text-xs text-slate-500 flex items-center gap-2 px-3 h-9 glass rounded-xl">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live · auto-refresh 30s
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {columns.map((col) => {
          const list = visible.filter((o) => o.status === col);
          return (
            <div key={col} className="glass rounded-2xl p-4 min-h-[60vh]">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${col === "received" ? "bg-slate-400" : col === "preparing" ? "bg-amber-500" : "bg-emerald-500"}`} />
                  <span className="text-xs uppercase tracking-widest text-slate-600 font-medium">{STATUS_META[col].label}</span>
                </div>
                <span className="text-xs text-slate-500">{list.length}</span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {list.map((o) => {
                    const mins = elapsed(o.created_at);
                    const urgent = mins > 15 && o.status !== "ready";
                    const meta = STATUS_META[o.status];
                    return (
                      <motion.div
                        key={o.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        data-testid={`kds-order-${o.id}`}
                        className={`bg-white rounded-2xl p-4 border-l-4 ${meta.border} shadow-sm hover:shadow-md transition-all ${urgent ? "kds-urgent" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-medium tracking-tight">{o.table_number || "Takeout"}</span>
                            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${meta.tint}`}>{meta.label}</span>
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${urgent ? "text-red-600 font-medium" : "text-slate-500"}`}>
                            <Clock size={12} /> {mins}m
                          </div>
                        </div>
                        <ul className="space-y-1 mb-3">
                          {o.items.map((it, i) => (
                            <li key={i} className="text-sm text-slate-800 flex justify-between gap-2">
                              <span><span className="text-slate-400 mr-1">{it.qty}×</span>{it.name}</span>
                              <span className="text-[10px] uppercase tracking-widest text-slate-400 self-center">{it.section}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-xs text-slate-500">by {o.waiter_name || "—"}</span>
                          <button data-testid={`kds-advance-${o.id}`} onClick={() => advance(o)}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1">
                            {o.status === "ready" ? <><CheckCircle2 size={13} /> Mark served</> :
                             o.status === "preparing" ? <><Flame size={13} /> Mark ready</> :
                             <><ChefHat size={13} /> Start cooking</>}
                          </button>
                        </div>
                        {urgent && (
                          <div className="mt-2 text-[11px] text-red-600 flex items-center gap-1">
                            <AlertTriangle size={11} /> Delayed — needs attention
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {list.length === 0 && (
                  <div className="text-xs text-slate-400 text-center py-12">No orders in this stage</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
