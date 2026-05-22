from typing import Dict


def normalize_listing(raw: Dict) -> Dict:
    """Normalize various provider product dicts to the StoreListing shape.

    Ensures keys: store_id, store_name, product_id, product_name, price, unit_price, availability
    """
    return {
        "store_id": raw.get("store_id") or raw.get("vendor_id") or "",
        "store_name": raw.get("store_name") or raw.get("vendor_name") or "",
        "product_id": raw.get("product_id") or raw.get("id") or "",
        "product_name": raw.get("product_name") or raw.get("name") or "",
        "price": float(raw.get("price") or raw.get("sale_price") or 0.0),
        "unit_price": None if raw.get("unit_price") in (None, 0, 0.0) else float(raw.get("unit_price")),
        "availability": raw.get("availability") or raw.get("stock") or "unknown",
    }
