import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.api.routes import router

app = FastAPI(title="AuditGPT", version="2.0")

# Allow all origins — fine for a hackathon demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve fraud_signatures as static files
FRAUD_SIG_DIR = os.path.join(os.path.dirname(__file__), "..", "fraud_signatures")
if os.path.exists(FRAUD_SIG_DIR):
    app.mount(
        "/fraud_signatures",
        StaticFiles(directory=os.path.abspath(FRAUD_SIG_DIR)),
        name="fraud_signatures",
    )

app.include_router(router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}
