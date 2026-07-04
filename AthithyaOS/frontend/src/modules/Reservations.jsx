import React, { useEffect, useState } from "react";
import { api } from "@/context/AuthContext";
import { Users, Clock, Phone, Calendar as CalIcon, Plus } from "lucide-react";
import { toast } from "sonner";
const STATUS = {
  confirmed: { tint: "bg-emerald-50 text-emerald-700", label: "Confirmed" },
  pending:   { tint: "bg-amber-50 text-amber-700",     label: "Pending" },
  seated:    { tint: "bg-cyan-50 text-cyan-700",       label: "Seated" },
  cancelled: { tint: "bg-red-50 text-red-700",         label: "Cancelled" },
};
export default function Reservations() {
  const [list, setList] = useState([]);
  const load = () => api.get("/reservations").then((r) => setList(r.data || []));
  useEffect(() => { load(); }, []);
  const addQuick = async () => {
    const r = {
      id: crypto.randomUUID(),
      customer_name: "Walk-in Guest", phone: "+91-00000-00000",
      date: new Date().toISOString().slice(0, 10), time: "20:30",
      party_size: 2, status: "pending",
    };
    await api.post("/reservations", r);
    toast.success("Reservation added");
    load();
  };
  return (
    <div data-testid="reservations-module" className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">Today · {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}</div>
        <button data-testid="res-add" onClick={addQuick} className="h-9 px-4 rounded-xl bg-slate-900 text-white text-sm flex items-center gap-2"><Plus size={14} /> New reservation</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((r) => {
          const s = STATUS[r.status] || STATUS.confirmed;
          return (
            <div key={r.id} data-testid={`res-${r.id}`} className="glass rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-medium tracking-tight">{r.customer_name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Phone size={11} /> {r.phone}</div>
                </div>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${s.tint}`}>{s.label}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl bg-white/70 p-2">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-1"><CalIcon size={10} /> Date</div>
                  <div className="font-medium mt-0.5">{r.date.slice(5)}</div>
                </div>
                <div className="rounded-xl bg-white/70 p-2">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-1"><Clock size={10} /> Time</div>
                  <div className="font-medium mt-0.5">{r.time}</div>
                </div>
                <div className="rounded-xl bg-white/70 p-2">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-1"><Users size={10} /> Party</div>
                  <div className="font-medium mt-0.5">{r.party_size}</div>
                </div>
              </div>
              {r.notes && <div className="mt-3 text-xs text-slate-500 italic">"{r.notes}"</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
