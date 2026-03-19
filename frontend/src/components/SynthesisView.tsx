"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Props {
  content: string;
}

export default function SynthesisView({ content }: Props) {
  if (!content) return null;

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative rounded-2xl border border-[#6366F120] overflow-hidden bg-gradient-to-b from-[#6366F106] to-transparent">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366F160] to-transparent" />

        {/* Badge */}
        <div className="px-6 pt-5 pb-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-[#6366F115] shadow-[0_0_30px_rgba(99,102,241,0.1)]">
            🏛️
          </div>
          <div>
            <h3 className="font-bold text-[#E8E8F0] text-lg">
              Council Synthesis
            </h3>
            <p className="text-xs text-[#7A7A90]">
              Integrated analysis from your advisory board
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-[#1E1E2E]" />

        {/* Report Content */}
        <div className="px-6 py-5 text-[15px] leading-[1.75] text-[#C0C0D0]">
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
              h3: ({ children }) => (
                <h3 className="font-bold text-[#E8E8F0] mt-5 mb-2 text-base flex items-center gap-2">
                  {children}
                </h3>
              ),
              ul: ({ children }) => (
                <ul className="list-none mb-3 space-y-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-3 space-y-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="flex gap-2">
                  <span className="text-[#6366F1] shrink-0">•</span>
                  <span>{children}</span>
                </li>
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
