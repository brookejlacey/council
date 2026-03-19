"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CouncilChamber from "@/components/CouncilChamber";
import { createSession } from "@/lib/api";

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const session = await createSession("New Session");
        setSessionId(session.id);
      } catch {
        // Backend not available — use a local session ID
        setSessionId(`local-${Date.now()}`);
      }
    }
    init();
  }, []);

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#6366F1] typing-dot" />
            <div className="w-2 h-2 rounded-full bg-[#6366F1] typing-dot" />
            <div className="w-2 h-2 rounded-full bg-[#6366F1] typing-dot" />
          </div>
        </motion.div>
      </div>
    );
  }

  return <CouncilChamber sessionId={sessionId} />;
}
