from pathlib import Path
from typing import Optional, Dict, Any

from metrics.models import DocumentProcessingRunMetrics


def calculate_extraction_completeness(
    extracted_text: str, raw_file_size: Optional[int] = None
) -> Optional[float]:
    """
    Calculate text extraction completeness percentage.
    
    If raw_file_size is provided, uses it as the baseline.
    Otherwise, uses a heuristic based on expected text density.
    """
    if not extracted_text:
        return 0.0

    extracted_len = len(extracted_text)

    if raw_file_size:
        if raw_file_size == 0:
            return None
        return min(100.0, (extracted_len / raw_file_size) * 100)

    return None


def count_filled_fields(structured_data: Dict[str, Any]) -> int:
    """
    Count the number of filled fields in structured data.
    
    Returns the count of non-empty fields in the structured data schema.
    """
    if not structured_data:
        return 0

    expected_fields = {
        "pet_name",
        "species",
        "breed",
        "weight",
        "diagnoses",
        "past_medical_issues",
        "chronic_conditions",
        "procedures",
        "medications",
        "symptom_onset_date",
        "notes",
        "clinic_info",
    }

    filled_count = 0

    for field in expected_fields:
        value = structured_data.get(field)
        if value is not None and value != "":
            if isinstance(value, list) and len(value) > 0:
                filled_count += 1
            elif isinstance(value, dict):
                if any(v is not None and v != "" for v in value.values()):
                    filled_count += 1
            else:
                filled_count += 1

    return filled_count


def calculate_field_fill_rate(structured_data: Dict[str, Any]) -> float:
    """
    Calculate field fill rate: filled_fields / total_expected_fields.
    
    Counts non-empty fields in the structured data schema.
    """
    if not structured_data:
        return 0.0

    expected_fields = {
        "pet_name",
        "species",
        "breed",
        "weight",
        "diagnoses",
        "past_medical_issues",
        "chronic_conditions",
        "procedures",
        "medications",
        "symptom_onset_date",
        "notes",
        "clinic_info",
    }

    filled_count = count_filled_fields(structured_data)
    total_count = len(expected_fields)

    return (filled_count / total_count) * 100.0 if total_count > 0 else 0.0


def calculate_llm_token_cost(
    prompt_tokens: int,
    completion_tokens: int,
    model: str = "gpt-4o-mini",
) -> float:
    """
    Calculate LLM token cost in USD.
    
    Pricing (as of 2024):
    - gpt-4o-mini: $0.15 per 1M input tokens, $0.60 per 1M output tokens
    - gpt-4.1-mini: same pricing as gpt-4o-mini
    """
    pricing = {
        "gpt-4o-mini": {
            "input": 0.15 / 1_000_000,
            "output": 0.60 / 1_000_000,
        },
        "gpt-4.1-mini": {
            "input": 0.15 / 1_000_000,
            "output": 0.60 / 1_000_000,
        },
    }

    model_pricing = pricing.get(model, pricing["gpt-4o-mini"])

    input_cost = prompt_tokens * model_pricing["input"]
    output_cost = completion_tokens * model_pricing["output"]

    return input_cost + output_cost


def create_processing_metrics(
    document_id: str,
    extracted_text: str,
    structured_data: Dict[str, Any],
    file_path: Path,
    prompt_tokens: Optional[int],
    completion_tokens: Optional[int],
    model: str = "gpt-4.1-mini",
    processing_time: Optional[float] = None,
) -> DocumentProcessingRunMetrics:
    """
    Create and calculate all processing metrics for a document processing run.
    
    Args:
        document_id: ID of the processing run
        extracted_text: Extracted text from the document
        structured_data: Structured data dictionary
        file_path: Path to the original file
        prompt_tokens: Number of prompt tokens used
        completion_tokens: Number of completion tokens used
        model: LLM model name used
        processing_time: Elapsed time for text extraction and structured data parsing in seconds
    
    Returns:
        DocumentProcessingRunMetrics object with all calculated metrics
    """
    file_size = file_path.stat().st_size if file_path.exists() else None
    extraction_completeness = calculate_extraction_completeness(
        extracted_text, file_size
    )
    field_fill_rate = calculate_field_fill_rate(structured_data)
    filled_fields_count = count_filled_fields(structured_data)

    llm_token_cost = None
    total_tokens = None
    if prompt_tokens is not None and completion_tokens is not None:
        total_tokens = prompt_tokens + completion_tokens
        llm_token_cost = calculate_llm_token_cost(
            prompt_tokens, completion_tokens, model=model
        )

    extracted_field_efficiency = None
    if llm_token_cost is not None and filled_fields_count is not None and filled_fields_count > 0:
        extracted_field_efficiency = llm_token_cost / filled_fields_count

    return DocumentProcessingRunMetrics(
        document_processing_runs_id=document_id,
        extraction_completeness_pct=extraction_completeness,
        field_fill_rate=field_fill_rate,
        filled_fields_count=filled_fields_count,
        extracted_field_efficiency=extracted_field_efficiency,
        llm_token_cost=llm_token_cost,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
        document_run_processing_time=processing_time,
    )

