from pydantic import BaseModel


class StoreListing(BaseModel):
    store_id: str
    store_name: str
    store_zip: str | None = None
    product_id: str
    product_name: str
    price: float
    unit_price: float | None
    availability: str
    distance_miles: float | None = None
    eta_minutes: int | None = None


class SearchResponse(BaseModel):
    query: str
    results: dict[str, list[StoreListing]]
    deals: dict[str, list[StoreListing]] | None = None
