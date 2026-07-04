import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/context/AuthContext";
import { Plus, Minus, Trash2, Receipt, Search, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function POS() {
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState([]); // [{menu_item_id, name, qty, price, section}]
  const [tableId, setTableId] = useState("");

  useEffect(() => {
    api.get("/menu").then((r) => setMenu(r.data || []));
    api.get("/tables").then((r) => setTables(r.data || []));
  }, []);

  const cats = useMemo(() => ["All", ...Array.from(new Set(menu.map((m) => m.category)))], [menu]);
  const visible = useMemo(() => menu.filter((m) => (cat === "All" || m.category === cat) && (!q || m.name.toLowerCase().includes(q.toLowerCase()))), [menu, cat, q]);

  const addItem = (m) => {
    setCart((c) => {
      const i = c.findIndex((x) => x.menu_item_id === m.id);
      if (i >= 0) { const cp = [...c]; cp[i] = { ...cp[i], qty: cp[i].qty + 1 }; return cp; }
      return [...c, { menu_item_id: m.id, name: m.name, qty: 1, price: m.price, section: m.section }];
    });
  };
  const updQty = (id, delta) => setCart((c) => c.flatMap((x) => x.menu_item_id === id ? (x.qty + delta <= 0 ? [] : [{ ...x, qty: x.qty + delta }]) : [x]));
  const removeItem = (id) => setCart((c) => c.filter((x) => x.menu_item_id !== id));

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const gst = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + gst).toFixed(2);

  const sendOrder = async () => {
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    try {
      await api.post("/orders", { table_id: tableId || null, items: cart });
      toast.success(`Order sent to kitchen · ₹${total}`);
      setCart([]); setTableId("");
      api.get("/tables").then((r) => setTables(r.data || []));
    } catch { toast.error("Failed to send order"); }
  };

  return (
    <div data-testid="pos-module" className="grid grid-cols-12 gap-5">
      {/* Menu */}
      <div className="col-span-12 lg:col-span-8 glass rounded-2xl p-5">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input data-testid="pos-search" placeholder="Search menu…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 h-10 rounded-xl bg-white/80" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {cats.map((c) => (
            <button key={c} data-testid={`pos-cat-${c}`} onClick={() => setCat(c)}
                    className={`px-3 h-8 rounded-xl text-xs transition-all ${cat === c ? "bg-slate-900 text-white" : "bg-white/70 text-slate-700 hover:bg-white"}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {visible.map((m) => (
            <button key={m.id} data-testid={`menu-${m.id}`} onClick={() => addItem(m)}
                    className="text-left bg-white rounded-2xl p-4 border border-slate-200 hover:-translate-y-1 hover:shadow-md hover:border-emerald-400 transition-all min-h-[110px]">
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">{m.section}</div>
              <div className="text-sm font-medium text-slate-900 leading-snug">{m.name}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-base font-light">₹{m.price}</span>
                <span className="h-7 w-7 rounded-lg bg-slate-900 text-white grid place-items-center"><Plus size={14} /></span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="col-span-12 lg:col-span-4 glass-strong rounded-2xl p-5 sticky top-20 self-start">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-light tracking-tight flex items-center gap-2"><Receipt size={16} /> Current Order</h3>
          {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-600">Clear</button>}
        </div>

        <select data-testid="pos-table" value={tableId} onChange={(e) => setTableId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm mb-3">
          <option value="">Takeout / No table</option>
          {tables.map((t) => <option key={t.id} value={t.id}>{t.number} · {t.zone} ({t.capacity} seats)</option>)}
        </select>

        <div className="space-y-2 max-h-[36vh] overflow-y-auto scrollbar-thin pr-1">
          {cart.length === 0 && <div className="text-xs text-slate-400 text-center py-10">Tap items to add</div>}
          {cart.map((x) => (
            <div key={x.menu_item_id} data-testid={`cart-${x.menu_item_id}`} className="bg-white rounded-xl p-3 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{x.name}</div>
                <div className="text-xs text-slate-500">₹{x.price} × {x.qty}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updQty(x.menu_item_id, -1)} className="h-7 w-7 rounded-lg bg-slate-100 grid place-items-center hover:bg-slate-200"><Minus size={12} /></button>
                <span className="text-sm w-5 text-center">{x.qty}</span>
                <button onClick={() => updQty(x.menu_item_id, +1)} className="h-7 w-7 rounded-lg bg-slate-100 grid place-items-center hover:bg-slate-200"><Plus size={12} /></button>
                <button onClick={() => removeItem(x.menu_item_id)} className="h-7 w-7 rounded-lg text-red-500 hover:bg-red-50 grid place-items-center"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-slate-600"><span>GST · 5%</span><span>₹{gst.toFixed(2)}</span></div>
          <div className="flex justify-between text-lg font-medium tracking-tight pt-2"><span>Total</span><span className="flex items-center"><IndianRupee size={16} />{total.toFixed(2)}</span></div>
        </div>

        <button data-testid="pos-send-order" onClick={sendOrder} disabled={cart.length === 0}
                className="mt-4 w-full h-12 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          Send to kitchen
        </button>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
          <div className="rounded-lg p-2 bg-emerald-50 text-emerald-700 text-center">UPI</div>
          <div className="rounded-lg p-2 bg-cyan-50 text-cyan-700 text-center">Card</div>
          <div className="rounded-lg p-2 bg-amber-50 text-amber-700 text-center">Cash</div>
        </div>
      </div>
    </div>
  );
}
