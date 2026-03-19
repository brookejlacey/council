"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { DebateEvent, DeliberationPhase, Advisor } from "@/types";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api";

interface PerspectiveEntry {
  advisor_id: string;
  advisor_name: string;
  content: string;
}

interface DebateEntry extends PerspectiveEntry {
  turn: number;
}

interface CouncilState {
  phase: DeliberationPhase;
  activeAdvisors: Advisor[];
  perspectives: PerspectiveEntry[];
  debateResponses: DebateEntry[];
  synthesis: string;
  error: string | null;
  isConnected: boolean;
  statusMessage: string;
}

export function useCouncil(sessionId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<CouncilState>({
    phase: "idle",
    activeAdvisors: [],
    perspectives: [],
    debateResponses: [],
    synthesis: "",
    error: null,
    isConnected: false,
    statusMessage: "",
  });

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_BASE}/council/ws/${sessionId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setState((s) => ({ ...s, isConnected: true, error: null }));
    };

    ws.onclose = () => {
      setState((s) => ({ ...s, isConnected: false }));
    };

    ws.onerror = () => {
      setState((s) => ({ ...s, error: "Connection error", isConnected: false }));
    };

    ws.onmessage = (event) => {
      const data: DebateEvent = JSON.parse(event.data);

      setState((prev) => {
        switch (data.type) {
          case "status":
            return { ...prev, statusMessage: data.content };

          case "routing":
            return {
              ...prev,
              phase: "routing",
              activeAdvisors: (data.metadata?.advisors as Advisor[]) || [],
              statusMessage: data.content,
              // Reset for new deliberation
              perspectives: [],
              debateResponses: [],
              synthesis: "",
            };

          case "phase":
            return {
              ...prev,
              phase: data.phase as DeliberationPhase,
              statusMessage: data.content,
            };

          case "perspective":
            return {
              ...prev,
              phase: "perspective",
              perspectives: [
                ...prev.perspectives,
                {
                  advisor_id: data.advisor_id!,
                  advisor_name: data.advisor_name!,
                  content: data.content,
                },
              ],
            };

          case "debate":
            return {
              ...prev,
              phase: "debate",
              debateResponses: [
                ...prev.debateResponses,
                {
                  advisor_id: data.advisor_id!,
                  advisor_name: data.advisor_name!,
                  content: data.content,
                  turn: data.turn || 1,
                },
              ],
            };

          case "synthesis":
            return {
              ...prev,
              phase: "synthesis",
              synthesis: data.content,
            };

          case "complete":
            return { ...prev, phase: "complete", statusMessage: "" };

          case "error":
            return { ...prev, error: data.content, phase: "idle" };

          default:
            return prev;
        }
      });
    };
  }, [sessionId]);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setState((s) => ({
        ...s,
        phase: "routing",
        perspectives: [],
        debateResponses: [],
        synthesis: "",
        error: null,
        statusMessage: "Convening your Council...",
      }));
      wsRef.current.send(JSON.stringify({ message }));
    }
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    ...state,
    sendMessage,
    connect,
    disconnect,
  };
}
