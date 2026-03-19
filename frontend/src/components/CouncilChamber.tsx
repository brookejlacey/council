"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Send, RotateCcw } from "lucide-react";
import { useCouncil } from "@/hooks/useCouncil";
import HeroStage from "./HeroStage";
import SpotlightCard from "./SpotlightCard";
import SynthesisView from "./SynthesisView";

const ADVISOR_META: Record<
  string,
  { emoji: string; color: string; role: string }
> = {
  strategist: { emoji: "♟️", color: "#6366F1", role: "Strategy & Planning" },
  advocate: { emoji: "⚖️", color: "#DC2626", role: "Rights & Protections" },
  analyst: { emoji: "📊", color: "#059669", role: "Financial Analysis" },
  mentor: { emoji: "🧭", color: "#D97706", role: "Career & Growth" },
  critic: { emoji: "🔍", color: "#7C3AED", role: "Risk & Assumptions" },
  creative: { emoji: "💡", color: "#EC4899", role: "Creative Solutions" },
  medic: { emoji: "🩺", color: "#0891B2", role: "Health & Wellbeing" },
  historian: { emoji: "📚", color: "#78716C", role: "Patterns & Precedent" },
};

const PHASE_INFO: Record<string, { label: string; icon: string }> = {
  routing: { label: "CONVENING", icon: "🔮" },
  perspective: { label: "PERSPECTIVES", icon: "💭" },
  debate: { label: "CROSS-EXAMINATION", icon: "⚡" },
  synthesis: { label: "SYNTHESIS", icon: "🏛️" },
  complete: { label: "COMPLETE", icon: "✅" },
};

interface Props {
  sessionId: string;
}

