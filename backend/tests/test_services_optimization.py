from app.services.optimization import optimize_for_items


def test_optimize_simple():
    listings_by_product = {
        "p1": [
            {"product_id": "p1", "product_name": "Milk", "store_id": "s1", "store_name": "A", "price": 3.0, "store_zip": "02139"},
            {"product_id": "p1", "product_name": "Milk", "store_id": "s2", "store_name": "B", "price": 3.5, "store_zip": "10001"},
        ],
        "p2": [
            {"product_id": "p2", "product_name": "Eggs", "store_id": "s1", "store_name": "A", "price": 2.5, "store_zip": "02139"}
        ]
    }

    res = optimize_for_items(listings_by_product, origin_zip="02139", gas_price_per_mile=0.1)
    assert "assignments" in res
    assert res["total_item_cost"] == 5.5
    assert res["travel_cost"] >= 0
    assert res["total_cost"] == res["total_item_cost"] + res["travel_cost"]
