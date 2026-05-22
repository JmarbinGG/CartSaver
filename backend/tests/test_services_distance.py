from app.services.distance import haversine_miles, distance_between_zips


def test_haversine_known():
    # distance between 02139 (Cambridge) and 10001 (NYC) should be > 190 miles
    miles = haversine_miles(42.3646, -71.1034, 40.7506, -73.9970)
    assert miles > 190


def test_distance_between_zips():
    d = distance_between_zips("02139", "10001")
    assert d > 190
