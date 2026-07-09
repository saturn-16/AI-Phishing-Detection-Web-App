"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Brain, Shield, AlertTriangle, ShieldCheck, HelpCircle, Lock, ShieldAlert, Globe } from "lucide-react";

interface FeatureDetail {
  title: string;
  subtitle: string;
  description: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: React.ReactNode;
}

export default function FeaturesSection() {
  const [showPhishing, setShowPhishing] = useState(true);

  // Deep metrics detail cards
  const details: Record<"phishing" | "safe", FeatureDetail[]> = {
    phishing: [
      {
        title: "Deceptive IP Address",
        subtitle: "RAW IP FLAG",
        description: "Phishing URLs frequently use raw IP addresses (e.g., http://192.168.1.105) to host login pages, skipping domain registration to avoid automated domain reputation checks.",
        bgColor: "bg-red-950/20",
        borderColor: "border-red-500/30",
        textColor: "text-red-400",
        icon: <Globe className="w-6 h-6" />,
      },
      {
        title: "Domain Spoofing & Subdomains",
        subtitle: "STRUCTURAL SIGNAL",
        description: "Attackers add misleading subdomains (e.g., login.paypal.com.account-verify.net) to fool users into thinking they are visiting a legitimate site, masking the actual parent domain.",
        bgColor: "bg-red-950/20",
        borderColor: "border-red-500/30",
        textColor: "text-red-400",
        icon: <Brain className="w-6 h-6" />,
      },
      {
        title: "Missing HTTPS Encryption",
        subtitle: "PROTOCOL SIGNAL",
        description: "URLs starting with http:// lack secure SSL encryption, indicating that any credentials entered will be sent in plain text, a hallmark of low-cost phishing sites.",
        bgColor: "bg-red-950/20",
        borderColor: "border-red-500/30",
        textColor: "text-red-400",
        icon: <AlertTriangle className="w-6 h-6" />,
      },
    ],
    safe: [
      {
        title: "Trusted Domain Authority",
        subtitle: "REPUTATION CHECK",
        description: "Verified domains have established age, clean reputation rankings, and align precisely with the organization's official identity, passing lexical authority checks.",
        bgColor: "bg-emerald-950/20",
        borderColor: "border-emerald-500/30",
        textColor: "text-emerald-400",
        icon: <ShieldCheck className="w-6 h-6" />,
      },
      {
        title: "Clean URL Structure",
        subtitle: "LEXICAL CHECK",
        description: "Safe URLs have clean, standard lengths (under 50 chars) without excessive hyphens, symbols, or subdomains, reducing structural risk metrics.",
        bgColor: "bg-emerald-950/20",
        borderColor: "border-emerald-500/30",
        textColor: "text-emerald-400",
        icon: <Eye className="w-6 h-6" />,
      },
      {
        title: "Valid SSL/TLS Protocol",
        subtitle: "HTTPS ENCRYPTED",
        description: "Proper HTTPS protocol verified with active certificates from trusted Certificate Authorities, securing browser traffic and ensuring communications integrity.",
        bgColor: "bg-emerald-950/20",
        borderColor: "border-emerald-500/30",
        textColor: "text-emerald-400",
        icon: <Lock className="w-6 h-6" />,
      },
    ],
  };

  return (
    <section id="features" className="relative py-32 px-6 overflow-hidden">
      {/* Dark background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/95 via-black to-zinc-950/95 z-0 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight mb-4 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Why It Is Flagged Or Safe In Deep
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto drop-shadow-[0_1px_5px_rgba(0,0,0,0.8)]">
            Tap the interactive diagram below to compare a phishing attack URL structure with a verified secure link.
          </p>
        </div>

        {/* 2-Column Interactive Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          
          {/* LEFT — Interactive Infographic Box */}
          <div className="flex flex-col items-center">
            {/* Tap toggle switch */}
            <div className="flex items-center gap-4 mb-6 bg-zinc-900/60 border border-zinc-800/80 p-1.5 rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.8)]">
              <button
                onClick={() => setShowPhishing(true)}
                className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider transition-all cursor-pointer ${
                  showPhishing ? "bg-red-500 text-zinc-950 shadow-[0_0_15px_rgba(239,68,68,0.25)]" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                PHISHING ATTACK
              </button>
              <button
                onClick={() => setShowPhishing(false)}
                className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider transition-all cursor-pointer ${
                  !showPhishing ? "bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.25)]" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                SECURE RESOURCE
              </button>
            </div>

            {/* Interactive Browser Sandbox */}
            <div
              onClick={() => setShowPhishing(!showPhishing)}
              className="w-full cursor-pointer rounded-3xl border border-zinc-800/90 bg-zinc-950 p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] hover:border-zinc-700/80 transition-colors group relative overflow-hidden"
            >
              {/* Dynamic status glow backdrops */}
              <div className={`absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[140px] opacity-15 pointer-events-none transition-colors duration-500 ${
                showPhishing ? "bg-red-500" : "bg-emerald-500"
              }`} />

              {/* Browser Header Bar */}
              <div className="flex items-center gap-2 mb-6 border-b border-zinc-900 pb-4">
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                <div className="flex-1 bg-black/60 border border-zinc-900 rounded-xl px-4 py-1.5 flex items-center gap-2 text-[10px] font-mono text-zinc-500 ml-4 shadow-[inset_1px_2px_3px_rgba(0,0,0,0.9)]">
                  {showPhishing ? <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" /> : <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  <span className={`truncate ${showPhishing ? "text-red-400/90" : "text-emerald-400/90"}`}>
                    {showPhishing ? "http://192.168.1.105/login/paypal-verification" : "https://paypal.com/security"}
                  </span>
                </div>
              </div>

              {/* Infographic Visual Diagram */}
              <div className="aspect-[16/10] flex flex-col justify-center gap-6 p-4 border border-zinc-900 bg-black/40 rounded-2xl relative">
                {showPhishing ? (
                  <>
                    <div className="border border-red-500/20 bg-red-500/5 p-4 rounded-xl flex items-start gap-4">
                      <ShieldAlert className="w-8 h-8 text-red-500 shrink-0" />
                      <div>
                        <h4 className="font-heading font-bold text-sm text-red-400 mb-1">WARNING: EXPOSED PROFILE</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">No SSL certificate verification found. Connection parameters are insecure. Domain resolves directly to a raw local subnet address.</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-900/60 pt-4">
                      <span>VERDICT: UNTRUSTED</span>
                      <span className="text-red-400 font-bold">HIGH RISK</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border border-emerald-500/20 bg-emerald-500/5 p-4 rounded-xl flex items-start gap-4">
                      <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                      <div>
                        <h4 className="font-heading font-bold text-sm text-emerald-400 mb-1">SECURE PROTOCOL ACTIVE</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">SSL/TLS handshake verified successfully. Domain name authority matched directly with root certificate registrations.</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-900/60 pt-4">
                      <span>VERDICT: VERIFIED</span>
                      <span className="text-emerald-400 font-bold">CLEAN SIGNATURES</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center mt-5 text-[9px] font-mono text-zinc-600 tracking-wider">
                TAP ANYWHERE ON SCREEN TO TOGGLE COMPARISON
              </div>
            </div>
          </div>

          {/* RIGHT — Detail Cards */}
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={showPhishing ? "phish" : "safe"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4"
              >
                {(showPhishing ? details.phishing : details.safe).map((card, i) => (
                  <div
                    key={card.title}
                    className={`p-5 rounded-2xl border ${card.bgColor} ${card.borderColor} shadow-[0_8px_25px_rgba(0,0,0,0.6)] flex items-start gap-4 transition-all duration-300 hover:scale-[1.01]`}
                  >
                    <div className={`p-2.5 rounded-xl bg-zinc-950 shrink-0 ${card.textColor}`}>
                      {card.icon}
                    </div>
                    <div>
                      <span className={`text-[10px] font-mono font-bold tracking-widest block mb-1 ${card.textColor}`}>
                        {card.subtitle}
                      </span>
                      <h3 className="font-heading font-bold text-base text-white mb-2">{card.title}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">{card.description}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
