"use client";

import { motion } from "framer-motion";
import type { DeliberationPhase } from "@/types";

const PHASES: { key: DeliberationPhase; label: string; icon: string }[] = [
  { key: "routing", label: "Convening", icon: "🔮" },
  { key: "perspective", label: "Perspectives", icon: "💭" },
  { key: "debate", label: "Cross-Examination", icon: "⚡" },
  { key: "synthesis", label: "Synthesis", icon: "🤝" },
  { key: "complete", label: "Complete", icon: "✅" },
];

const PHASE_ORDER: DeliberationPhase[] = [
  "routing",
  "perspective",
  "debate",
  "synthesis",
  "complete",
];

interface Props {
  currentPhase: DeliberationPhase;
}

export default function PhaseIndicator({ currentPhase }: Props) {
  if (currentPhase === "idle") return null;

  const currentIdx = PHASE_ORDER.indexOf(currentPhase);

  return (
    <motion.div
      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#12121A] border border-[#2A2A3A]"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {PHASES.map((phase, idx) => {
        const phaseIdx = PHASE_ORDER.indexOf(phase.key);
        const isActive = phase.key === currentPhase;
        const isPast = phaseIdx < currentIdx;

        return (
          <div key={phase.key} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-[#6366F120] text-[#6366F1] font-medium"
                  : isPast
                  ? "text-[#8888A0]"
                  : "text-[#4A4A5A]"
              }`}
            >
              <span className="text-base">{phase.icon}</span>
              <span className="hidden sm:inline">{phase.label}</span>
            </div>
            {idx < PHASES.length - 1 && (
              <div
                className={`w-6 h-px ${
                  isPast ? "bg-[#6366F1]" : "bg-[#2A2A3A]"
                }`}
              />
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
