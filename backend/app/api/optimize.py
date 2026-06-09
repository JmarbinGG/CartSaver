from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from app.services.optimization import optimize_for_items
from app.services.normalization import normalize_listing
from app.providers.kroger_mock import KrogerMock
from app.providers.instacart_mock import InstacartMock
from app.providers.walmart_mock import WalmartMock


class ItemRequest(BaseModel):
    product_id: str
    product_name: str
    quantity: float = 1.0


class OptimizeRequest(BaseModel):
    items: List[ItemRequest]
    zip_code: str


router = APIRouter()


@router.post("/optimize")
def optimize(req: OptimizeRequest):
    kroger = KrogerMock()
    insta = InstacartMock()
    walmart = WalmartMock()

    listings_by_product = {}
    for item in req.items:
        q = item.product_name
        raw = []
        raw.extend(kroger.search(q, req.zip_code))
        raw.extend(insta.search(q, req.zip_code))
        raw.extend(walmart.search(q, req.zip_code))
        normalized = [normalize_listing(r) for r in raw]
        listings_by_product[item.product_id] = normalized

    result = optimize_for_items(listings_by_product, req.zip_code)
    return result
