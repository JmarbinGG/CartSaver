from fastapi import APIRouter, Query
from typing import List, Dict

from app.providers.kroger_mock import KrogerMock
from app.providers.instacart_mock import InstacartMock
from app.services.normalization import normalize_listing
from app.services.distance import distance_between_zips
from app.services.cache import get_cached, set_cached
from app.schemas.search import StoreListing, SearchResponse

router = APIRouter()


@router.get("/search", response_model=SearchResponse)
def search(query: str = Query(...), zip_code: str | None = None):
    kroger = KrogerMock()
    insta = InstacartMock()

    normalized_zip = None
    raw_zip = None
    if zip_code is not None:
        raw_zip = str(zip_code).strip()
        if raw_zip.isdigit():
            normalized_zip = raw_zip.zfill(5)

    search_zip = normalized_zip if normalized_zip is not None else raw_zip

    # check cache first
    cached = get_cached(query, search_zip)
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

    raw_results = []
    raw_results.extend(kroger.search(query, search_zip))
    raw_results.extend(insta.search(query, search_zip))

    normalized = [normalize_listing(r) for r in raw_results]

    for item in normalized:
        try:
            if item.get("store_zip") and normalized_zip:
                miles = distance_between_zips(normalized_zip, item.get("store_zip"))
                item["distance_miles"] = round(miles, 2)
                item["eta_minutes"] = int(round((miles / 30.0) * 60))
        except (KeyError, ValueError, TypeError):
            item["distance_miles"] = None
            item["eta_minutes"] = None

    # group by store_id
    grouped: Dict[str, List[StoreListing]] = {}
    for n in normalized:
        store = n.get("store_id") or "unknown"
        listing = StoreListing(**n)
        grouped.setdefault(store, []).append(listing)

    # store in cache (flat normalized list)
    grouped_cache, deals = set_cached(query, search_zip, normalized)

    return SearchResponse(query=query, results=grouped, deals={s: [StoreListing(**i) for i in items] for s, items in deals.items()} if deals else None)
