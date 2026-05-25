from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_search_endpoint():
    resp = client.get("/search", params={"query": "milk", "zip_code": "02139"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["query"] == "milk"
    assert isinstance(data["results"], dict)
    first_store = next(iter(data["results"].values()), [])
    if first_store:
        listing = first_store[0]
        assert "distance_miles" in listing
        assert "eta_minutes" in listing
        assert "store_zip" in listing
        assert listing["distance_miles"] is not None
        assert listing["eta_minutes"] is not None

    # second call should hit cache without errors
    resp_cached = client.get("/search", params={"query": "milk", "zip_code": "02139"})
    assert resp_cached.status_code == 200
    data_cached = resp_cached.json()
    first_store_cached = next(iter(data_cached["results"].values()), [])
    if first_store_cached:
        listing_cached = first_store_cached[0]
        assert "distance_miles" in listing_cached
        assert "eta_minutes" in listing_cached
        assert "store_zip" in listing_cached
        assert listing_cached["distance_miles"] is not None
        assert listing_cached["eta_minutes"] is not None
