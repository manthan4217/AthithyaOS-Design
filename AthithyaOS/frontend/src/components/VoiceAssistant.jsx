import React, { useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
export default function VoiceAssistant({ onCommand }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef(null);
  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error("Voice recognition not supported on this browser"); return; }
    const r = new SR();
    r.lang = "en-IN"; r.interimResults = true; r.continuous = false;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => { setListening(false); toast.error("Could not capture voice"); };
    r.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(" ");
      setTranscript(text);
      if (e.results[e.results.length - 1].isFinal) {
        onCommand?.(text);
        setTimeout(() => setTranscript(""), 1500);
      }
    };
    recRef.current = r;
    r.start();
  };
  const stop = () => recRef.current?.stop();
  return (
    <>
      <button
        data-testid="voice-assistant-btn"
        onClick={() => (listening ? stop() : start())}
        className={`relative h-11 w-11 rounded-xl grid place-items-center transition-all hover:-translate-y-1 ${
          listening ? "bg-gradient-to-br from-emerald-400 to-cyan-400 text-white" : "bg-white/60 text-slate-700 hover:bg-white"
        }`}
        title="Voice Assistant — say 'open kitchen', 'open dashboard'…"
      >
        {listening ? <MicOff size={18} /> : <Mic size={18} strokeWidth={1.8} />}
        {listening && <span className="absolute -inset-1 rounded-2xl jarvis-orb opacity-30" />}
      </button>
      {transcript && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 glass-strong px-4 py-2 rounded-full text-sm text-slate-700 shadow-lg z-50">
          <span className="text-emerald-600 mr-2">●</span>{transcript}
        </div>
      )}
    </>
  );
}
