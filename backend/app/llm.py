"""Unified LLM client that works with both Anthropic API and DO Gradient (OpenAI-compatible)."""

from typing import AsyncGenerator
from .config import get_settings

settings = get_settings()

# Detect which provider to use based on the API key format
_is_anthropic = settings.do_model_access_key.startswith("sk-ant-")


async def chat_stream(
    model: str,
    system: str,
    messages: list[dict],
    max_tokens: int = 1024,
    temperature: float = 0.7,
) -> AsyncGenerator[str, None]:
    """Stream a chat completion from the configured provider."""
    if _is_anthropic:
        async for chunk in _anthropic_stream(model, system, messages, max_tokens, temperature):
            yield chunk
    else:
        async for chunk in _openai_stream(model, system, messages, max_tokens, temperature):
            yield chunk


async def chat(
    model: str,
    system: str,
    messages: list[dict],
    max_tokens: int = 1024,
    temperature: float = 0.3,
) -> str:
    """Non-streaming chat completion."""
    chunks = []
    async for chunk in chat_stream(model, system, messages, max_tokens, temperature):
        chunks.append(chunk)
    return "".join(chunks)


async def _anthropic_stream(
    model: str,
    system: str,
    messages: list[dict],
    max_tokens: int,
    temperature: float,
) -> AsyncGenerator[str, None]:
    from anthropic import AsyncAnthropic

    client = AsyncAnthropic(api_key=settings.do_model_access_key)

    # Anthropic API doesn't use "system" role in messages — it's a separate param.
    # Filter out system messages and merge them into the system param.
    user_messages = [m for m in messages if m["role"] != "system"]
    extra_system = "\n\n".join(
        m["content"] for m in messages if m["role"] == "system"
    )
    full_system = f"{system}\n\n{extra_system}".strip() if extra_system else system

    # Ensure messages alternate user/assistant and start with user
    cleaned = _ensure_alternating(user_messages)

    async with client.messages.stream(
        model=model,
        system=full_system,
        messages=cleaned,
        max_tokens=max_tokens,
        temperature=temperature,
    ) as stream:
        async for text in stream.text_stream:
            yield text


async def _openai_stream(
    model: str,
    system: str,
    messages: list[dict],
    max_tokens: int,
    temperature: float,
) -> AsyncGenerator[str, None]:
    from openai import AsyncOpenAI

    client = AsyncOpenAI(
        base_url=settings.do_inference_url,
        api_key=settings.do_model_access_key,
    )

    all_messages = [{"role": "system", "content": system}] + messages

    stream = await client.chat.completions.create(
        model=model,
        messages=all_messages,
        max_tokens=max_tokens,
        temperature=temperature,
        stream=True,
    )

    async for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content


def _ensure_alternating(messages: list[dict]) -> list[dict]:
    """Ensure messages alternate between user and assistant roles."""
    if not messages:
        return [{"role": "user", "content": "Hello"}]

    result = []
    for msg in messages:
        role = msg["role"]
        if role not in ("user", "assistant"):
            role = "user"

        if result and result[-1]["role"] == role:
            # Merge consecutive same-role messages
            result[-1]["content"] += "\n\n" + msg["content"]
        else:
            result.append({"role": role, "content": msg["content"]})

    # Must start with user
    if result and result[0]["role"] != "user":
        result.insert(0, {"role": "user", "content": "Please proceed."})

    return result
