from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router

app = FastAPI(title="AuditGPT", description="Financial Statement Forensics Engine")

from fastapi.staticfiles import StaticFiles
app.mount("/fraud_signatures", StaticFiles(directory="fraud_signatures"), name="fraud_signatures")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}
