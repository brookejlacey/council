export interface Advisor {
  id: string;
  name: string;
  role: string;
  personality: string;
  emoji: string;
  color: string;
}

export interface SessionInfo {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_context: Record<string, string>;
}

export interface CouncilMessage {
  id: string;
  role: "user" | "advisor" | "synthesis" | "system";
  advisor_id?: string;
  content: string;
  phase?: "perspective" | "debate" | "synthesis";
  metadata?: Record<string, unknown>;
  created_at: string;
  turn: number;
}

export interface DebateEvent {
  type:
    | "status"
    | "routing"
    | "phase"
    | "perspective"
    | "debate"
    | "synthesis"
    | "complete"
    | "error";
  advisor_id?: string;
  advisor_name?: string;
  content: string;
  phase?: string;
  turn?: number;
  metadata?: {
    advisors?: Advisor[];
    [key: string]: unknown;
  };
}

export type DeliberationPhase =
  | "idle"
  | "routing"
  | "perspective"
  | "debate"
  | "synthesis"
  | "complete";
