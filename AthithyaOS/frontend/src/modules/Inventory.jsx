import React, { useEffect, useState } from "react";
import { api } from "@/context/AuthContext";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";

export default function Inventory() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/inventory").then((r) => setItems(r.data || [])); }, []);

  const low = items.filter((i) => i.stock <= i.reorder_level);
  const value = items.reduce((s, i) => s + i.stock * i.cost_per_unit, 0);

  return (
    <div data-testid="inventory-module" className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "Total Items", v: items.length, i: Package, tint: "bg-slate-100 text-slate-700" },
          { l: "Low Stock",   v: low.length,    i: AlertTriangle, tint: "bg-amber-50 text-amber-700" },
          { l: "Stock Value", v: `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, i: TrendingDown, tint: "bg-emerald-50 text-emerald-700" },
          { l: "Active Vendors", v: new Set(items.map((i) => i.vendor)).size, i: Package, tint: "bg-cyan-50 text-cyan-700" },
        ].map((s, i) => {
          const Icon = s.i;
          return (
            <div key={i} className="glass rounded-2xl p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${s.tint} grid place-items-center`}><Icon size={16} /></div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500">{s.l}</div>
                <div className="text-xl font-light tracking-tight">{s.v}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-lg font-light tracking-tight">Raw Materials & Stock</h3>
          <button className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white">+ Add item</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Item</th>
                <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Stock</th>
                <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Cost</th>
                <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Vendor</th>
                <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const isLow = it.stock <= it.reorder_level;
                const ratio = Math.min(1, it.stock / (it.reorder_level * 2));
                return (
                  <tr key={it.id} data-testid={`inv-${it.id}`} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-medium">{it.name}</td>
                    <td className="px-5 py-3 text-slate-600">{it.category}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{it.stock} {it.unit}</span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, background: isLow ? "#EF4444" : "#10B981" }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">₹{it.cost_per_unit}/{it.unit}</td>
                    <td className="px-5 py-3 text-slate-600">{it.vendor || "—"}</td>
                    <td className="px-5 py-3">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px]">
                          <AlertTriangle size={11} /> Reorder
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px]">
                          ● In stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
