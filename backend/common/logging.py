import logging
import os


def setup_logging(level: str = None):
    """Configure logging for the application."""
    log_level = level or os.getenv("LOG_LEVEL", "INFO")

    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def get_logger(name: str = None):
    """Dependency function to get a logger instance for FastAPI endpoints."""
    return logging.getLogger(name or "main")
