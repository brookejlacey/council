from typing import AsyncGenerator
from ..config import get_settings
from ..llm import chat_stream


class DebateSynthesizer:
    """Synthesizes the council debate into a clear, actionable summary."""

    def __init__(self):
        self.settings = get_settings()

    async def synthesize(
        self,
        user_message: str,
        perspectives: list[dict],
        debate_responses: list[dict],
        user_context: dict | None = None,
    ) -> AsyncGenerator[str, None]:
        """Produce a final synthesis of the council's deliberation."""

        perspectives_text = "\n\n".join(
            f"**{p['advisor_name']}** ({p['advisor_id']}): {p['content']}"
            for p in perspectives
        )

        debate_text = "\n\n".join(
            f"**{d['advisor_name']}** (responding): {d['content']}"
            for d in debate_responses
        ) if debate_responses else "No cross-examination occurred."

        system = """You are the Synthesis Engine for COUNCIL, a personal advisory board. Your job is to distill a multi-advisor deliberation into a clear, actionable briefing.

You are NOT an advisor — you are an impartial synthesizer. You:
1. Identify areas of AGREEMENT across advisors
2. Surface key DISAGREEMENTS and explain why they matter
3. Extract the top ACTIONABLE RECOMMENDATIONS (prioritized)
4. Note any IMPORTANT CAVEATS or risks flagged
5. Highlight BLIND SPOTS the council may have missed

Your tone is clear, organized, and empowering. The user should finish reading your synthesis and know exactly what to do next."""

        user_prompt = f"""The user brought this to the Council:
"{user_message}"

## Phase 1: Initial Perspectives
{perspectives_text}

## Phase 2: Cross-Examination
{debate_text}

---

Now synthesize this deliberation. Structure your response as:

### Where Your Advisors Agree
[Key consensus points]

### Where They Disagree
[Key tensions and why they matter]

### Recommended Actions
[Prioritized, specific action steps — numbered]

### Watch Out For
[Key risks and caveats]

### The Bigger Picture
[One paragraph connecting this decision to broader context]

Be specific and reference which advisor said what. Keep the total under 500 words."""

        async for chunk in chat_stream(
            model=self.settings.synthesis_model,
            system=system,
            messages=[{"role": "user", "content": user_prompt}],
            max_tokens=self.settings.synthesis_max_tokens,
            temperature=0.6,
        ):
            yield chunk
