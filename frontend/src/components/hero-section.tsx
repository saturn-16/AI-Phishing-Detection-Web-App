"use client";

import { ArrowRight } from "lucide-react";
import { ThreatPipeline } from "@/components/ui/threat-pipeline";
import { SplitText } from "@/components/ui/split-text";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 px-6 md:px-12 select-none">
      {/* Dark overlay for strong contrast and readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/60 z-0 pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

        {/* Left — Phishing Threat Pipeline Visualizer */}
        <div className="flex justify-center w-full">
          <ThreatPipeline />
        </div>

        {/* Right — Text with SplitText Animation */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight leading-[1.1] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            <SplitText text="Think Before You Click." charSpeed={0.03} delay={0.1} />
          </h1>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-emerald-400 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <SplitText text="Detect Phishing Before It Detects You." charSpeed={0.025} delay={0.8} />
          </h2>
          <p className="text-zinc-300 text-lg leading-relaxed max-w-lg drop-shadow-[0_1px_5px_rgba(0,0,0,0.8)]">
            <SplitText
              text="Analyze suspicious URLs using AI-powered threat detection, real-time intelligence, and security scoring—before they become a threat."
              charSpeed={0.008}
              delay={1.5}
            />
          </p>
          <div className="pt-2">
            <a
              href="#scanner"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] text-sm"
            >
              Test URL
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
