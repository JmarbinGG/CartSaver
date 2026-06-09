from fastapi import APIRouter, Query
from typing import List, Dict

from app.providers.kroger_mock import KrogerMock
from app.providers.kroger_api import KrogerAPI
from app.providers.instacart_mock import InstacartMock
from app.providers.walmart_mock import WalmartMock
from app.services.normalization import normalize_listing, detect_category, generate_match_key, make_display_name, canonicalize_name
from app.services.distance import distance_between_zips
from app.services.cache import get_cached, set_cached
from app.schemas.search import StoreListing, SearchResponse, ProductGroup
from app.config import settings


def _make_kroger():
    if settings.kroger_prod_client_id and settings.kroger_prod_client_secret:
        return KrogerAPI(settings.kroger_prod_client_id, settings.kroger_prod_client_secret)
    if settings.kroger_client_id and settings.kroger_client_secret:
        return KrogerAPI(settings.kroger_client_id, settings.kroger_client_secret)
    return KrogerMock()

router = APIRouter()


def _build_groups(normalized: List[Dict]) -> Dict[str, ProductGroup]:
    """Build product groups keyed by match_key from a flat normalized listing list."""
    groups_raw: Dict[str, dict] = {}
    for n in normalized:
        # Re-derive match_key/display_name in case cache items lack them
        mk = n.get("match_key")
        dn = n.get("display_name")
        canonical = n.get("canonical_name")
        if not mk:
            canonical = canonical or canonicalize_name(n.get("product_name") or "")
            mk = generate_match_key(canonical)
        if not dn:
            canonical = canonical or canonicalize_name(n.get("product_name") or "")
            dn = make_display_name(canonical)
        if not canonical:
            canonical = canonicalize_name(n.get("product_name") or "")

        listing = StoreListing(**{**n, "match_key": mk, "display_name": dn, "canonical_name": canonical})
        if mk not in groups_raw:
            groups_raw[mk] = {
                "match_key": mk,
                "display_name": dn,
                "category": detect_category(canonical),
                "listings": [],
                "best_price": listing.price,
                "store_count": 0,
                "image_url": None,
            }
        groups_raw[mk]["listings"].append(listing)
        if listing.price < groups_raw[mk]["best_price"]:
            groups_raw[mk]["best_price"] = listing.price
        if groups_raw[mk]["image_url"] is None and listing.image_url:
            groups_raw[mk]["image_url"] = listing.image_url

    for g in groups_raw.values():
        g["store_count"] = len({l.store_id for l in g["listings"]})

    return {mk: ProductGroup(**g) for mk, g in groups_raw.items()}


@router.get("/search", response_model=SearchResponse)
def search(query: str = Query(...), zip_code: str | None = None):
    kroger = _make_kroger()
    insta = InstacartMock()
    walmart = WalmartMock()

    normalized_zip = None
    raw_zip = None
    if zip_code is not None:
        raw_zip = str(zip_code).strip()
        if raw_zip.isdigit():
            normalized_zip = raw_zip.zfill(5)

    search_zip = normalized_zip if normalized_zip is not None else raw_zip

    cached = get_cached(query, search_zip)
    if cached:
        results_flat, grouped_cached, deals_cached = cached
        grouped_obj: Dict[str, List[StoreListing]] = {}
        for store, items in grouped_cached.items():
            grouped_obj[store] = [StoreListing(**i) for i in items]
        deals_obj = None
        if deals_cached:
            deals_obj = {s: [StoreListing(**i) for i in items] for s, items in deals_cached.items()}
        groups_obj = _build_groups(results_flat)
        return SearchResponse(query=query, results=grouped_obj, groups=groups_obj, deals=deals_obj)

    raw_results: list[Dict] = []
    raw_results.extend(kroger.search(query, search_zip))
    raw_results.extend(insta.search(query, search_zip))
    raw_results.extend(walmart.search(query, search_zip))

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

    # group by store_id for cache compat
    grouped: Dict[str, List[StoreListing]] = {}
    for n in normalized:
        store = n.get("store_id") or "unknown"
        grouped.setdefault(store, []).append(StoreListing(**n))

    groups_obj = _build_groups(normalized)

    grouped_cache, deals = set_cached(query, search_zip, normalized)
    deals_obj = None
    if deals:
        deals_obj = {s: [StoreListing(**i) for i in items] for s, items in deals.items()}

    return SearchResponse(query=query, results=grouped, groups=groups_obj, deals=deals_obj)
