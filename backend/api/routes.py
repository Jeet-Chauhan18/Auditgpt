import json
import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from backend.llm.client import generate_narrative_stream

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
REPORTS_DIR = os.path.join(DATA_DIR, "reports")
SECTOR_SUMMARY_FILE = os.path.join(DATA_DIR, "sector_summary.json")


def _load_json(path: str):
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def _load_all_reports() -> list[dict]:
    """Load all pre-computed report JSON files."""
    reports = []
    if not os.path.exists(REPORTS_DIR):
        return reports
    for fname in os.listdir(REPORTS_DIR):
        if fname.endswith(".json"):
            with open(os.path.join(REPORTS_DIR, fname)) as f:
                reports.append(json.load(f))
    return reports


@router.get("/sectors")
def get_sectors():
    """Return sector summary with average risk scores."""
    data = _load_json(SECTOR_SUMMARY_FILE)
    if data is None:
        return []
    return data


@router.get("/search")
def search_companies(q: str = ""):
    """Fuzzy search for company names. Returns top 10 matches."""
    if len(q) < 2:
        return []

    query = q.lower()
    reports = _load_all_reports()
    results = []

    for r in reports:
        name = r.get("company_name", "").lower()
        cid = r.get("company_id", "").lower()
        sector = r.get("sector", "").lower()

        # Match against name, id, or sector
        if query in name or query in cid or query in sector:
            # Score: exact prefix match scores highest
            score = 0
            if name.startswith(query):
                score = 3
            elif cid.startswith(query):
                score = 2
            elif query in name:
                score = 1

            results.append({
                "company_id": r["company_id"],
                "company_name": r["company_name"],
                "sector": r.get("sector", ""),
                "composite_score": r.get("composite_score"),
                "_score": score,
            })

    results.sort(key=lambda x: (-x["_score"], x["company_name"]))
    # Remove internal score field
    for r in results:
        del r["_score"]

    return results[:10]


@router.get("/report/{company_id}")
def get_report(company_id: str):
    """Return full ForensicReport for a company."""
    report_path = os.path.join(REPORTS_DIR, f"{company_id}.json")
    report = _load_json(report_path)

    if report is None:
        # Try case-insensitive match
        if os.path.exists(REPORTS_DIR):
            for fname in os.listdir(REPORTS_DIR):
                if fname.lower() == f"{company_id.lower()}.json":
                    report = _load_json(os.path.join(REPORTS_DIR, fname))
                    break

    if report is None:
        # Return 404 with peer suggestions
        reports = _load_all_reports()
        suggestions = [
            {"company_id": r["company_id"], "company_name": r["company_name"]}
            for r in reports[:5]
        ]
        raise HTTPException(
            status_code=404,
            detail={"message": "Company not found", "suggestions": suggestions},
        )

    return report


@router.get("/stream/{company_id}")
def stream_narrative(company_id: str):
    """SSE stream of LLM narrative for a company."""
    report_path = os.path.join(REPORTS_DIR, f"{company_id}.json")
    report = _load_json(report_path)

    if report is None:
        raise HTTPException(status_code=404, detail="Company not found")

    # If narrative is already cached, stream it character by character
    cached_narrative = report.get("narrative")
    if cached_narrative:
        def stream_cached():
            # Stream in chunks of ~50 chars for realistic feel
            for i in range(0, len(cached_narrative), 50):
                chunk = cached_narrative[i:i + 50]
                yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            stream_cached(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
        )

    # Live generation from Gemini
    company_path = os.path.join(DATA_DIR, "companies", f"{company_id}.json")
    company_data = _load_json(company_path)
    if not company_data:
        raise HTTPException(status_code=404, detail="Company data not found")

    scores = {
        "composite_score": report.get("composite_score", 0),
        "risk_level": report.get("risk_level", "Unknown"),
        "beneish": report.get("beneish", {}),
        "altman": report.get("altman", {}),
        "red_flags": report.get("red_flags", []),
        "breakdown": report.get("breakdown", {}),
    }

    def stream_live():
        for chunk in generate_narrative_stream(company_data, scores):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        stream_live(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )
