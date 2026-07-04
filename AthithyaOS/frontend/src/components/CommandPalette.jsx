import React, { useEffect } from "react";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem,
} from "@/components/ui/command";
import { Sparkles } from "lucide-react";
export default function CommandPalette({ open, onOpenChange, modules, onNavigate }) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput data-testid="cmd-input" placeholder="Search modules, tables, orders, settings…" />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <CommandItem
                key={m.key}
                onSelect={() => { onNavigate(m.key); onOpenChange(false); }}
                data-testid={`cmd-nav-${m.key}`}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>Open {m.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => { onNavigate("pos"); onOpenChange(false); }}>
            <Sparkles className="mr-2 h-4 w-4" /> New order
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("reservations"); onOpenChange(false); }}>
            <Sparkles className="mr-2 h-4 w-4" /> New reservation
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("ai"); onOpenChange(false); }}>
            <Sparkles className="mr-2 h-4 w-4" /> Ask AI for tonight's forecast
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
