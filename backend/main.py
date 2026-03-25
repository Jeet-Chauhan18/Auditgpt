from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AuditGPT", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

try:
    from backend.api.routes import router
    app.include_router(router)  # ✅ FIXED
except Exception as e:
    print(f"[ERROR] Failed to load API routes: {e}")

    @app.get("/api/error")
    def route_error():
        return {"error": str(e)}