import json
from ..config import get_settings
from ..llm import chat
from ..advisors.personas import ADVISORS


class AdvisorRouter:
    """Routes user questions to the most relevant advisors."""

    def __init__(self):
        self.settings = get_settings()

    async def route(self, user_message: str, user_context: dict | None = None) -> list[str]:
        """Determine which advisors should respond to this query."""
        advisor_descriptions = "\n".join(
            f"- {aid}: {a['name']} — {a['role']}"
            for aid, a in ADVISORS.items()
        )

        system = "You are a routing system. Respond with ONLY a JSON array. No other text."

        prompt = f"""Available advisors:
{advisor_descriptions}

The user says: "{user_message}"

Select 3-5 advisors most relevant to this query. Consider:
1. Which expertise areas are directly relevant?
2. Which perspectives would add valuable contrast?
3. The Critic should be included for any major decision.
4. The Medic should be included if there are signs of stress or major life pressure.

Respond with ONLY a JSON array of advisor IDs, e.g.: ["strategist", "analyst", "critic"]"""

        content = await chat(
            model=self.settings.router_model,
            system=system,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.3,
        )

        content = content.strip()

        try:
            if "```" in content:
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
                content = content.strip()

            # Find the JSON array in the response
            start = content.index("[")
            end = content.index("]") + 1
            content = content[start:end]

            advisor_ids = json.loads(content)
            valid_ids = [aid for aid in advisor_ids if aid in ADVISORS]

            if not valid_ids:
                return ["strategist", "analyst", "critic"]

            return valid_ids[:self.settings.max_advisors_per_query]

        except (json.JSONDecodeError, ValueError, KeyError, TypeError):
            return ["strategist", "analyst", "critic"]
