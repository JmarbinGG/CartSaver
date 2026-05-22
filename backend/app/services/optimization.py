from typing import List, Dict, Tuple
from collections import defaultdict

from app.services.normalization import normalize_listing
from app.services.distance import distance_between_zips


def assign_cheapest(listings_by_product: Dict[str, List[Dict]]) -> Tuple[List[Dict], float]:
    assignments = []
    stores = set()
    total_item_cost = 0.0

    for product_id, listings in listings_by_product.items():
        if not listings:
            continue
        # choose lowest price
        best = min(listings, key=lambda r: float(r.get("price", 0.0)))
        assignments.append({
            "product_id": product_id,
            "product_name": best.get("product_name"),
            "store_id": best.get("store_id"),
            "store_name": best.get("store_name"),
            "price": float(best.get("price", 0.0)),
        })
        stores.add((best.get("store_id"), best.get("store_zip")))
        total_item_cost += float(best.get("price", 0.0))

    return assignments, total_item_cost, stores


def compute_travel_cost(origin_zip: str, stores: set, gas_price_per_mile: float = 0.25) -> float:
    # stores is set of (store_id, store_zip)
    total_miles = 0.0
    seen = set()
    for sid, szip in stores:
        if not szip or (sid in seen):
            continue
        try:
            miles = distance_between_zips(origin_zip, szip)
            total_miles += miles * 2  # round trip
            seen.add(sid)
        except Exception:
            continue
    return total_miles * gas_price_per_mile


def optimize_for_items(listings_by_product: Dict[str, List[Dict]], origin_zip: str, gas_price_per_mile: float = 0.25) -> Dict:
    assignments, total_item_cost, stores = assign_cheapest(listings_by_product)
    travel_cost = compute_travel_cost(origin_zip, stores, gas_price_per_mile)
    total_cost = total_item_cost + travel_cost

    return {
        "assignments": assignments,
        "total_item_cost": total_item_cost,
        "travel_cost": travel_cost,
        "total_cost": total_cost,
        "rationale": "Assigned each item to the cheapest available listing."
    }
