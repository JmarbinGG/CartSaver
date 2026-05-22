import time
from typing import Dict, List, Any

# Simple in-memory cache for search results
# Keyed by "query::zip"
_cache: Dict[str, Dict[str, Any]] = {}
# Track last seen prices per product+store: key = "product_id::store_id" -> price
_last_prices: Dict[str, float] = {}


def _make_key(query: str, zip_code: str | None) -> str:
    return f"{query}::{zip_code or ''}"


def get_cached(query: str, zip_code: str | None):
    key = _make_key(query, zip_code)
    entry = _cache.get(key)
    if not entry:
        return None
    # check TTL
    if entry.get("expires_at", 0) < time.time():
        del _cache[key]
        return None
    return entry.get("results"), entry.get("grouped"), entry.get("deals")


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
