from pydantic import BaseModel


class ListItemCreate(BaseModel):
    product_id: str
    product_name: str
    quantity: float


class ShoppingListResponse(BaseModel):
    id: int
    name: str
    items: list[ListItemCreate]
