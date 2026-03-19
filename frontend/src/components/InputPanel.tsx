"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import type { DeliberationPhase } from "@/types";

interface Props {
  onSend: (message: string) => void;
  phase: DeliberationPhase;
  isConnected: boolean;
}

export default function InputPanel({ onSend, phase, isConnected }: Props) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDeliberating = !["idle", "complete"].includes(phase);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed || isDeliberating || !isConnected) return;
    onSend(trimmed);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  return (
    <motion.div
      className="border-t border-[#2A2A3A] bg-[#0A0A0F] p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3 bg-[#12121A] rounded-xl border border-[#2A2A3A] p-3 focus-within:border-[#6366F180] transition-colors">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isDeliberating
                ? "Your Council is deliberating..."
                : "Bring something to your Council..."
            }
            disabled={isDeliberating || !isConnected}
            rows={1}
            className="flex-1 bg-transparent text-[#E4E4ED] placeholder-[#4A4A5A] resize-none outline-none text-sm leading-relaxed disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || isDeliberating || !isConnected}
            className="p-2 rounded-lg bg-[#6366F1] text-white hover:bg-[#5558E8] disabled:opacity-30 disabled:hover:bg-[#6366F1] transition-all shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-[#4A4A5A] mt-2 text-center">
          Your Council provides perspectives for consideration, not professional
          advice. Always consult licensed professionals for legal, medical, or
          financial decisions.
        </p>
      </div>
    </motion.div>
  );
}
