from pydantic import BaseModel


class StoreListing(BaseModel):
    store_id: str
    store_name: str
    store_zip: str | None = None
    product_id: str
    product_name: str
    brand: str | None = None
    canonical_name: str | None = None
    match_key: str | None = None
    display_name: str | None = None
    price: float
    unit_price: float | None = None
    availability: str
    distance_miles: float | None = None
    eta_minutes: int | None = None
    image_url: str | None = None


class ProductGroup(BaseModel):
    match_key: str
    display_name: str
    category: str
    listings: list[StoreListing]
    best_price: float
    store_count: int
    image_url: str | None = None


class SearchResponse(BaseModel):
    query: str
    results: dict[str, list[StoreListing]]
    groups: dict[str, ProductGroup] | None = None
    deals: dict[str, list[StoreListing]] | None = None
