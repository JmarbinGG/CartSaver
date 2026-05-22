import time
from typing import Dict, List, Any, Tuple

from app.db import SessionLocal
from app.models.cache import CachedSearchResult

# Simple in-memory cache for search results
# Keyed by "query::zip"
_cache: Dict[str, Dict[str, Any]] = {}
# Track last seen prices per product+store: key = "product_id::store_id" -> price
_last_prices: Dict[str, float] = {}


def _make_key(query: str, zip_code: str | None) -> str:
    return f"{query}::{zip_code or ''}"


def _load_from_db(query: str, zip_code: str | None) -> Tuple[List[Dict], Dict[str, List[Dict]]]:
    session = SessionLocal()
    try:
        rows = (
            session.query(CachedSearchResult)
            .filter(CachedSearchResult.query == query)
            .filter(CachedSearchResult.zip_code == (zip_code or ""))
            .all()
        )
        if not rows:
            return [], {}
        normalized = []
        grouped: Dict[str, List[Dict]] = {}
        for r in rows:
            item = {
                "product_id": r.product_id,
                "product_name": r.product_name,
                "store_id": r.store_id,
                "store_name": r.store_name,
                "price": float(r.price),
                "unit_price": float(r.unit_price) if r.unit_price is not None else None,
                "availability": r.availability,
                "store_zip": r.zip_code,
            }
            normalized.append(item)
            grouped.setdefault(r.store_id or "unknown", []).append(item)
        return normalized, grouped
    finally:
        session.close()


def get_cached(query: str, zip_code: str | None):
    key = _make_key(query, zip_code)
    entry = _cache.get(key)
    if entry:
        # check TTL
        if entry.get("expires_at", 0) < time.time():
            del _cache[key]
            entry = None
        else:
            return entry.get("results"), entry.get("grouped"), entry.get("deals")

    # try DB
    normalized, grouped = _load_from_db(query, zip_code)
    if not normalized:
        return None
    # load into in-memory cache with short TTL
    _cache[key] = {
        "results": normalized,
        "grouped": grouped,
        "deals": {},
        "expires_at": time.time() + 300,
    }
    return normalized, grouped, {}


def set_cached(query: str, zip_code: str | None, normalized_listings: List[Dict], ttl: int = 300):
    """Store normalized listings (flat list). Returns deals grouped by store if any."""
    key = _make_key(query, zip_code)
    # detect deals by comparing to last seen prices
    deals: Dict[str, List[Dict]] = {}

    for item in normalized_listings:
        pid = item.get("product_id")
        sid = item.get("store_id")
        price = float(item.get("price", 0.0))
        price_key = f"{pid}::{sid}"
        prev = _last_prices.get(price_key)
        if prev is not None and price < prev:
            deals.setdefault(sid or "unknown", []).append(item)
        # update last price
        _last_prices[price_key] = price

    # group by store
    grouped: Dict[str, List[Dict]] = {}
    for item in normalized_listings:
        store = item.get("store_id") or "unknown"
        grouped.setdefault(store, []).append(item)

    # persist to DB: remove existing for this query+zip, then insert
    session = SessionLocal()
    try:
        session.query(CachedSearchResult).filter(CachedSearchResult.query == query).filter(CachedSearchResult.zip_code == (zip_code or "")).delete()
        for item in normalized_listings:
            row = CachedSearchResult(
                query=query,
                zip_code=zip_code or "",
                product_id=item.get("product_id"),
                product_name=item.get("product_name"),
                store_id=item.get("store_id"),
                store_name=item.get("store_name"),
                price=float(item.get("price", 0.0)),
                unit_price=float(item.get("unit_price")) if item.get("unit_price") not in (None, 0, 0.0) else None,
                availability=item.get("availability", "unknown"),
                retrieved_at=time.time(),
            )
            session.add(row)
        session.commit()
    finally:
        session.close()

    _cache[key] = {
        "results": normalized_listings,
        "grouped": grouped,
        "deals": deals,
        "expires_at": time.time() + ttl,
    }
    return grouped, deals


def clear_cache():
    _cache.clear()
    _last_prices.clear()
