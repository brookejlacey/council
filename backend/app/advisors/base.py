from typing import AsyncGenerator
from ..config import get_settings
from ..llm import chat_stream


class AdvisorAgent:
    """A single advisor agent that can generate perspectives and debate."""

    def __init__(self, persona: dict):
        self.persona = persona
        self.settings = get_settings()

    @property
    def id(self) -> str:
        return self.persona["id"]

    @property
    def name(self) -> str:
        return self.persona["name"]

    async def generate_perspective(
        self,
        user_message: str,
        user_context: dict | None = None,
        conversation_history: list[dict] | None = None,
    ) -> AsyncGenerator[str, None]:
        """Generate this advisor's initial perspective on the user's question."""
        system, messages = self._build_prompt(
            user_message, user_context, conversation_history, phase="perspective"
        )

        async for chunk in chat_stream(
            model=self.settings.advisor_model,
            system=system,
            messages=messages,
            max_tokens=self.settings.max_tokens_per_response,
            temperature=0.8,
        ):
            yield chunk

    async def generate_debate_response(
        self,
        user_message: str,
        other_perspectives: list[dict],
        user_context: dict | None = None,
        conversation_history: list[dict] | None = None,
    ) -> AsyncGenerator[str, None]:
        """Respond to other advisors' perspectives in the debate phase."""
        system, messages = self._build_prompt(
            user_message, user_context, conversation_history,
            phase="debate", other_perspectives=other_perspectives
        )

        async for chunk in chat_stream(
            model=self.settings.advisor_model,
            system=system,
            messages=messages,
            max_tokens=self.settings.max_tokens_per_response,
            temperature=0.85,
        ):
            yield chunk

    def _build_prompt(
        self,
        user_message: str,
        user_context: dict | None,
        conversation_history: list[dict] | None,
        phase: str,
        other_perspectives: list[dict] | None = None,
    ) -> tuple[str, list[dict]]:
        """Returns (system_prompt, messages) tuple."""
        system = self.persona["system_prompt"]

        if user_context:
            context_str = "\n".join(f"- {k}: {v}" for k, v in user_context.items())
            system += f"\n\nWhat you know about this person:\n{context_str}"

        messages = []

        # Add conversation history
        if conversation_history:
            for msg in conversation_history[-10:]:
                messages.append({
                    "role": "user" if msg["role"] == "user" else "assistant",
                    "content": f"[{msg.get('advisor_name', 'User')}]: {msg['content']}"
                    if msg["role"] != "user"
                    else msg["content"],
                })

        if phase == "perspective":
            messages.append({
                "role": "user",
                "content": f"""The user has brought the following to the Council:

\"{user_message}\"

As {self.name}, provide your perspective. Be specific, actionable, and true to your expertise. Keep your response focused and under 300 words. Address the user directly as "you"."""
            })

        elif phase == "debate":
            perspectives_text = "\n\n".join(
                f"**{p['advisor_name']}**: {p['content']}"
                for p in (other_perspectives or [])
            )
            messages.append({
                "role": "user",
                "content": f"""The user asked: \"{user_message}\"

Here's what the other advisors said:

{perspectives_text}

As {self.name}, respond to the other advisors. Do you agree? Disagree? Want to add nuance? Build on their ideas? Challenge assumptions? Be specific and constructive. Keep it under 200 words. Address the user directly — this is a discussion FOR them."""
            })

        return system, messages
