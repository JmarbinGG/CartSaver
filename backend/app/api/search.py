from fastapi import APIRouter, Query
from typing import List, Dict

from app.providers.kroger_mock import KrogerMock
from app.providers.instacart_mock import InstacartMock
from app.services.normalization import normalize_listing
from app.schemas.search import StoreListing, SearchResponse

router = APIRouter()


@router.get("/search", response_model=SearchResponse)
def search(query: str = Query(...), zip_code: str | None = None):
    kroger = KrogerMock()
    insta = InstacartMock()

    raw_results = []
    raw_results.extend(kroger.search(query, zip_code))
    raw_results.extend(insta.search(query, zip_code))

    normalized = [normalize_listing(r) for r in raw_results]

    # group by store_id
    grouped: Dict[str, List[StoreListing]] = {}
    for n in normalized:
        store = n.get("store_id") or "unknown"
        listing = StoreListing(**n)
        grouped.setdefault(store, []).append(listing)

    return SearchResponse(query=query, results=grouped)
