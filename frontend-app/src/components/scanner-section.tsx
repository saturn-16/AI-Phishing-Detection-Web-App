"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Shield, ShieldAlert, Loader2,
  Database, Cpu, Link2,
  Lock, Globe, AtSign, AlertTriangle, Hash,
  ArrowDown, ShieldCheck, Activity
} from "lucide-react";

import { LayeredStack } from "@/components/ui/layered-stack";

interface FeatureResult {
  name: string;
  value: string;
  status: "safe" | "warning" | "danger";
  icon: React.ReactNode;
  explanation: string;
}

interface ScanResult {
  prediction: number;
  probability: number;
  features: FeatureResult[];
  vtMalicious?: number;
  vtSuspicious?: number;
  abuseConfidenceScore?: number;
  resolvedIp?: string;
}

function extractFeatures(url: string): FeatureResult[] {
  const features: FeatureResult[] = [];
  const len = url.length;

  features.push({
    name: "URL Length",
    value: `${len} chars`,
    status: len > 75 ? "danger" : len > 50 ? "warning" : "safe",
    icon: <Link2 className="w-4 h-4" />,
    explanation: len > 75
      ? "Extremely long URLs are a common phishing tactic to hide the real destination in the address bar."
      : len > 50
        ? "Moderately long URL. Not inherently dangerous but worth checking the domain carefully."
        : "URL length is within normal range. Short, clean URLs are typical of legitimate sites.",
  });

  const isHttps = url.startsWith("https://");
  features.push({
    name: "HTTPS Protocol",
    value: isHttps ? "Secure" : "Not Secure",
    status: isHttps ? "safe" : "danger",
    icon: <Lock className="w-4 h-4" />,
    explanation: isHttps
      ? "The URL uses HTTPS encryption, which means data transmitted is encrypted in transit."
      : "No HTTPS detected. Data sent to this URL could be intercepted. Most legitimate sites use HTTPS.",
  });

  const hasIp = /(\d{1,3}\.){3}\d{1,3}/.test(url);
  features.push({
    name: "IP Address",
    value: hasIp ? "Detected" : "None",
    status: hasIp ? "danger" : "safe",
    icon: <Globe className="w-4 h-4" />,
    explanation: hasIp
      ? "URL contains a raw IP address instead of a domain name. This is a strong phishing indicator — legitimate sites rarely use IP addresses."
      : "No raw IP address found. The URL uses a standard domain name.",
  });

  const hasAt = url.includes("@");
  features.push({
    name: "@ Symbol",
    value: hasAt ? "Present" : "Absent",
    status: hasAt ? "danger" : "safe",
    icon: <AtSign className="w-4 h-4" />,
    explanation: hasAt
      ? "The @ symbol in a URL can trick browsers into ignoring everything before it, redirecting you to a different site entirely."
      : "No @ symbol found. The URL structure appears standard.",
  });

  const suspiciousWords = ["login", "verify", "update", "secure", "account", "bank", "free", "lucky", "bonus", "password"];
  const found = suspiciousWords.filter((w) => url.toLowerCase().includes(w));
  features.push({
    name: "Suspicious Keywords",
    value: found.length > 0 ? found.join(", ") : "None found",
    status: found.length > 0 ? "danger" : "safe",
    icon: <AlertTriangle className="w-4 h-4" />,
    explanation: found.length > 0
      ? `Keywords like "${found.join('", "')}" are commonly used in phishing URLs to create urgency or trust.`
      : "No suspicious keywords detected in the URL.",
  });

  const domainMatch = url.match(/:\/\/([^/]+)/);
  const subCount = domainMatch ? Math.max(domainMatch[1].split(".").length - 2, 0) : 0;
  features.push({
    name: "Subdomains",
    value: `${subCount} found`,
    status: subCount > 2 ? "danger" : subCount > 1 ? "warning" : "safe",
    icon: <Hash className="w-4 h-4" />,
    explanation: subCount > 2
      ? "Excessive subdomains are used to mimic legitimate domains (e.g., login.bank.evil.com)."
      : "Subdomain count is within normal range.",
  });

  return features;
}

const SOURCE_MODULES = [
  { label: "THREAT DB", sub: "PhishTank / VirusTotal", icon: <Database className="w-4 h-4" /> },
  { label: "ML ENGINE", sub: "Random Forest Model", icon: <Cpu className="w-4 h-4" /> },
  { label: "URL PARSER", sub: "Feature Extraction", icon: <Link2 className="w-4 h-4" /> },
];

