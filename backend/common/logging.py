import logging
import os
from typing import Optional


def setup_logging(level: Optional[str] = None) -> None:
    """Configure logging for the application."""
    log_level: str = level or os.getenv("LOG_LEVEL", "INFO") or "INFO"

    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """Dependency function to get a logger instance for FastAPI endpoints."""
    return logging.getLogger(name or "main")
