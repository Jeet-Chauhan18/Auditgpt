import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.api.routes import router

app = FastAPI(title="AuditGPT", version="2.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow the Vercel frontend + localhost dev
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    # Set FRONTEND_URL env var on Railway to your Vercel URL
    # e.g. https://auditgpt.vercel.app
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    ALLOWED_ORIGINS.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files (fraud signatures served to frontend) ────────────────────────
FRAUD_SIG_DIR = os.path.join(os.path.dirname(__file__), "fraud_signatures")
if os.path.exists(FRAUD_SIG_DIR):
    app.mount("/fraud_signatures", StaticFiles(directory=FRAUD_SIG_DIR), name="fraud_signatures")

# ── API routes ────────────────────────────────────────────────────────────────
app.include_router(router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}