export default function CouncilChamber({ sessionId }: Props) {
  const council = useCouncil(sessionId);
  const [perspectiveIdx, setPerspectiveIdx] = useState(0);
  const [debateIdx, setDebateIdx] = useState(0);
  const [userQuestion, setUserQuestion] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [followUpMsg, setFollowUpMsg] = useState("");

  // Reset carousel indices when new data arrives
  useEffect(() => {
    setPerspectiveIdx(Math.max(0, council.perspectives.length - 1));
  }, [council.perspectives.length]);

  useEffect(() => {
    setDebateIdx(Math.max(0, council.debateResponses.length - 1));
  }, [council.debateResponses.length]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [council.phase, council.synthesis]);

  const handleSubmit = (message: string) => {
    setUserQuestion(message);
    council.sendMessage(message);
  };

  const handleNewQuestion = () => {
    setUserQuestion("");
    setFollowUpMsg("");
    setPerspectiveIdx(0);
    setDebateIdx(0);
  };

  const getMeta = (id: string) =>
    ADVISOR_META[id] || { emoji: "🤖", color: "#6366F1", role: "Advisor" };

  const isIdle = council.phase === "idle" && council.perspectives.length === 0;
  const showStage = !isIdle;
  const phaseInfo = PHASE_INFO[council.phase] || { label: "", icon: "" };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      {/* Ambient background */}
      <div className="ambient-bg" />

      {/* Header Bar */}
      <header className="relative z-10 glass border-b border-[#1E1E2E]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏛️</span>
            <span className="text-sm font-semibold tracking-wide gradient-text">
              COUNCIL
            </span>
          </div>

          {showStage && (
            <div className="flex items-center gap-4">
              {/* Phase badge */}
              <motion.div
                key={council.phase}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#16161F] border border-[#1E1E2E]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="text-sm">{phaseInfo.icon}</span>
                <span className="text-xs font-medium text-[#7A7A90] tracking-widest">
                  {phaseInfo.label}
                </span>
              </motion.div>

              {/* Active advisor pills */}
              <div className="hidden sm:flex items-center gap-1.5">
                {council.activeAdvisors.map((a) => {
                  const meta = getMeta(a.id);
                  const isActive =
                    (council.phase === "perspective" &&
                      council.perspectives.some((p) => p.advisor_id === a.id)) ||
                    council.phase === "debate" ||
                    council.phase === "synthesis" ||
                    council.phase === "complete";
                  return (
                    <div
                      key={a.id}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300"
                      style={{
                        background: isActive ? `${meta.color}20` : "#16161F",
                        border: `1.5px solid ${isActive ? meta.color : "#1E1E2E"}`,
                        boxShadow: isActive
                          ? `0 0 12px ${meta.color}30`
                          : "none",
                      }}
                    >
                      {meta.emoji}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                council.isConnected ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
          </div>
        </div>
      </header>

      {/* Main Stage */}
      <main ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* ─── IDLE: Hero Stage ─── */}
          {isIdle && (
            <motion.div
              key="hero"
              className="h-full"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HeroStage onSubmit={handleSubmit} />
            </motion.div>
          )}

          {/* ─── ACTIVE: Deliberation Stage ─── */}
          {showStage && (
            <motion.div
              key="stage"
              className="min-h-full py-8 px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* User's question */}
              <motion.div
                className="max-w-3xl mx-auto mb-8 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs text-[#3A3A4A] uppercase tracking-widest mb-2">
                  Your question to the Council
                </p>
                <p className="text-lg text-[#C0C0D0] italic leading-relaxed">
                  &ldquo;{userQuestion}&rdquo;
                </p>
              </motion.div>

              {/* Routing / Loading */}
              {council.phase === "routing" &&
                council.perspectives.length === 0 && (
                  <motion.div
                    className="flex flex-col items-center justify-center py-20 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#6366F1] typing-dot" />
                      <div className="w-2 h-2 rounded-full bg-[#6366F1] typing-dot" />
                      <div className="w-2 h-2 rounded-full bg-[#6366F1] typing-dot" />
                    </div>
                    <p className="text-sm text-[#7A7A90]">
                      {council.statusMessage || "Convening your Council..."}
                    </p>
                  </motion.div>
                )}

              {/* ─── PERSPECTIVES ─── */}
              {council.perspectives.length > 0 && (
                <div className="mb-8">
                  {/* Section header */}
                  <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💭</span>
                      <span className="text-xs font-medium text-[#7A7A90] uppercase tracking-widest">
                        Perspectives
                      </span>
                    </div>
                    {council.perspectives.length > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setPerspectiveIdx((i) => Math.max(0, i - 1))
                          }
                          disabled={perspectiveIdx === 0}
                          className="p-1.5 rounded-lg bg-[#16161F] border border-[#1E1E2E] text-[#7A7A90] hover:text-[#E8E8F0] disabled:opacity-20 transition-all"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setPerspectiveIdx((i) =>
                              Math.min(council.perspectives.length - 1, i + 1)
                            )
                          }
                          disabled={
                            perspectiveIdx ===
                            council.perspectives.length - 1
                          }
                          className="p-1.5 rounded-lg bg-[#16161F] border border-[#1E1E2E] text-[#7A7A90] hover:text-[#E8E8F0] disabled:opacity-20 transition-all"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Perspective Cards - carousel dots */}
                  {council.perspectives.length > 1 && (
                    <div className="flex justify-center gap-1.5 mb-4">
                      {council.perspectives.map((p, idx) => {
                        const meta = getMeta(p.advisor_id);
                        return (
                          <button
                            key={p.advisor_id}
                            onClick={() => setPerspectiveIdx(idx)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all text-xs"
                            style={{
                              background:
                                idx === perspectiveIdx
                                  ? `${meta.color}20`
                                  : "#16161F",
                              border: `1px solid ${
                                idx === perspectiveIdx
                                  ? meta.color
                                  : "#1E1E2E"
                              }`,
                              color:
                                idx === perspectiveIdx
                                  ? meta.color
                                  : "#7A7A90",
                            }}
                          >
                            <span>{meta.emoji}</span>
                            <span className="hidden sm:inline">
                              {p.advisor_name.replace("The ", "")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Active Spotlight Card */}
                  <AnimatePresence mode="wait">
                    {council.perspectives[perspectiveIdx] && (
                      <motion.div
                        key={council.perspectives[perspectiveIdx].advisor_id}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                      >
                        <SpotlightCard
                          advisorName={
                            council.perspectives[perspectiveIdx].advisor_name
                          }
                          emoji={
                            getMeta(
                              council.perspectives[perspectiveIdx].advisor_id
                            ).emoji
                          }
                          color={
                            getMeta(
                              council.perspectives[perspectiveIdx].advisor_id
                            ).color
                          }
                          role={
                            getMeta(
                              council.perspectives[perspectiveIdx].advisor_id
                            ).role
                          }
                          content={
                            council.perspectives[perspectiveIdx].content
                          }
                          phase="perspective"
                          index={perspectiveIdx}
                          total={council.perspectives.length}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ─── DEBATE ─── */}
              {council.debateResponses.length > 0 && (
                <div className="mb-8">
                  <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚡</span>
                      <span className="text-xs font-medium text-[#7A7A90] uppercase tracking-widest">
                        Cross-Examination
                      </span>
                    </div>
                    {council.debateResponses.length > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setDebateIdx((i) => Math.max(0, i - 1))
                          }
                          disabled={debateIdx === 0}
                          className="p-1.5 rounded-lg bg-[#16161F] border border-[#1E1E2E] text-[#7A7A90] hover:text-[#E8E8F0] disabled:opacity-20 transition-all"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setDebateIdx((i) =>
                              Math.min(
                                council.debateResponses.length - 1,
                                i + 1
                              )
                            )
                          }
                          disabled={
                            debateIdx ===
                            council.debateResponses.length - 1
                          }
                          className="p-1.5 rounded-lg bg-[#16161F] border border-[#1E1E2E] text-[#7A7A90] hover:text-[#E8E8F0] disabled:opacity-20 transition-all"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Debate nav pills */}
                  {council.debateResponses.length > 1 && (
                    <div className="flex justify-center gap-1.5 mb-4">
                      {council.debateResponses.map((d, idx) => {
                        const meta = getMeta(d.advisor_id);
                        return (
                          <button
                            key={`${d.advisor_id}-${d.turn}`}
                            onClick={() => setDebateIdx(idx)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all text-xs"
                            style={{
                              background:
                                idx === debateIdx
                                  ? `${meta.color}20`
                                  : "#16161F",
                              border: `1px solid ${
                                idx === debateIdx ? meta.color : "#1E1E2E"
                              }`,
                              color:
                                idx === debateIdx ? meta.color : "#7A7A90",
                            }}
                          >
                            <span>{meta.emoji}</span>
                            <span className="hidden sm:inline">
                              {d.advisor_name.replace("The ", "")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {council.debateResponses[debateIdx] && (
                      <motion.div
                        key={`${council.debateResponses[debateIdx].advisor_id}-${council.debateResponses[debateIdx].turn}`}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                      >
                        <SpotlightCard
                          advisorName={
                            council.debateResponses[debateIdx].advisor_name
                          }
                          emoji={
                            getMeta(
                              council.debateResponses[debateIdx].advisor_id
                            ).emoji
                          }
                          color={
                            getMeta(
                              council.debateResponses[debateIdx].advisor_id
                            ).color
                          }
                          role={
                            getMeta(
                              council.debateResponses[debateIdx].advisor_id
                            ).role
                          }
                          content={
                            council.debateResponses[debateIdx].content
                          }
                          phase="debate"
                          index={debateIdx}
                          total={council.debateResponses.length}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ─── SYNTHESIS ─── */}
              {council.synthesis && (
                <div className="mb-8">
                  <div className="max-w-3xl mx-auto mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏛️</span>
                      <span className="text-xs font-medium text-[#7A7A90] uppercase tracking-widest">
                        Synthesis
                      </span>
                    </div>
                  </div>
                  <SynthesisView content={council.synthesis} />
                </div>
              )}

              {/* Loading indicators for in-between states */}
              {council.phase === "perspective" &&
                council.perspectives.length > 0 &&
                council.debateResponses.length === 0 &&
                council.phase !== "complete" && (
                  <motion.div
                    className="flex items-center justify-center gap-2 py-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] typing-dot" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] typing-dot" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] typing-dot" />
                    </div>
                    <span className="text-xs text-[#3A3A4A]">
                      Advisors reviewing each other&apos;s perspectives...
                    </span>
                  </motion.div>
                )}

              {/* ─── COMPLETE: follow-up or new question ─── */}
              {council.phase === "complete" && (
                <motion.div
                  className="max-w-3xl mx-auto mt-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 bg-[#0E0E14] border border-[#1E1E2E] rounded-2xl p-3">
                    <input
                      type="text"
                      value={followUpMsg}
                      onChange={(e) => setFollowUpMsg(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && followUpMsg.trim()) {
                          handleSubmit(followUpMsg.trim());
                          setFollowUpMsg("");
                        }
                      }}
                      placeholder="Ask a follow-up or dig deeper..."
                      className="flex-1 bg-transparent text-[#E8E8F0] placeholder-[#3A3A4A] outline-none text-sm"
                    />
                    <button
                      onClick={() => {
                        if (followUpMsg.trim()) {
                          handleSubmit(followUpMsg.trim());
                          setFollowUpMsg("");
                        }
                      }}
                      disabled={!followUpMsg.trim()}
                      className="p-2 rounded-lg bg-[#6366F1] text-white disabled:opacity-20 transition-all"
                    >
                      <Send size={16} />
                    </button>
                    <button
                      onClick={handleNewQuestion}
                      className="p-2 rounded-lg bg-[#16161F] border border-[#1E1E2E] text-[#7A7A90] hover:text-[#E8E8F0] transition-all"
                      title="New question"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {council.error && (
                <motion.div
                  className="max-w-3xl mx-auto bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {council.error}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
