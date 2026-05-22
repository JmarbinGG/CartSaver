from pydantic import BaseModel


class StoreListing(BaseModel):
    store_id: str
    store_name: str
    product_id: str
    product_name: str
    price: float
    unit_price: float | None
    availability: str


class SearchResponse(BaseModel):
    query: str
    results: dict[str, list[StoreListing]]
    deals: dict[str, list[StoreListing]] | None = None
