import logging
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from common.logging import setup_logging
from documents.router import router as documents_router

# Load .env first, then .env.local from backend folder (which overrides .env)
load_dotenv()  # Load .env from root if it exists
# Try multiple paths for .env.local
env_local_paths = [
    Path(__file__).parent / ".env.local",  # Same dir as main.py
    Path(".env.local"),  # Current working directory
    Path("/app/backend/.env.local"),  # Absolute path in container
]
env_loaded = False
for env_path in env_local_paths:
    if env_path.exists():
        load_dotenv(env_path, override=True)
        env_loaded = True
        break

setup_logging()
logger = logging.getLogger(__name__)
if env_loaded:
    logger.info("Loaded .env.local successfully")
else:
    logger.warning(f".env.local not found in any of: {env_local_paths}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown."""
    # Startup
    setup_logging()
    logger.info("Application startup")
    logger.info("Database initialized")
    yield
    # Shutdown
    logger.info("Application shutdown")


app = FastAPI(title="Veterinary Medical Records API", lifespan=lifespan)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://frontend:80",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")
api_router.include_router(documents_router)
app.include_router(api_router)


@app.get("/")
async def root():
    return {"message": "Veterinary Medical Records API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
