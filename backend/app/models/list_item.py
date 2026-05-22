from sqlalchemy import Integer, Float, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base


class ShoppingListItem(Base):
    __tablename__ = "shopping_list_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    list_id: Mapped[int] = mapped_column(ForeignKey("shopping_lists.id"))
    product_id: Mapped[str] = mapped_column(String)
    product_name: Mapped[str] = mapped_column(String)
    quantity: Mapped[float] = mapped_column(Float, default=1.0)
