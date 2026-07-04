import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Bell, ChefHat, Calendar, AlertTriangle, IndianRupee, CheckCircle2, Users } from "lucide-react";
const ITEMS = [
  { icon: ChefHat,        tone: "emerald", title: "Kitchen Ready · Table T05",  body: "Tandoori Paneer + Butter Naan are ready to serve", time: "just now" },
  { icon: Calendar,       tone: "cyan",    title: "Reservation arrived",        body: "Rajesh Khanna · party of 4 · 7:30 PM",            time: "3m" },
  { icon: AlertTriangle,  tone: "amber",   title: "Inventory low",              body: "Paneer at 4.5 kg — below reorder level",          time: "12m" },
  { icon: IndianRupee,    tone: "emerald", title: "Payment received",           body: "₹2,420 via UPI · Order #1042",                    time: "18m" },
  { icon: Users,          tone: "slate",   title: "Staff late check-in",        body: "Karan Patel checked in 22 min late",              time: "1h" },
  { icon: CheckCircle2,   tone: "emerald", title: "Cash settlement complete",   body: "End-of-day variance: +₹120",                       time: "yesterday" },
];
const tones = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cyan:    "bg-cyan-50 text-cyan-700 ring-cyan-200",
  amber:   "bg-amber-50 text-amber-700 ring-amber-200",
  slate:   "bg-slate-100 text-slate-700 ring-slate-200",
};
export default function NotificationCenter({ open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent data-testid="notification-panel" className="w-[400px] sm:w-[440px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl font-light tracking-tight">
            <Bell size={18} /> Notifications
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-2 scrollbar-thin overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 100px)" }}>
          {ITEMS.map((n, i) => {
            const Icon = n.icon;
            return (
              <div key={i} className="flex gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className={`h-9 w-9 shrink-0 rounded-xl grid place-items-center ring-1 ${tones[n.tone]}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-slate-900 truncate">{n.title}</div>
                    <div className="text-[11px] text-slate-400 shrink-0">{n.time}</div>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{n.body}</div>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
