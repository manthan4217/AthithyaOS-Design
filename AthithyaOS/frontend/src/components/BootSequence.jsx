import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
export default function BootSequence({ onDone, steady = false }) {
  const [phase, setPhase] = useState(0);
  const lines = [
    "Initializing Athithya kernel…",
    "Mounting hospitality modules…",
    "Connecting kitchen display services…",
    "Loading AI insight engine…",
    "Welcome.",
  ];
  useEffect(() => {
    if (steady) return;
    const timers = [];
    lines.forEach((_, i) => timers.push(setTimeout(() => setPhase(i + 1), 450 * (i + 1))));
    timers.push(setTimeout(() => onDone?.(), 450 * lines.length + 600));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line
  }, []);
  return (
    <div data-testid="boot-screen" className="fixed inset-0 z-[100] flex items-center justify-center"
         style={{ background: "radial-gradient(1200px 800px at 50% 40%, #0b1426 0%, #050913 70%, #02040a 100%)" }}>
      <div className="absolute inset-0 opacity-30"
           style={{ backgroundImage: "radial-gradient(rgba(0,229,255,0.18) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="relative flex flex-col items-center gap-10">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="relative"
        >
          <div className="absolute -inset-10 rounded-full jarvis-orb opacity-40" />
          <svg width="160" height="160" viewBox="0 0 200 200" fill="none">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#10B981" />
                <stop offset="0.5" stopColor="#00E5FF" />
                <stop offset="1" stopColor="#D4AF37" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="78" stroke="url(#g1)" strokeWidth="2" className="boot-path" />
            <path d="M55 130 L100 50 L145 130 Z M75 115 H125" stroke="url(#g1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="boot-path" />
          </svg>
        </motion.div>
        <div className="text-center">
          <div className="text-white font-light tracking-[0.4em] text-sm mb-2">ATHITHYA</div>
          <div className="text-white/90 text-3xl font-light tracking-tight">Hospitality OS</div>
          <div className="text-white/40 text-xs mt-1 tracking-widest uppercase">Enterprise Edition · v1.0</div>
        </div>
        <div className="h-16 w-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-center text-emerald-300/80 text-sm tracking-wide"
            >
              {lines[Math.min(phase, lines.length - 1)]}
            </motion.div>
          </AnimatePresence>
          <div className="mt-4 h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(phase / lines.length) * 100}%` }}
                        transition={{ duration: 0.4 }} className="h-full bg-gradient-to-r from-emerald-400 via-cyan-300 to-amber-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