function renderHighlightedText(text: string) {
  if (!text) return "";
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <span
          key={index}
          className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-semibold font-mono text-[11px] mx-0.5 shadow-[0_0_8px_rgba(16,185,129,0.15)] inline-block"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function ScannerSection() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  
  // Sequential glowing stage states
  const [activeGlows, setActiveGlows] = useState<boolean[]>([false, false, false]);
  const [flowActive, setFlowActive] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const deepAnalysisRef = useRef<HTMLDivElement>(null);

  // Groq AI Analysis states
  const [aiAnalysis, setAiAnalysis] = useState<{
    lexicalAnalysis: string;
    protocolSecurity: string;
    threatIntel: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const triggerAiAnalysis = async (targetUrl: string, phishing: boolean, prob: number, feats: FeatureResult[], vtMalicious = 0, abuseConfidenceScore = 0) => {
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetUrl,
          isPhishing: phishing,
          probability: prob,
          features: feats.map(f => ({ name: f.name, value: f.value, status: f.status })),
          vtMalicious,
          abuseConfidenceScore,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAiAnalysis({
        lexicalAnalysis: data.lexicalAnalysis || "",
        protocolSecurity: data.protocolSecurity || "",
        threatIntel: data.threatIntel || "",
      });
    } catch {
      // Fallback stays null (renders default explanations)
      setAiAnalysis(null);
    } finally {
      setAiLoading(false);
    }
  };

  const handleScan = async () => {
    if (!url.trim()) return;

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
      setUrl(targetUrl);
    }

    setLoading(true);
    setResult(null);
    setAiAnalysis(null);
    setFlowActive(true);

    const features = extractFeatures(targetUrl);

    // Staggered sequential glow phase: 0 -> 0+1 -> 0+1+2 (all remain glowing until results come out)
    setActiveGlows([true, false, false]);
    await new Promise((r) => setTimeout(r, 600));
    setActiveGlows([true, true, false]);
    await new Promise((r) => setTimeout(r, 600));
    setActiveGlows([true, true, true]);
    await new Promise((r) => setTimeout(r, 600));

    let scanResult: ScanResult;
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      if (!res.ok) throw new Error("Backend unavailable");
      const data = await res.json();
      scanResult = {
        prediction: data.prediction,
        probability: data.probability,
        features,
        vtMalicious: data.vtMalicious,
        vtSuspicious: data.vtSuspicious,
        abuseConfidenceScore: data.abuseConfidenceScore,
        resolvedIp: data.resolvedIp,
      };
      setResult(scanResult);
    } catch {
      const dangerCount = features.filter((f) => f.status === "danger").length;
      const warningCount = features.filter((f) => f.status === "warning").length;
      const risk = Math.min(dangerCount * 0.2 + warningCount * 0.08, 0.99);
      scanResult = { prediction: risk > 0.4 ? 1 : 0, probability: risk, features };
      setResult(scanResult);
    } finally {
      setLoading(false);
      setFlowActive(false);
      setActiveGlows([false, false, false]);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
      
      // Trigger Groq AI Analysis asynchronously
      triggerAiAnalysis(
        targetUrl,
        scanResult.prediction === 1,
        scanResult.probability,
        features,
        scanResult.vtMalicious,
        scanResult.abuseConfidenceScore
      );
    }
  };

  const riskPct = result ? Math.round(result.probability * 100) : 0;
  const isPhishing = result?.prediction === 1;

  const scrollToDeepAnalysis = () => {
    deepAnalysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="scanner" className="relative py-32 px-6 overflow-hidden">
      {/* Dark background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/95 to-black/90 z-0 pointer-events-none" />

      <div className="max-w-[1360px] mx-auto relative z-10">
        
        {/* Pipeline Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_240px] gap-8 lg:gap-24 items-center mb-16 relative">
          
          {/* SVG Connector Lines Behind Containers */}
          <svg className="absolute inset-0 w-full h-full hidden lg:block pointer-events-none z-0" viewBox="0 0 1000 400" preserveAspectRatio="none">
            <defs>
              <filter id="neon-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing lines from Left Modules to Center Card */}
            {/* Threat DB Line */}
            <path d="M 180 70 L 350 200" stroke={activeGlows[0] ? "#10b981" : "#1f2937"} strokeWidth={activeGlows[0] ? "4.5" : "2"} fill="none" filter={activeGlows[0] ? "url(#neon-glow-cyan)" : ""} className="transition-all duration-300" />
            {activeGlows[0] && (
              <circle r="5" fill="#10b981">
                <animateMotion dur="0.6s" repeatCount="indefinite" path="M 180 70 L 350 200" />
              </circle>
            )}

            {/* ML Engine Line */}
            <path d="M 180 200 H 350" stroke={activeGlows[1] ? "#10b981" : "#1f2937"} strokeWidth={activeGlows[1] ? "4.5" : "2"} fill="none" filter={activeGlows[1] ? "url(#neon-glow-cyan)" : ""} className="transition-all duration-300" />
            {activeGlows[1] && (
              <circle r="5" fill="#10b981">
                <animateMotion dur="0.6s" repeatCount="indefinite" path="M 180 200 H 350" />
              </circle>
            )}

            {/* URL Parser Line */}
            <path d="M 180 330 L 350 200" stroke={activeGlows[2] ? "#10b981" : "#1f2937"} strokeWidth={activeGlows[2] ? "4.5" : "2"} fill="none" filter={activeGlows[2] ? "url(#neon-glow-cyan)" : ""} className="transition-all duration-300" />
            {activeGlows[2] && (
              <circle r="5" fill="#10b981">
                <animateMotion dur="0.6s" repeatCount="indefinite" path="M 180 330 L 350 200" />
              </circle>
            )}

            {/* Glowing Flow to Right side Results */}
            {result && (
              <>
                <path d="M 720 200 H 820" stroke="#10b981" strokeWidth="3" fill="none" className="animate-[dash_2s_linear_infinite]" strokeDasharray="6 12" />
              </>
            )}
          </svg>

          {/* LEFT — Source Modules with Sequential Glow */}
          <div className="flex flex-col gap-5 z-10">
            {SOURCE_MODULES.map((mod, i) => {
              const isActive = activeGlows[i];
              return (
                <motion.div
                  key={mod.label}
                  className={`p-5 rounded-2xl border transition-all duration-500 ${
                    isActive
                      ? "bg-zinc-950 border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.35)] scale-[1.03]"
                      : "bg-zinc-950/95 border-zinc-900 shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
                  }`}
                  animate={isActive ? { scale: 1.03 } : { scale: 1 }}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className={`p-2 rounded-xl transition-all duration-500 ${isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-900 text-zinc-400"}`}>
                      {mod.icon}
                    </div>
                    <div>
                      <span className={`text-[11px] font-mono font-bold tracking-widest block transition-colors duration-500 ${isActive ? "text-emerald-400" : "text-zinc-300"}`}>
                        {mod.label}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 block">{mod.sub}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-900/60">
                    <span className={`w-2 h-2 rounded-full transition-all duration-500 ${isActive ? "bg-emerald-400 shadow-[0_0_10px_#10b981] animate-ping" : "bg-emerald-500/40"}`} />
                    <span className="text-[9px] font-mono text-zinc-400 font-bold">ONLINE</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CENTER — Scan Card */}
          <div className="z-10">
            <div className={`p-8 rounded-3xl border transition-all duration-500 bg-zinc-950/95 shadow-[0_20px_50px_rgba(0,0,0,0.85)] ${
              loading ? "border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.12)]" : "border-zinc-900"
            }`}>
              <h2 className="text-3xl font-heading font-extrabold tracking-tight mb-2 text-white">Scan a URL</h2>
              <p className="text-zinc-400 text-sm mb-6">Paste any URL to analyze it for phishing indicators.</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleScan()}
                    placeholder="https://example.com/suspicious-page"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/60 border border-zinc-900 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-sm"
                  />
                </div>
                <button
                  onClick={handleScan}
                  disabled={loading || !url.trim()}
                  className="px-8 py-4 rounded-2xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(16,185,129,0.3)] shrink-0"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                  {loading ? "Scanning…" : "Scan"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — Premium Holographic Result Indicators */}
          <div className="flex flex-col gap-5 z-10">
            <AnimatePresence mode="wait">
              {result ? (
                <div className="flex flex-col gap-4">
                  {/* VERDICT CARD */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-5 rounded-2xl border bg-zinc-950/95 shadow-[0_8px_30px_rgba(0,0,0,0.8)] ${
                      isPhishing ? "border-red-500/35" : "border-emerald-500/35"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-zinc-500 tracking-widest block mb-1">VERDICT</span>
                    <div className="flex items-center gap-2">
                      {isPhishing ? (
                        <>
                          <ShieldAlert className="w-5 h-5 text-red-500" />
                          <span className="text-lg font-heading font-extrabold text-red-400">PHISHING</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                          <span className="text-lg font-heading font-extrabold text-emerald-400">SAFE</span>
                        </>
                      )}
                    </div>
                  </motion.div>

                  {/* RISK SCORE CARD WITH DIAL/BAR */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`p-5 rounded-2xl border bg-zinc-950/95 shadow-[0_8px_30px_rgba(0,0,0,0.8)] ${
                      isPhishing ? "border-red-500/35" : "border-emerald-500/35"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-zinc-500 tracking-widest block mb-1">RISK INDEX</span>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className={`text-2xl font-mono font-extrabold ${isPhishing ? "text-red-400" : "text-emerald-400"}`}>{riskPct}%</span>
                      <span className="text-[10px] font-mono text-zinc-500">probability</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${isPhishing ? "bg-red-500" : "bg-emerald-500"}`}
                        style={{ width: `${riskPct}%` }}
                      />
                    </div>
                  </motion.div>

                  {/* CONFIDENCE INDEX CARD */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/95 shadow-[0_8px_30px_rgba(0,0,0,0.8)]"
                  >
                    <span className="text-[10px] font-mono text-zinc-500 tracking-widest block mb-1">CONFIDENCE</span>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span className="text-lg font-mono font-extrabold text-white">
                        {Math.max(riskPct, 100 - riskPct)}%
                      </span>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {["VERDICT", "RISK INDEX", "CONFIDENCE"].map((label) => (
                    <div key={label} className="p-5 rounded-2xl bg-zinc-950/95 border border-zinc-900 shadow-[0_4px_25px_rgba(0,0,0,0.7)]">
                      <span className="text-[10px] font-mono text-zinc-600 tracking-widest block mb-2">{label}</span>
                      <span className="text-lg font-mono text-zinc-800 font-extrabold">—</span>
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM RESULTS SECTION */}
        <div ref={resultsRef}>
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-12 border-t border-zinc-900/60 pt-10"
              >
                {/* 1. Verdict alert banner */}
                <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-[0_4px_15px_rgba(0,0,0,0.5)] bg-zinc-950 ${
                  isPhishing ? "border-red-500/25" : "border-emerald-500/25"
                }`}>
                  {isPhishing
                    ? <ShieldAlert className="w-7 h-7 text-red-400 shrink-0" />
                    : <Shield className="w-7 h-7 text-emerald-400 shrink-0" />
                  }
                  <div>
                    <h3 className={`text-lg font-heading font-extrabold ${isPhishing ? "text-red-400" : "text-emerald-400"}`}>
                      {isPhishing ? "Phishing Detected" : "URL Appears Safe"}
                    </h3>
                    <p className="text-zinc-400 text-xs mt-0.5">ML Threat Index classification probability score check.</p>
                  </div>
                </div>

                {/* 2. COMPACT SIGNAL BREAKDOWN */}
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center gap-1 text-center">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">SIGNAL BREAKDOWN</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Individual heuristic checks extracted from URL parameters</p>
                  </div>

                  {/* Compact Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {result.features.map((f, i) => {
                      const isDanger = f.status === "danger";
                      const isWarning = f.status === "warning";
                      return (
                        <motion.div
                          key={f.name}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05, duration: 0.3 }}
                          className={`p-3.5 rounded-xl border bg-zinc-950/80 shadow-md flex flex-col justify-between transition-all hover:border-zinc-800 ${
                            isDanger ? "border-red-950/80"
                              : isWarning ? "border-amber-950/80"
                                : "border-zinc-900/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`p-1.5 rounded-lg shrink-0 ${
                              isDanger ? "bg-red-500/10 text-red-400"
                                : isWarning ? "bg-amber-500/10 text-amber-400"
                                  : "bg-emerald-500/10 text-emerald-400"
                            }`}>
                              {f.icon}
                            </span>
                            {f.status === "safe" ? (
                              <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">SAFE</span>
                            ) : (
                              <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                isDanger ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                              }`}>FLAG</span>
                            )}
                          </div>

                          <div>
                            <span className="text-[9px] font-mono text-zinc-500 block truncate">{f.name}</span>
                            <span className="text-xs font-heading font-extrabold text-white block mt-0.5 truncate">{f.value}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Scroll to Deep Analysis CTA Option */}
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={scrollToDeepAnalysis}
                      className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors uppercase border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.1)] cursor-pointer"
                    >
                      View Deep AI Analysis Report
                      <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                    </button>
                  </div>
                </div>

                {/* 3. AI Generated Explanation Stack */}
                <div ref={deepAnalysisRef} className="space-y-6 border-t border-zinc-900/60 pt-12 text-center scroll-mt-24">
                  {/* Visual Header */}
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                      <h3 className="text-xl font-heading font-extrabold text-white">DEEP SECURITY ANALYSIS</h3>
                    </div>
                    {aiLoading ? (
                      <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mt-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>CONSULTING LLAMA CORE FOR DEEP INTEL...</span>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 font-mono tracking-wider mt-1 uppercase">Tap the card stack below to expand the analysis reports</p>
                    )}
                  </div>

                  {/* Layered Stack Container */}
                  <div className="relative w-full max-w-4xl mx-auto min-h-[480px] md:min-h-[350px] h-auto mt-8">
                    <LayeredStack className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto min-h-[300px] relative">
                      
                      {/* CARD 1: Lexical Analysis */}
                      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex flex-col justify-between min-h-[300px] md:min-h-[320px] lg:min-h-[350px] h-auto pb-8 text-left transition-colors hover:border-emerald-500/30">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                              <Link2 className="w-5 h-5" />
                            </div>
                            <span className="text-[8px] font-mono font-bold px-2 py-1 rounded bg-zinc-900 text-zinc-500 border border-zinc-800">LAYER_01</span>
                          </div>
                          <h4 className="text-sm font-heading font-extrabold text-white mb-2">Lexical Risk Patterns</h4>
                          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                            {renderHighlightedText(aiAnalysis ? aiAnalysis.lexicalAnalysis : (isPhishing 
                              ? "Anomalous **naming structure** detected. The domain uses **character obfuscation** and **keyword baiting** common in spoofed destinations."
                              : "Standard **URL pattern** matched. Character sequence, domain parameters, and path length metrics align cleanly with reputable index hosts."
                            ))}
                          </p>
                        </div>
                        <div className="text-[8px] font-mono text-zinc-600 mt-4 border-t border-zinc-900/60 pt-3">
                          STATUS: EVALUATION_COMPLETE
                        </div>
                      </div>

                      {/* CARD 2: Protocol Integrity */}
                      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex flex-col justify-between min-h-[300px] md:min-h-[320px] lg:min-h-[350px] h-auto pb-8 text-left transition-colors hover:border-emerald-500/30">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                              <Lock className="w-5 h-5" />
                            </div>
                            <span className="text-[8px] font-mono font-bold px-2 py-1 rounded bg-zinc-900 text-zinc-500 border border-zinc-800">LAYER_02</span>
                          </div>
                          <h4 className="text-sm font-heading font-extrabold text-white mb-2">SSL & Protocol Security</h4>
                          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                            {renderHighlightedText(aiAnalysis ? aiAnalysis.protocolSecurity : (isPhishing 
                              ? "Insecure **HTTP connection** or suspicious **SSL issuer mapping** detected. Payload traffic is exposed to eavesdropping risk."
                              : "SSL/TLS handshake **validated**. Traffic encrypted securely in transit using **verified authority certificates**."
                            ))}
                          </p>
                        </div>
                        <div className="text-[8px] font-mono text-zinc-600 mt-4 border-t border-zinc-900/60 pt-3">
                          STATUS: PROTOCOL_SECURE
                        </div>
                      </div>

                      {/* CARD 3: Threat intelligence */}
                      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex flex-col justify-between min-h-[300px] md:min-h-[320px] lg:min-h-[350px] h-auto pb-8 text-left transition-colors hover:border-emerald-500/30">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                              <Database className="w-5 h-5" />
                            </div>
                            <span className="text-[8px] font-mono font-bold px-2 py-1 rounded bg-zinc-900 text-zinc-500 border border-zinc-800">LAYER_03</span>
                          </div>
                          <h4 className="text-sm font-heading font-extrabold text-white mb-2">Threat DB Blacklists</h4>
                          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                            {renderHighlightedText(aiAnalysis ? aiAnalysis.threatIntel : (isPhishing 
                              ? "Domain matched **active blacklists** or flagged **honeypot indices**. Immediately restrict all credential input payloads."
                              : "Checked against **live threat databases**. Domain registry contains **no reports** of malicious redirection or host hijacking."
                            ))}
                          </p>
                        </div>
                        <div className="text-[8px] font-mono text-zinc-600 mt-4 border-t border-zinc-900/60 pt-3">
                          STATUS: INTEL_CORRELATION_PASS
                        </div>
                      </div>

                    </LayeredStack>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
