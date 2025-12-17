import json
from typing import Any, Optional

from openai import OpenAI

from documents.services.llm.openai import get_openai_client

USER_PROMPT_V0 = (
    "Extract medical information from this veterinary record for insurance "
    "claim adjudication:\n\n{text}"
)


SYSTEM_PROMPT_V0 = """Extract veterinary medical record information for insurance claim adjudication. Return as JSON with the following structure:
{
  "pet_name": "string or null",
  "species": "string or null",
  "breed": "string or null",
  "weight": "string or null",
  "diagnoses": [
    {
      "name": "string",
      "date": "YYYY-MM-DD or null",
      "icd_code": "string or null",
      "is_chronic": boolean
    }
  ],
  "past_medical_issues": ["array of strings"],
  "chronic_conditions": ["array of strings"],
  "procedures": [
    {
      "name": "string",
      "date": "YYYY-MM-DD or null",
      "cpt_code": "string or null",
      "reason": "string or null",
      "cost": number or null
    }
  ],
  "medications": [
    {
      "name": "string",
      "start_date": "YYYY-MM-DD or null",
      "end_date": "YYYY-MM-DD or null",
      "dosage": "string or null",
      "frequency": "string or null"
    }
  ],
  "symptom_onset_date": "YYYY-MM-DD or null",
  "notes": "string",
  "clinic_info": {
    "name": "string or null",
    "address": "string or null",
    "phone": "string or null",
    "veterinarian": "string or null"
  }
}

IMPORTANT: Extract dates whenever possible as they are critical for:
- Pre-existing condition evaluation (diagnosis date vs policy start date)
- Waiting period evaluation (procedure date vs policy start date + waiting period)
- Medication history tracking

Extract CPT/ICD codes if mentioned in the document. Extract costs if included."""


def parse_structured_data(
    text: str, logger, client: Optional[OpenAI] = None, model: str = "gpt-4o-mini"
) -> tuple[dict, Optional[int], Optional[int], str]:
    """
    Parse extracted text into structured medical record data using OpenAI.
    
    Args:
        text: Extracted text to parse
        logger: Logger instance
        client: Optional OpenAI client (uses default if not provided)
        model: LLM model name to use (default: "gpt-4o-mini")
    
    Returns:
        Tuple of (structured_data_dict, prompt_tokens, completion_tokens, model_name)
    """
    logger.info("Parsing structured data from extracted text")

    llm_client = client or get_openai_client()

    if llm_client:
        user_prompt = USER_PROMPT_V0.format(text=text)
        try:
            response = llm_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT_V0},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content or "{}"
            result = json.loads(content)
            logger.info(f"Parsed structured data: {result}")
            
            prompt_tokens = response.usage.prompt_tokens if response.usage else None
            completion_tokens = response.usage.completion_tokens if response.usage else None
            actual_model = response.model
            
            return result, prompt_tokens, completion_tokens, actual_model
        except Exception as e:
            logger.warning(f"OpenAI parsing failed, using fallback: {str(e)}")
    else:
        logger.warning("OpenAI API key not configured, using basic extraction")

    # Fallback to basic extraction with neutral placeholders
    fallback: dict[str, Any] = {
        "pet_name": None,
        "species": None,
        "breed": None,
        "weight": None,
        "diagnoses": [],
        "past_medical_issues": [],
        "chronic_conditions": [],
        "procedures": [],
        "medications": [],
        "symptom_onset_date": None,
        "notes": text[:500] if text else "",
        "clinic_info": {
            "name": None,
            "address": None,
            "phone": None,
            "veterinarian": None,
        },
    }
    return fallback, None, None, model
