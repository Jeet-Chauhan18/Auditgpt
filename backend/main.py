# import os
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI(title="AuditGPT", version="2.0")

# # ── CORS — allow everything, no credentials ───────────────────────────────────
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=False,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ── Health check — registered FIRST so it always works ───────────────────────
# @app.get("/health")
# def health():
#     return {"status": "ok"}

# # ── Static files — wrapped so a missing folder can't crash startup ────────────
# try:
#     from fastapi.staticfiles import StaticFiles
#     fraud_dir = os.path.join(os.path.dirname(__file__), "..", "fraud_signatures")
#     fraud_dir = os.path.abspath(fraud_dir)
#     if os.path.isdir(fraud_dir):
#         app.mount("/fraud_signatures", StaticFiles(directory=fraud_dir), name="fraud_signatures")
# except Exception as e:
#     print(f"[WARN] Could not mount fraud_signatures: {e}")

# # ── API routes — wrapped so an import error gives a clear message ─────────────
# try:
#     from backend.api.routes import router
#     app.include_router(router, prefix="/api")
# except Exception as e:
#     print(f"[ERROR] Failed to load API routes: {e}")

#     @app.get("/api/error")
#     def route_error():
#         return {"error": str(e)}
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
    app.include_router(router, prefix="/api")
except Exception as e:
    print(f"[ERROR] Failed to load API routes: {e}")

    @app.get("/api/error")
    def route_error():
        return {"error": str(e)}