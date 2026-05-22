from sqlalchemy import Integer, String, Float
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base


class CachedSearchResult(Base):
    __tablename__ = "cached_search_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    zip_code: Mapped[str] = mapped_column(String)
    product_id: Mapped[str] = mapped_column(String)
    product_name: Mapped[str] = mapped_column(String)
    store_id: Mapped[str] = mapped_column(String)
    store_name: Mapped[str] = mapped_column(String)
    price: Mapped[float] = mapped_column(Float)
    unit_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    availability: Mapped[str] = mapped_column(String)
    retrieved_at: Mapped[float] = mapped_column(Float)
