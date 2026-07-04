import React, { useEffect, useState } from "react";
import { api } from "@/context/AuthContext";
import { Star, Phone } from "lucide-react";
const SHIFTS = { morning: "bg-amber-100 text-amber-700", afternoon: "bg-cyan-100 text-cyan-700", night: "bg-slate-900 text-white" };
const STATUS = { working: "bg-emerald-500", off: "bg-slate-400", leave: "bg-red-500" };
export default function Staff() {
  const [staff, setStaff] = useState([]);
  useEffect(() => { api.get("/staff").then((r) => setStaff(r.data || [])); }, []);
  return (
    <div data-testid="staff-module" className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s) => (
          <div key={s.id} data-testid={`staff-${s.id}`} className="glass rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="relative">
                <img src={s.avatar} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full ring-2 ring-white ${STATUS[s.status] || "bg-slate-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-medium tracking-tight truncate">{s.name}</div>
                <div className="text-xs text-slate-500">{s.role}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1"><Phone size={10} /> {s.phone}</div>
              </div>
              <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${SHIFTS[s.shift]}`}>{s.shift}</span>
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Performance</span>
                <span className="font-medium flex items-center gap-1"><Star size={11} className="fill-amber-400 text-amber-400" /> {s.performance}/100</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${s.performance}%` }} />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Monthly Salary</span>
              <span className="font-medium">₹{s.salary.toLocaleString("en-IN")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
