from app.services.cache import clear_cache, set_cached, get_cached


def test_cache_basic():
    clear_cache()
    normalized = [
        {"product_id": "p1", "product_name": "Milk", "store_id": "s1", "store_name": "A", "price": 3.0},
    ]
    grouped, deals = set_cached("milk", "02139", normalized, ttl=10)
    assert "s1" in grouped
    cached = get_cached("milk", "02139")
    assert cached is not None


def test_cache_deal_detection():
    clear_cache()
    # first set price high
    set_cached("eggs", "02139", [{"product_id": "p2", "product_name": "Eggs", "store_id": "s2", "store_name": "B", "price": 4.0}], ttl=10)
    # now lower price should produce a deal
    grouped, deals = set_cached("eggs", "02139", [{"product_id": "p2", "product_name": "Eggs", "store_id": "s2", "store_name": "B", "price": 3.0}], ttl=10)
    assert "s2" in grouped
    assert "s2" in deals
