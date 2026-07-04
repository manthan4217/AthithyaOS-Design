import React from "react";
import { Switch } from "@/components/ui/switch";
import { Bell, Globe, Moon, Shield, Database, Building2 } from "lucide-react";
const GROUPS = [
  { icon: Building2, title: "Branch", items: [
    { k: "Branch name", v: "Athithya Cuisines · Bandra West" },
    { k: "GST Number",  v: "27ABCDE1234F1Z5" },
    { k: "Currency",    v: "INR (₹)" },
    { k: "Timezone",    v: "Asia/Kolkata · GMT+5:30" },
  ]},
  { icon: Bell, title: "Notifications", toggles: [
    "New orders", "Kitchen ready alerts", "Reservation arrivals",
    "Low inventory warnings", "Staff late check-ins", "Daily summary email",
  ]},
  { icon: Shield, title: "Security & Access", toggles: [
    "Require manager approval for refunds", "Two-factor for owner login",
    "Auto-logout after 30 mins of inactivity", "Audit log all financial actions",
  ]},
  { icon: Database, title: "Backup & Data", items: [
    { k: "Auto-backup",  v: "Daily · 03:00 AM" },
    { k: "Storage used", v: "1.4 GB / 50 GB" },
    { k: "Last backup",  v: "Today, 03:00 AM" },
  ]},
];
export default function Settings() {
  return (
    <div data-testid="settings-module" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {GROUPS.map((g) => {
        const Icon = g.icon;
        return (
          <div key={g.title} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-slate-900 text-white grid place-items-center"><Icon size={15} /></div>
              <h3 className="text-lg font-light tracking-tight">{g.title}</h3>
            </div>
            {g.items && (
              <div className="space-y-3">
                {g.items.map((i) => (
                  <div key={i.k} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-b-0">
                    <span className="text-slate-600">{i.k}</span>
                    <span className="font-medium text-slate-900">{i.v}</span>
                  </div>
                ))}
              </div>
            )}
            {g.toggles && (
              <div className="space-y-3">
                {g.toggles.map((t, i) => (
                  <div key={t} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{t}</span>
                    <Switch defaultChecked={i % 3 !== 2} data-testid={`setting-toggle-${i}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
