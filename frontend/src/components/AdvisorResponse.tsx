"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Props {
  advisorId: string;
  advisorName: string;
  content: string;
  phase: "perspective" | "debate";
  turn?: number;
  color: string;
  emoji: string;
  index: number;
}

export default function AdvisorResponse({
  advisorName,
  content,
  phase,
  turn,
  color,
  emoji,
  index,
}: Props) {
  return (
    <motion.div
      className="rounded-xl border bg-[#12121A] overflow-hidden"
      style={{ borderColor: `${color}40` }}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{
          borderColor: `${color}20`,
          background: `linear-gradient(135deg, ${color}08, transparent)`,
        }}
      >
        <span className="text-xl">{emoji}</span>
        <div className="flex-1">
          <span className="font-semibold text-sm" style={{ color }}>
            {advisorName}
          </span>
          {phase === "debate" && turn && (
            <span className="ml-2 text-xs text-[#8888A0]">
              responding (round {turn})
            </span>
          )}
        </div>
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Content */}
      <div className="px-4 py-3 text-sm leading-relaxed text-[#C8C8D8]">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => (
              <strong className="font-semibold text-[#E4E4ED]">{children}</strong>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
            ),
            li: ({ children }) => <li>{children}</li>,
            h3: ({ children }) => (
              <h3 className="font-semibold text-[#E4E4ED] mt-3 mb-1">{children}</h3>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}
