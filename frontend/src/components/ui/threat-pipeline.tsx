"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mail, AlertTriangle, ShieldCheck, Cpu, Brain, Activity, Terminal, Lock, Check } from "lucide-react";

export function ThreatPipeline() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [threatCount, setThreatCount] = useState(84729);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax tilt effect based on mouse hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // range -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCoords({ x: x * 15, y: y * -15 }); // Tilt amount
  };

  const handleMouseLeave = () => {
    setCoords({ x: 0, y: 0 });
  };

  // Increment threat count for live feed effect
  useEffect(() => {
    const timer = setInterval(() => {
      setThreatCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${coords.y}deg) rotateY(${coords.x}deg)`,
        transition: "transform 0.1s ease-out",
      }}
      className="w-full max-w-lg rounded-3xl border border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden select-none group"
    >
      {/* Laser Border Light Sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

      {/* Holographic matrix grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.015)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      
      {/* Top Console Bar */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
            LIVE ANALYZER // NODE_01
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-[9px] font-mono text-zinc-500 tracking-wider">
            DB_REPLICAS: OK
          </span>
        </div>
      </div>

      {/* SVG Pipeline Visualization */}
      <div className="relative">
        <svg viewBox="0 0 400 240" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" fill="none">
          {/* SVG Glow Filter Definition */}
          <defs>
            <filter id="neon-glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="neon-glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="neon-glow-purple" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="laser-purple" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#c084fc" stopOpacity="1" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* PATH CONNECTIONS */}
          {/* Path 1: Source (35,120) to Scanner (160,120) */}
          <path d="M 65 120 H 160" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.15" />
          <path d="M 65 120 H 160" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="10 30" className="animate-[dash_2s_linear_infinite]" />

          {/* Path 2: Scanner (160,120) to Lexical AI (250,55) */}
          <path d="M 195 120 H 215 V 55 H 250" stroke="#a78bfa" strokeWidth="2" strokeOpacity="0.15" />
          <path d="M 195 120 H 215 V 55 H 250" stroke="url(#laser-purple)" strokeWidth="1.2" strokeDasharray="15 35" className="animate-[dash_2.5s_linear_infinite]" />

          {/* Path 3: Scanner (160,120) to Intel Feed (250,185) */}
          <path d="M 195 120 H 215 V 185 H 250" stroke="#a78bfa" strokeWidth="2" strokeOpacity="0.15" />
          <path d="M 195 120 H 215 V 185 H 250" stroke="url(#laser-purple)" strokeWidth="1.2" strokeDasharray="15 35" className="animate-[dash_2.5s_linear_infinite]" style={{ animationDelay: "0.5s" }} />

          {/* Path 4: Lexical AI (250,55) to Verdict (335,120) */}
          <path d="M 310 55 H 325 V 120" stroke="#10b981" strokeWidth="2" strokeOpacity="0.15" />
          <path d="M 310 55 H 325 V 120" stroke="#10b981" strokeWidth="1.2" strokeDasharray="10 20" className="animate-[dash_1.8s_linear_infinite]" />

          {/* Path 5: Intel Feed (250,185) to Verdict (335,120) */}
          <path d="M 310 185 H 325 V 120" stroke="#10b981" strokeWidth="2" strokeOpacity="0.15" />
          <path d="M 310 185 H 325 V 120" stroke="#10b981" strokeWidth="1.2" strokeDasharray="10 20" className="animate-[dash_1.8s_linear_infinite]" style={{ animationDelay: "0.3s" }} />

          {/* NODES */}
          {/* Node 1: Suspicious Mail */}
          <g transform="translate(15, 95)" filter="url(#neon-glow-red)">
            <rect x="0" y="0" width="50" height="50" rx="14" fill="#09090b" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="2" y="2" width="46" height="46" rx="12" fill="#ef4444" fillOpacity="0.05" />
            <foreignObject x="13" y="13" width="24" height="24">
              <Mail className="w-6 h-6 text-red-500 animate-pulse" />
            </foreignObject>
          </g>
          <text x="40" y="165" textAnchor="middle" fill="#fca5a5" fontSize="8" fontFamily="monospace" fontWeight="bold">SOURCE</text>

          {/* Node 2: Security Scanner */}
          <g transform="translate(145, 95)" filter="url(#neon-glow-purple)">
            <rect x="0" y="0" width="50" height="50" rx="14" fill="#09090b" stroke="#a78bfa" strokeWidth="1.5" />
            <rect x="2" y="2" width="46" height="46" rx="12" fill="#a78bfa" fillOpacity="0.05" />
            <foreignObject x="13" y="13" width="24" height="24">
              <Cpu className="w-6 h-6 text-purple-400 animate-spin" style={{ animationDuration: "10s" }} />
            </foreignObject>
          </g>
          <text x="170" y="165" textAnchor="middle" fill="#d8b4fe" fontSize="8" fontFamily="monospace" fontWeight="bold">SCANNER</text>

          {/* Node 3: Lexical Classifier */}
          <g transform="translate(240, 30)">
            <rect x="0" y="0" width="70" height="40" rx="10" fill="#09090b" stroke="#3f3f46" strokeWidth="1" />
            <text x="35" y="24" textAnchor="middle" fill="#a1a1aa" fontSize="7" fontFamily="monospace">LEXICAL</text>
            <circle cx="35" cy="9" r="2" fill="#a78bfa" className="animate-pulse" />
          </g>

          {/* Node 4: Intelligence Feed */}
          <g transform="translate(240, 160)">
            <rect x="0" y="0" width="70" height="40" rx="10" fill="#09090b" stroke="#3f3f46" strokeWidth="1" />
            <text x="35" y="24" textAnchor="middle" fill="#a1a1aa" fontSize="7" fontFamily="monospace">INTEL DB</text>
            <circle cx="35" cy="9" r="2" fill="#a78bfa" className="animate-pulse" />
          </g>

          {/* Node 5: Verdict Shield */}
          <g transform="translate(335, 95)" filter="url(#neon-glow-emerald)">
            <rect x="0" y="0" width="50" height="50" rx="14" fill="#09090b" stroke="#10b981" strokeWidth="1.5" />
            <rect x="2" y="2" width="46" height="46" rx="12" fill="#10b981" fillOpacity="0.05" />
            <foreignObject x="13" y="13" width="24" height="24">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </foreignObject>
          </g>
          <text x="360" y="165" textAnchor="middle" fill="#6ee7b7" fontSize="8" fontFamily="monospace" fontWeight="bold">VERDICT</text>
        </svg>

        {/* Dashboard styles for laser path animation */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes dash {
            to { stroke-dashoffset: -100; }
          }
        `}} />
      </div>

      {/* Cyber Console Metrics Ticker */}
      <div className="grid grid-cols-3 gap-3 border-t border-zinc-900 pt-5 mt-4 text-center font-mono">
        <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-900">
          <div className="text-[8px] text-zinc-500 uppercase">SYS_THREATS_BLOCKED</div>
          <div className="text-sm font-bold text-red-500 mt-1">{threatCount.toLocaleString()}</div>
        </div>
        <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-900">
          <div className="text-[8px] text-zinc-500 uppercase">INFERENCE_TIME</div>
          <div className="text-sm font-bold text-purple-400 mt-1">12.4ms</div>
        </div>
        <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-900">
          <div className="text-[8px] text-zinc-500 uppercase">THREAT_LEVEL</div>
          <div className="text-sm font-bold text-emerald-400 mt-1">SECURE</div>
        </div>
      </div>
    </div>
  );
}
