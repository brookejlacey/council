import asyncio
from typing import AsyncGenerator

from ..config import get_settings
from ..advisors.base import AdvisorAgent
from ..advisors.personas import ADVISORS
from .router import AdvisorRouter
from .synthesizer import DebateSynthesizer


class CouncilOrchestrator:
    """Orchestrates a full council deliberation session."""

    def __init__(self):
        self.settings = get_settings()
        self.router = AdvisorRouter()
        self.synthesizer = DebateSynthesizer()

    async def deliberate(
        self,
        user_message: str,
        user_context: dict | None = None,
        conversation_history: list[dict] | None = None,
    ) -> AsyncGenerator[dict, None]:
        """Run a full council deliberation, yielding events as they occur."""

        # Phase 0: Route to relevant advisors
        yield {"type": "status", "content": "Convening your Council..."}

        advisor_ids = await self.router.route(user_message, user_context)
        advisors = {
            aid: AdvisorAgent(ADVISORS[aid])
            for aid in advisor_ids
            if aid in ADVISORS
        }

        yield {
            "type": "routing",
            "content": f"Your Council has convened. {len(advisors)} advisors are responding.",
            "metadata": {
                "advisors": [
                    {
                        "id": a.id,
                        "name": a.name,
                        "emoji": a.persona["emoji"],
                        "color": a.persona["color"],
                        "role": a.persona["role"],
                    }
                    for a in advisors.values()
                ]
            },
        }

        # Phase 1: Initial Perspectives (parallel)
        yield {"type": "phase", "content": "Initial Perspectives", "phase": "perspective"}

        perspectives = []

        async def collect_perspective(advisor: AdvisorAgent):
            chunks = []
            async for chunk in advisor.generate_perspective(
                user_message, user_context, conversation_history
            ):
                chunks.append(chunk)
            return {
                "advisor_id": advisor.id,
                "advisor_name": advisor.name,
                "content": "".join(chunks),
            }

        tasks = [collect_perspective(a) for a in advisors.values()]
        results = await asyncio.gather(*tasks)

        for perspective in results:
            perspectives.append(perspective)
            yield {
                "type": "perspective",
                "advisor_id": perspective["advisor_id"],
                "advisor_name": perspective["advisor_name"],
                "content": perspective["content"],
                "phase": "perspective",
            }

        # Phase 2: Cross-Examination / Debate
        debate_responses = []
        if len(advisors) > 1 and self.settings.max_debate_rounds > 0:
            yield {"type": "phase", "content": "Cross-Examination", "phase": "debate"}

            for round_num in range(self.settings.max_debate_rounds):
                responding_ids = []
                if "critic" in advisors and round_num == 0:
                    responding_ids.append("critic")

                for aid in advisor_ids:
                    if aid not in responding_ids and len(responding_ids) < 2:
                        responding_ids.append(aid)

                async def collect_debate(advisor: AdvisorAgent):
                    other_perspectives = [
                        p for p in perspectives if p["advisor_id"] != advisor.id
                    ]
                    chunks = []
                    async for chunk in advisor.generate_debate_response(
                        user_message, other_perspectives, user_context, conversation_history
                    ):
                        chunks.append(chunk)
                    return {
                        "advisor_id": advisor.id,
                        "advisor_name": advisor.name,
                        "content": "".join(chunks),
                    }

                debate_tasks = [
                    collect_debate(advisors[aid])
                    for aid in responding_ids
                    if aid in advisors
                ]
                round_results = await asyncio.gather(*debate_tasks)

                for response in round_results:
                    debate_responses.append(response)
                    yield {
                        "type": "debate",
                        "advisor_id": response["advisor_id"],
                        "advisor_name": response["advisor_name"],
                        "content": response["content"],
                        "phase": "debate",
                        "turn": round_num + 1,
                    }

        # Phase 3: Synthesis
        yield {"type": "phase", "content": "Synthesis", "phase": "synthesis"}

        synthesis_chunks = []
        async for chunk in self.synthesizer.synthesize(
            user_message, perspectives, debate_responses, user_context
        ):
            synthesis_chunks.append(chunk)

        synthesis_content = "".join(synthesis_chunks)
        yield {
            "type": "synthesis",
            "content": synthesis_content,
            "phase": "synthesis",
        }

        # Complete
        yield {"type": "complete", "content": "Deliberation complete."}
