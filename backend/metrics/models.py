import uuid
from datetime import datetime, UTC
from typing import Optional
from sqlmodel import SQLModel, Field


class DocumentProcessingRunMetrics(SQLModel, table=True):
    """Metrics for document processing runs."""

    __tablename__ = "document_processing_run_metrics"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    document_processing_runs_id: str = Field(foreign_key="document_processing_runs.id", index=True)
    extraction_completeness_pct: Optional[float] = Field(
        default=None, description="Text extraction completeness percentage"
    )
    field_fill_rate: Optional[float] = Field(
        default=None, description="Field fill rate (filled_fields / total_expected_fields)"
    )
    filled_fields_count: Optional[int] = Field(
        default=None, description="Number of filled fields in structured data"
    )
    extracted_field_efficiency: Optional[float] = Field(
        default=None, description="Cost per filled field (llm_token_cost / filled_fields_count) in USD"
    )
    llm_token_cost: Optional[float] = Field(
        default=None, description="LLM token cost in USD"
    )
    prompt_tokens: Optional[int] = Field(default=None, description="Prompt tokens used")
    completion_tokens: Optional[int] = Field(
        default=None, description="Completion tokens used"
    )
    total_tokens: Optional[int] = Field(default=None, description="Total tokens used")
    document_run_processing_time: Optional[float] = Field(
        default=None, description="Elapsed time for text extraction and structured data parsing in seconds"
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

