from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_search_endpoint():
    resp = client.get("/search", params={"query": "milk", "zip_code": "02139"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["query"] == "milk"
    assert isinstance(data["results"], dict)
