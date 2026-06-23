"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Props {
  advisorName: string;
  emoji: string;
  color: string;
  role: string;
  content: string;
  phase: "perspective" | "debate";
  respondingTo?: string;
  index: number;
  total: number;
}

export default function SpotlightCard({
  advisorName,
  emoji,
  color,
  role,
  content,
  phase,
  respondingTo,
  index,
  total,
}: Props) {
  return (
    <motion.div
      className="w-full max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div
        className="relative rounded-2xl border overflow-hidden"
        style={{
          borderColor: `${color}25`,
          background: `linear-gradient(180deg, ${color}06 0%, #0E0E1400 40%)`,
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
        />

        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: `${color}15`,
                boxShadow: `0 0 30px ${color}15`,
              }}
            >
              {emoji}
            </div>
            <div>
              <h3 className="font-semibold text-[#E8E8F0]">{advisorName}</h3>
              <p className="text-xs text-[#7A7A90]">{role}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {phase === "debate" && respondingTo && (
              <span className="text-xs text-[#7A7A90] bg-[#16161F] px-3 py-1 rounded-full">
                responding to others
              </span>
            )}
            <span className="text-xs text-[#3A3A4A]">
              {index + 1} / {total}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-[15px] leading-[1.75] text-[#C0C0D0]">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-3 last:mb-0">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-[#E8E8F0]">
                  {children}
                </strong>
              ),
              ul: ({ children }) => (
                <ul className="list-none mb-3 space-y-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-3 space-y-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="flex gap-2">
                  <span className="text-[#7A7A90] shrink-0">·</span>
                  <span>{children}</span>
                </li>
              ),
              h3: ({ children }) => (
                <h3 className="font-semibold text-[#E8E8F0] mt-4 mb-1">
                  {children}
                </h3>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
