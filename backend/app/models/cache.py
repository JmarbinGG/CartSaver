from sqlalchemy import Integer, String, Float
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base


class CachedSearchResult(Base):
    __tablename__ = "cached_search_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    query: Mapped[str] = mapped_column(String, default="")
    query_zip: Mapped[str] = mapped_column("zip_code", String, default="")
    store_zip: Mapped[str | None] = mapped_column(String, nullable=True)
    product_id: Mapped[str] = mapped_column(String)
    product_name: Mapped[str] = mapped_column(String)
    store_id: Mapped[str] = mapped_column(String)
    store_name: Mapped[str] = mapped_column(String)
    price: Mapped[float] = mapped_column(Float)
    unit_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    availability: Mapped[str] = mapped_column(String)
    distance_miles: Mapped[float | None] = mapped_column(Float, nullable=True)
    eta_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    retrieved_at: Mapped[float] = mapped_column(Float)
