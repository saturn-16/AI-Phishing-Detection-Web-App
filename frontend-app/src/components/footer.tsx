import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">AI Shield</span>
        </div>
        <p className="text-sm text-zinc-500">
          Predictive URL threat intelligence and heuristic security analysis.
        </p>
        <a
          href="https://github.com/saturn-16/AI-Phishing-Detection-Web-App"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          GitHub →
        </a>
      </div>
    </footer>
  );
}
