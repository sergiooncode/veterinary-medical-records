import os
from pathlib import Path

from dotenv import load_dotenv
from celery import Celery

load_dotenv()
env_local_paths = [
    Path(__file__).parent.parent / ".env.local",
    Path(".env.local"),
    Path("/app/backend/.env.local"),
]
env_loaded = False
for env_path in env_local_paths:
    if env_path.exists():
        load_dotenv(env_path, override=True)
        env_loaded = True
        break

broker_url = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
result_backend = os.getenv("CELERY_RESULT_BACKEND", broker_url)

celery_app = Celery(
    "veterinary_medical_records",
    broker=broker_url,
    backend=result_backend,
)

# Ensure task modules are imported so @shared_task registrations are visible
try:
    import documents.tasks  # type: ignore[import-not-found]
    import metrics.tasks  # type: ignore[import-not-found]
except Exception:
    # In some contexts (e.g. tooling, tests) these packages may not be importable;
    # Celery workers will still import them when running in the container.
    pass


