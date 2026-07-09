"use client";

import { CircuitBoard } from "@/components/ui/circuit-board";
import { Globe, Cpu, Brain, ShieldCheck, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const nodes = [
    {
      id: "input",
      x: 80,
      y: 150,
      label: "URL Input",
      status: "active" as const,
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: "extract",
      x: 240,
      y: 80,
      label: "Feature Extraction",
      status: "processing" as const,
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      id: "score",
      x: 240,
      y: 220,
      label: "Risk Scoring",
      status: "active" as const,
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "model",
      x: 420,
      y: 150,
      label: "ML Model",
      status: "processing" as const,
      icon: <Brain className="w-4 h-4" />,
      size: "lg" as const,
    },
    {
      id: "result",
      x: 580,
      y: 150,
      label: "Verdict",
      status: "active" as const,
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  const connections = [
    { from: "input", to: "extract", animated: true },
    { from: "input", to: "score", animated: true },
    { from: "extract", to: "model", animated: true },
    { from: "score", to: "model", animated: true },
    { from: "model", to: "result", animated: true },
  ];

  const steps = [
    {
      title: "Feature Extraction",
      desc: "URL length, protocol, domain structure, suspicious keywords, and 6+ more signals extracted from the raw URL.",
    },
    {
      title: "ML Classification",
      desc: "A Random Forest model trained on thousands of labeled URLs classifies the input based on extracted feature vectors.",
    },
    {
      title: "Risk Scoring",
      desc: "Individual feature contributions are aggregated into a probability score, producing an explainable verdict.",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Every URL passes through a multi-stage analysis pipeline — feature
            extraction, ML classification, and risk scoring work together to
            deliver accurate results.
          </p>
        </div>

        {/* Circuit board */}
        <div className="flex justify-center mb-20">
          <CircuitBoard
            nodes={nodes}
            connections={connections}
            width={660}
            height={300}
            variant="dark"
            pulseSpeed={3}
            traceColor="rgba(6, 182, 212, 0.2)"
            pulseColor="rgba(6, 182, 212, 0.5)"
            nodeColor="rgba(6, 182, 212, 0.4)"
            className="rounded-2xl border border-zinc-800/50 bg-zinc-950/50"
          />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/30"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm font-bold mb-4">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
