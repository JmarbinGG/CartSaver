from pydantic import BaseModel


class OptimizationAssignment(BaseModel):
    product_id: str
    product_name: str
    store_id: str
    store_name: str
    price: float


class OptimizationResponse(BaseModel):
    assignments: list[OptimizationAssignment]
    total_item_cost: float
    travel_cost: float
    total_cost: float
    rationale: str
