import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/context/AuthContext";
import { Users, Crown, TreePine, Building2, Wind } from "lucide-react";
import { toast } from "sonner";

const ZONES = [
  { key: "main",     label: "Main Hall", icon: Building2 },
  { key: "vip",      label: "VIP",       icon: Crown },
  { key: "outdoor",  label: "Outdoor",   icon: TreePine },
  { key: "banquet",  label: "Banquet",   icon: Wind },
];
const STATUS = {
  available: { color: "#10B981", label: "Available", ring: "ring-emerald-300" },
  occupied:  { color: "#0F172A", label: "Occupied",  ring: "ring-slate-700" },
  reserved:  { color: "#D4AF37", label: "Reserved",  ring: "ring-amber-400" },
  cleaning:  { color: "#3B82F6", label: "Cleaning",  ring: "ring-blue-400" },
};

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [zone, setZone] = useState("main");
  const [picked, setPicked] = useState(null);

  const load = () => api.get("/tables").then((r) => setTables(r.data || []));
  useEffect(() => { load(); }, []);

  const list = useMemo(() => tables.filter((t) => t.zone === zone), [tables, zone]);
  const counts = useMemo(() => {
    const c = { available: 0, occupied: 0, reserved: 0, cleaning: 0 };
    tables.forEach((t) => { c[t.status] = (c[t.status] || 0) + 1; });
    return c;
  }, [tables]);

  const cycle = async (t) => {
    const order = ["available", "occupied", "reserved", "cleaning"];
    const next = order[(order.indexOf(t.status) + 1) % order.length];
    await api.patch(`/tables/${t.id}`, { status: next });
    toast.success(`${t.number} → ${STATUS[next].label}`);
    load();
  };

  return (
    <div data-testid="tables-module" className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUS).map(([k, s]) => (
          <div key={k} className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl grid place-items-center" style={{ background: `${s.color}1A`, color: s.color }}>
              <Users size={16} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500">{s.label}</div>
              <div className="text-xl font-light tracking-tight">{counts[k] || 0}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {ZONES.map((z) => {
            const Icon = z.icon;
            return (
              <button key={z.key} data-testid={`zone-${z.key}`} onClick={() => setZone(z.key)}
                      className={`px-4 h-9 rounded-xl text-sm flex items-center gap-2 transition-all ${zone === z.key ? "bg-slate-900 text-white" : "bg-white/70 text-slate-700 hover:bg-white"}`}>
                <Icon size={14} /> {z.label}
              </button>
            );
          })}
          <div className="ml-auto text-xs text-slate-500">Click a table to cycle its status</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 p-5 floor-tile rounded-2xl">
          {list.map((t) => {
            const s = STATUS[t.status];
            return (
              <button
                key={t.id}
                data-testid={`table-${t.number}`}
                onClick={() => { setPicked(t); cycle(t); }}
                className={`relative aspect-square ${t.shape === "round" ? "rounded-full" : "rounded-2xl"} bg-white border-2 hover:-translate-y-1 hover:shadow-lg transition-all grid place-items-center`}
                style={{ borderColor: s.color }}
              >
                <div className="text-center">
                  <div className="text-base font-medium tracking-tight">{t.number}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">{t.capacity} seats</div>
                  <div className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${s.color}1A`, color: s.color }}>{s.label}</div>
                </div>
                {t.status === "occupied" && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
