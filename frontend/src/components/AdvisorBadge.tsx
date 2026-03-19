"use client";

import { motion } from "framer-motion";
import type { Advisor } from "@/types";

interface Props {
  advisor: Advisor;
  isActive?: boolean;
  isSpeaking?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function AdvisorBadge({
  advisor,
  isActive = false,
  isSpeaking = false,
  size = "md",
}: Props) {
  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-14 h-14 text-2xl",
    lg: "w-20 h-20 text-4xl",
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center relative ${
          isSpeaking ? "advisor-speaking" : ""
        }`}
        style={{
          backgroundColor: isActive ? `${advisor.color}20` : "#1A1A26",
          border: `2px solid ${isActive ? advisor.color : "#2A2A3A"}`,
          boxShadow: isSpeaking
            ? `0 0 30px ${advisor.color}60`
            : isActive
            ? `0 0 15px ${advisor.color}30`
            : "none",
          transition: "all 0.3s ease",
        }}
      >
        <span>{advisor.emoji}</span>
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${advisor.color}` }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
      {size !== "sm" && (
        <span
          className="text-xs font-medium truncate max-w-[80px] text-center"
          style={{ color: isActive ? advisor.color : "#8888A0" }}
        >
          {advisor.name.replace("The ", "")}
        </span>
      )}
    </motion.div>
  );
}
