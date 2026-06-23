"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const EXAMPLE_PROMPTS = [
  {
    text: "I just lost my job and have 3 months of savings",
    tag: "Career Crisis",
  },
  {
    text: "Should I go back to school at 35 or learn on my own?",
    tag: "Life Decision",
  },
  {
    text: "My landlord is refusing to fix a safety issue in my apartment",
    tag: "Rights & Legal",
  },
  {
    text: "I want to start a business but I'm carrying $40k in debt",
    tag: "Finance & Risk",
  },
  {
    text: "I'm burning out at work but can't afford to quit",
    tag: "Wellbeing",
  },
  {
    text: "My team at work is dysfunctional and I'm caught in the middle",
    tag: "Strategy",
  },
];

interface Props {
  onSubmit: (message: string) => void;
}

export default function HeroStage({ onSubmit }: Props) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      {/* Logo & Tagline */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-6xl mb-5">🏛️</div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight gradient-text mb-3">
          COUNCIL
        </h1>
        <p className="text-[#7A7A90] text-lg max-w-md mx-auto leading-relaxed">
          Your personal board of advisors.<br />
          Not one opinion. A deliberation.
        </p>
      </motion.div>

      {/* Input Area */}
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        <div className="relative bg-[#0E0E14] border border-[#1E1E2E] rounded-2xl p-4 focus-within:border-[#6366F140] transition-all duration-300 focus-within:shadow-[0_0_40px_rgba(99,102,241,0.08)]">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="What's weighing on you?"
            rows={2}
            className="w-full bg-transparent text-[#E8E8F0] placeholder-[#3A3A4A] resize-none outline-none text-base leading-relaxed"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1E1E2E]">
            <span className="text-xs text-[#3A3A4A]">
              Shift+Enter for new line
            </span>
            <button
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-[#6366F1] hover:bg-[#5558E8] text-white text-sm font-medium rounded-xl disabled:opacity-20 disabled:hover:bg-[#6366F1] transition-all"
            >
              Convene Council
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Example Prompts */}
      <motion.div
        className="mt-8 w-full max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <p className="text-xs text-[#3A3A4A] text-center mb-3 uppercase tracking-widest">
          Try something like
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt.text}
              onClick={() => onSubmit(prompt.text)}
              className="group flex items-center gap-2 px-3 py-1.5 bg-[#0E0E14] hover:bg-[#16161F] border border-[#1E1E2E] hover:border-[#2E2E3E] rounded-lg transition-all text-xs"
            >
              <span className="text-[#7A7A90] group-hover:text-[#E8E8F0] transition-colors">
                {prompt.tag}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        className="absolute bottom-6 text-[10px] text-[#2A2A3A] text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        COUNCIL provides multi-perspective analysis, not professional advice.
        Consult licensed professionals for legal, medical, or financial decisions.
      </motion.p>
    </div>
  );
}
