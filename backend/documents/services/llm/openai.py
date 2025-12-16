import os
from typing import Optional

from openai import OpenAI


def get_openai_client() -> Optional[OpenAI]:
    """Dependency to get OpenAI client."""
    api_key = os.getenv("OPENAI_API_KEY")
    return OpenAI(api_key=api_key) if api_key else None
