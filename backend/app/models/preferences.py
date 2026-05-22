from sqlalchemy import Integer, String, Float
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    zip_code: Mapped[str] = mapped_column(String)
    preferred_stores: Mapped[str] = mapped_column(String, default="")
    gas_price_per_mile: Mapped[float] = mapped_column(Float, default=0.25)
    drive_for_5_savings_miles: Mapped[float] = mapped_column(Float, default=5.0)
    save_for_10_miles: Mapped[float] = mapped_column(Float, default=5.0)
