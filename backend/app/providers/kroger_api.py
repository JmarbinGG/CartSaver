import base64
import math
import time
from typing import List, Dict, Optional

import httpx

from app.services.distance import zip_to_centroid

MAX_STORE_RADIUS_MILES = 50


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 3958.8
    p = math.pi / 180
    a = (math.sin((lat2 - lat1) * p / 2) ** 2
         + math.cos(lat1 * p) * math.cos(lat2 * p) * math.sin((lon2 - lon1) * p / 2) ** 2)
    return 2 * r * math.asin(math.sqrt(a))

BASE = "https://api.kroger.com/v1"
TOKEN_URL = f"{BASE}/connect/oauth2/token"
PRODUCTS_URL = f"{BASE}/products"
LOCATIONS_URL = f"{BASE}/locations"


class KrogerAPI:
    def __init__(self, client_id: str, client_secret: str):
        self._client_id = client_id
        self._client_secret = client_secret
        self._token: Optional[str] = None
        self._token_expires_at: float = 0
        self._location_cache: Dict[str, Dict] = {}

    def _get_token(self) -> str:
        if self._token and time.time() < self._token_expires_at - 30:
            return self._token
        creds = base64.b64encode(f"{self._client_id}:{self._client_secret}".encode()).decode()
        resp = httpx.post(
            TOKEN_URL,
            headers={"Authorization": f"Basic {creds}", "Content-Type": "application/x-www-form-urlencoded"},
            data={"grant_type": "client_credentials", "scope": "product.compact"},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        self._token = data["access_token"]
        self._token_expires_at = time.time() + data.get("expires_in", 1800)
        return self._token

    def _nearest_location(self, zip_code: str) -> Optional[Dict]:
        if zip_code in self._location_cache:
            return self._location_cache[zip_code]
        token = self._get_token()
        resp = httpx.get(
            LOCATIONS_URL,
            headers={"Authorization": f"Bearer {token}"},
            params={"filter.zipCode": zip_code, "filter.limit": 1, "filter.radiusInMiles": 50},
            timeout=10,
        )
        resp.raise_for_status()
        locations = resp.json().get("data", [])
        if not locations:
            self._location_cache[zip_code] = None
            return None
        loc = locations[0]
        # Kroger ignores radiusInMiles when no nearby stores exist — verify distance ourselves
        geo = loc.get("geolocation", {})
        store_lat = geo.get("latitude")
        store_lon = geo.get("longitude")
        if store_lat is not None and store_lon is not None:
            try:
                user_lat, user_lon = zip_to_centroid(zip_code)
                miles = _haversine(user_lat, user_lon, store_lat, store_lon)
                if miles > MAX_STORE_RADIUS_MILES:
                    self._location_cache[zip_code] = None
                    return None
            except Exception:
                pass
        self._location_cache[zip_code] = loc
        return loc

    def search(self, query: str, zip_code: Optional[str] = None) -> List[Dict]:
        token = self._get_token()

        params: Dict = {"filter.term": query, "filter.limit": 10, "filter.fulfillment": "ais"}

        location = None
        store_zip = zip_code
        if zip_code:
            try:
                location = self._nearest_location(zip_code)
                if location:
                    params["filter.locationId"] = location["locationId"]
                    store_zip = location.get("address", {}).get("zipCode", zip_code)
            except Exception:
                pass

        store_id = f"kroger-{location['locationId']}" if location else "kroger"
        store_name = location["name"] if location else "Kroger"

        resp = httpx.get(
            PRODUCTS_URL,
            headers={"Authorization": f"Bearer {token}"},
            params=params,
            timeout=10,
        )
        resp.raise_for_status()
        products = resp.json().get("data", [])

        results = []
        for p in products:
            items = p.get("items", [])
            if not items:
                continue
            item = items[0]
            price_info = item.get("price") or {}
            price = price_info.get("regular") or price_info.get("promo")
            if not price:
                continue

            size = item.get("size", "")
            name = p.get("description", "")
            full_name = f"{name} {size}".strip() if size and size.lower() not in name.lower() else name

            images = p.get("images", [])
            image_url = None
            for img in images:
                sizes = img.get("sizes", [])
                for s in sizes:
                    if s.get("size") == "medium":
                        image_url = s.get("url")
                        break
                if image_url:
                    break

            results.append({
                "product_id": f"kroger-{p['productId']}-{item.get('itemId', '')}",
                "product_name": full_name,
                "brand": p.get("brand", ""),
                "price": float(price),
                "unit_price": None,
                "store_id": store_id,
                "store_name": store_name,
                "store_zip": store_zip,
                "availability": "in_stock",
                "image_url": image_url,
            })
        return results
