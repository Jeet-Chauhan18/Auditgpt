from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="AuditGPT", version="2.0")

# --- CORS ---
# In production, VITE_FRONTEND_URL is set in Railway env vars
# e.g. https://your-app.vercel.app
# For local dev, localhost:5173 is allowed by default
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


try:
    from backend.api.routes import router
    app.include_router(router)
except Exception as e:
    print(f"[ERROR] Failed to load API routes: {e}")

    @app.get("/api/error")
    def route_error():
        return {"error": str(e)}
