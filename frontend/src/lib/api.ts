const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchAdvisors() {
  const res = await fetch(`${API_BASE}/council/advisors`);
  if (!res.ok) throw new Error("Failed to fetch advisors");
  return res.json();
}

export async function createSession(title?: string) {
  const res = await fetch(`${API_BASE}/council/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title || "New Session" }),
  });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

export async function fetchSessions() {
  const res = await fetch(`${API_BASE}/council/sessions`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

export async function fetchMessages(sessionId: string) {
  const res = await fetch(`${API_BASE}/council/sessions/${sessionId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}
