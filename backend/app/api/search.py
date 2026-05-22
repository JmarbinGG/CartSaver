from fastapi import APIRouter, Query
from typing import List, Dict

from app.providers.kroger_mock import KrogerMock
from app.providers.instacart_mock import InstacartMock
from app.services.normalization import normalize_listing
from app.services.cache import get_cached, set_cached
from app.schemas.search import StoreListing, SearchResponse

router = APIRouter()


@router.get("/search", response_model=SearchResponse)
def search(query: str = Query(...), zip_code: str | None = None):
    kroger = KrogerMock()
    insta = InstacartMock()

    raw_results = []
    raw_results.extend(kroger.search(query, zip_code))
    raw_results.extend(insta.search(query, zip_code))

    # check cache first
    cached = get_cached(query, zip_code)
    if cached:
        results_flat, grouped_cached, deals_cached = cached
        # convert grouped to StoreListing objects
        grouped_obj: Dict[str, List[StoreListing]] = {}
        for store, items in grouped_cached.items():
            grouped_obj[store] = [StoreListing(**i) for i in items]
        deals_obj = None
        if deals_cached:
            deals_obj = {s: [StoreListing(**i) for i in items] for s, items in deals_cached.items()}
        return SearchResponse(query=query, results=grouped_obj, deals=deals_obj)

    normalized = [normalize_listing(r) for r in raw_results]

    # group by store_id
    grouped: Dict[str, List[StoreListing]] = {}
    for n in normalized:
        store = n.get("store_id") or "unknown"
        listing = StoreListing(**n)
        grouped.setdefault(store, []).append(listing)

    # store in cache (flat normalized list)
    grouped_cache, deals = set_cached(query, zip_code, normalized)

    return SearchResponse(query=query, results=grouped, deals={s: [StoreListing(**i) for i in items] for s, items in deals.items()} if deals else None)
