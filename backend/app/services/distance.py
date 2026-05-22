import math
from pathlib import Path
import json


def haversine_miles(lat1, lon1, lat2, lon2):
    # Earth radius in miles
    R = 3958.8
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


_centroids = None


def _load_centroids():
    global _centroids
    if _centroids is None:
        p = Path(__file__).parent.parent / "data" / "zip_centroids.json"
        try:
            with open(p, "r", encoding="utf-8") as fh:
                _centroids = json.load(fh)
        except FileNotFoundError:
            _centroids = {}
    return _centroids


def zip_to_centroid(zip_code: str):
    data = _load_centroids()
    entry = data.get(str(zip_code))
    if not entry:
        raise KeyError(f"ZIP centroid not found for {zip_code}")
    return entry["lat"], entry["lon"]


def distance_between_zips(zip1: str, zip2: str) -> float:
    lat1, lon1 = zip_to_centroid(zip1)
    lat2, lon2 = zip_to_centroid(zip2)
    return haversine_miles(lat1, lon1, lat2, lon2)
