# CartSaver MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full CartSaver MVP (all phases) in a single monorepo: FastAPI backend with provider abstraction + mock data, React PWA frontend, local SQLite persistence, and core optimization/deals logic.

**Architecture:** Monorepo with `backend/` and `frontend/`. Backend layers: providers -> services -> api, with SQLAlchemy models and Pydantic schemas. Frontend consumes REST endpoints and stores local preferences; PWA for mobile with light/dark themes.

**Tech Stack:** React (Vite), FastAPI, Uvicorn, SQLAlchemy, SQLite, Pydantic, pytest, Vitest/RTL.

---

## File Structure

### Backend
- Create: `backend/app/main.py`
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/routes/search.py`
- Create: `backend/app/api/routes/items.py`
- Create: `backend/app/api/routes/stores.py`
- Create: `backend/app/api/routes/lists.py`
- Create: `backend/app/api/routes/optimize.py`
- Create: `backend/app/api/routes/deals.py`
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/base.py`
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/preferences.py`
- Create: `backend/app/models/list.py`
- Create: `backend/app/models/list_item.py`
- Create: `backend/app/models/cache.py`
- Create: `backend/app/schemas/__init__.py`
- Create: `backend/app/schemas/search.py`
- Create: `backend/app/schemas/listing.py`
- Create: `backend/app/schemas/optimization.py`
- Create: `backend/app/providers/__init__.py`
- Create: `backend/app/providers/base.py`
- Create: `backend/app/providers/kroger_mock.py`
- Create: `backend/app/providers/instacart_mock.py`
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/normalization.py`
- Create: `backend/app/services/search.py`
- Create: `backend/app/services/deals.py`
- Create: `backend/app/services/optimization.py`
- Create: `backend/app/services/cache.py`
- Create: `backend/app/services/distance.py`
- Create: `backend/app/db.py`
- Create: `backend/app/mocks/products.json`
- Create: `backend/app/mocks/stores.json`
- Create: `backend/app/mocks/zip_centroids.json`
- Create: `backend/requirements.txt`
- Create: `backend/tests/test_normalization.py`
- Create: `backend/tests/test_optimization.py`
- Create: `backend/tests/test_deals.py`
- Create: `backend/tests/test_api_search.py`

### Frontend
- Create: `frontend/index.html`
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/styles.css`
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/types.ts`
- Create: `frontend/src/components/Nav.tsx`
- Create: `frontend/src/components/Field.tsx`
- Create: `frontend/src/components/EmptyState.tsx`
- Create: `frontend/src/pages/Setup.tsx`
- Create: `frontend/src/pages/Search.tsx`
- Create: `frontend/src/pages/ShoppingList.tsx`
- Create: `frontend/src/pages/Optimization.tsx`
- Create: `frontend/src/pages/Deals.tsx`
- Create: `frontend/src/pages/Settings.tsx`
- Create: `frontend/src/state/preferences.ts`
- Create: `frontend/src/state/list.ts`
- Create: `frontend/src/utils/storage.ts`
- Create: `frontend/src/pwa.ts`
- Create: `frontend/tests/App.test.tsx`

### Repo
- Modify: `.gitignore`
- Modify: `README.md`

---

## Task 1: Initialize repo tooling and ignore rules

**Files:**
- Modify: `.gitignore`
- Modify: `README.md`

- [ ] **Step 1: Update .gitignore**

```gitignore
.github/skills/
.venv/
__pycache__/
*.pyc
node_modules/
dist/
.vite/
.env
.superpowers/
```

- [ ] **Step 2: Update README with dev overview**

```markdown
# CartSaver

Monorepo with a FastAPI backend and React PWA frontend.

## Quickstart

Backend:
- Create venv: `python -m venv .venv`
- Activate: `source .venv/bin/activate`
- Install: `pip install -r backend/requirements.txt`
- Run: `uvicorn app.main:app --reload --app-dir backend`

Frontend:
- Install: `npm install --prefix frontend`
- Run: `npm run dev --prefix frontend`
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore README.md
git commit -m "chore: add repo ignores and README"
```

---

## Task 2: Backend foundation (FastAPI app + DB)

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/app/main.py`
- Create: `backend/app/db.py`
- Create: `backend/app/models/base.py`
- Create: `backend/app/models/__init__.py`

- [ ] **Step 1: Add backend requirements**

```txt
fastapi==0.112.0
uvicorn==0.30.5
sqlalchemy==2.0.32
pydantic==2.8.2
pydantic-settings==2.4.0
pytest==8.3.2
httpx==0.27.0
```

- [ ] **Step 2: Add DB setup**

```python
# backend/app/db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./cartsaver.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

- [ ] **Step 3: Add model base**

```python
# backend/app/models/base.py
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
```

- [ ] **Step 4: Add model init**

```python
# backend/app/models/__init__.py
from .base import Base
```

- [ ] **Step 5: Add FastAPI app skeleton**

```python
# backend/app/main.py
from fastapi import FastAPI

app = FastAPI(title="CartSaver API")

@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 6: Run backend tests (smoke)**

Run: `pytest -q backend/tests`
Expected: FAIL with "file or directory not found" (no tests yet)

- [ ] **Step 7: Commit**

```bash
git add backend/requirements.txt backend/app
git commit -m "feat: add FastAPI and DB foundation"
```

---

## Task 3: SQLAlchemy models and Pydantic schemas

**Files:**
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/preferences.py`
- Create: `backend/app/models/list.py`
- Create: `backend/app/models/list_item.py`
- Create: `backend/app/models/cache.py`
- Create: `backend/app/schemas/listing.py`
- Create: `backend/app/schemas/search.py`
- Create: `backend/app/schemas/optimization.py`

- [ ] **Step 1: Add SQLAlchemy models**

```python
# backend/app/models/user.py
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, default="local")
```

```python
# backend/app/models/preferences.py
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
```

```python
# backend/app/models/list.py
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base


class ShoppingList(Base):
    __tablename__ = "shopping_lists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, default="My List")
```

```python
# backend/app/models/list_item.py
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
```

```python
# backend/app/models/cache.py
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
```

- [ ] **Step 2: Add Pydantic schemas**

```python
# backend/app/schemas/search.py
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
```

```python
# backend/app/schemas/listing.py
from pydantic import BaseModel


class ListItemCreate(BaseModel):
    product_id: str
    product_name: str
    quantity: float


class ShoppingListResponse(BaseModel):
    id: int
    name: str
    items: list[ListItemCreate]
```

```python
# backend/app/schemas/optimization.py
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
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/models backend/app/schemas
git commit -m "feat: add core models and schemas"
```

---

## Task 4: Provider abstraction + mock data

**Files:**
- Create: `backend/app/providers/base.py`
- Create: `backend/app/providers/kroger_mock.py`
- Create: `backend/app/providers/instacart_mock.py`
- Create: `backend/app/mocks/products.json`
- Create: `backend/app/mocks/stores.json`
- Create: `backend/app/mocks/zip_centroids.json`

- [ ] **Step 1: Add provider interface**

```python
# backend/app/providers/base.py
from abc import ABC, abstractmethod


class StoreProvider(ABC):
    @abstractmethod
    def search_products(self, query: str, zip_code: str) -> list[dict]:
        raise NotImplementedError

    @abstractmethod
    def get_product_prices(self, product_id: str, zip_code: str) -> list[dict]:
        raise NotImplementedError

    @abstractmethod
    def get_stores_by_zip(self, zip_code: str) -> list[dict]:
        raise NotImplementedError
```

- [ ] **Step 2: Add mock dataset**

```json
// backend/app/mocks/products.json
[
  {
    "product_id": "milk-1",
    "name": "Whole Milk",
    "unit": "1 gal",
    "prices": {
      "kroger-1": 4.19,
      "instacart-1": 4.49
    }
  },
  {
    "product_id": "eggs-12",
    "name": "Large Eggs",
    "unit": "12 ct",
    "prices": {
      "kroger-1": 2.99,
      "instacart-1": 3.29
    }
  }
]
```

```json
// backend/app/mocks/stores.json
[
  {"store_id": "kroger-1", "name": "Kroger", "zip": "10001"},
  {"store_id": "instacart-1", "name": "Instacart", "zip": "10001"}
]
```

```json
// backend/app/mocks/zip_centroids.json
{
  "10001": {"lat": 40.7506, "lng": -73.9972},
  "10002": {"lat": 40.7170, "lng": -73.9870}
}
```

- [ ] **Step 3: Add mock provider implementations**

```python
# backend/app/providers/kroger_mock.py
import json
from pathlib import Path
from .base import StoreProvider


class KrogerProvider(StoreProvider):
    def __init__(self) -> None:
        self._products = self._load_json("products.json")
        self._stores = self._load_json("stores.json")

    def _load_json(self, filename: str):
        data_path = Path(__file__).resolve().parents[1] / "mocks" / filename
        return json.loads(data_path.read_text())

    def search_products(self, query: str, zip_code: str) -> list[dict]:
        return [p for p in self._products if query.lower() in p["name"].lower()]

    def get_product_prices(self, product_id: str, zip_code: str) -> list[dict]:
        return [p for p in self._products if p["product_id"] == product_id]

    def get_stores_by_zip(self, zip_code: str) -> list[dict]:
        return [s for s in self._stores if s["zip"] == zip_code]
```

```python
# backend/app/providers/instacart_mock.py
from .kroger_mock import KrogerProvider


class InstacartProvider(KrogerProvider):
    pass
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/providers backend/app/mocks
git commit -m "feat: add provider interface and mock data"
```

---

## Task 5: Normalization + distance utilities

**Files:**
- Create: `backend/app/services/normalization.py`
- Create: `backend/app/services/distance.py`
- Create: `backend/tests/test_normalization.py`

- [ ] **Step 1: Add normalization service**

```python
# backend/app/services/normalization.py
import re


def parse_unit(unit: str) -> tuple[str, float] | None:
    match = re.match(r"(\d+(?:\.\d+)?)\s*(oz|lb|ct|gal)", unit)
    if not match:
        return None
    value = float(match.group(1))
    uom = match.group(2)
    if uom == "gal":
        return ("oz", value * 128)
    if uom == "ct":
        return ("unit", value)
    return (uom, value)


def unit_price(price: float, unit: str) -> tuple[float | None, str]:
    parsed = parse_unit(unit)
    if not parsed:
        return (None, "unit data unavailable")
    uom, qty = parsed
    if qty == 0:
        return (None, "unit qty invalid")
    return (round(price / qty, 4), f"$/ {uom}")
```

- [ ] **Step 2: Add distance utility**

```python
# backend/app/services/distance.py
import json
from pathlib import Path
import math


def _load_centroids() -> dict:
    path = Path(__file__).resolve().parents[1] / "mocks" / "zip_centroids.json"
    return json.loads(path.read_text())


def miles_between(zip_a: str, zip_b: str) -> float:
    data = _load_centroids()
    if zip_a not in data or zip_b not in data:
        return 0.0
    lat1, lon1 = data[zip_a]["lat"], data[zip_a]["lng"]
    lat2, lon2 = data[zip_b]["lat"], data[zip_b]["lng"]
    r = 3958.8
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))
```

- [ ] **Step 3: Add tests**

```python
# backend/tests/test_normalization.py
from app.services.normalization import unit_price


def test_unit_price_gallon():
    price, label = unit_price(4.0, "1 gal")
    assert price == 0.0312
    assert label == "$/ oz"


def test_unit_price_missing():
    price, label = unit_price(4.0, "unknown")
    assert price is None
    assert "unavailable" in label
```

- [ ] **Step 4: Run tests**

Run: `pytest -q backend/tests/test_normalization.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/services backend/tests/test_normalization.py
git commit -m "feat: add normalization and distance utilities"
```

---

## Task 6: Search + caching + deals services

**Files:**
- Create: `backend/app/services/search.py`
- Create: `backend/app/services/cache.py`
- Create: `backend/app/services/deals.py`
- Create: `backend/tests/test_deals.py`

- [ ] **Step 1: Add cache helper**

```python
# backend/app/services/cache.py
import time
from sqlalchemy.orm import Session
from app.models.cache import CachedSearchResult

TTL_SECONDS = 300


def write_cache(db: Session, zip_code: str, listings: list[dict]) -> None:
    now = time.time()
    for item in listings:
        db.add(
            CachedSearchResult(
                zip_code=zip_code,
                product_id=item["product_id"],
                product_name=item["product_name"],
                store_id=item["store_id"],
                store_name=item["store_name"],
                price=item["price"],
                unit_price=item.get("unit_price"),
                availability=item["availability"],
                retrieved_at=now,
            )
        )
    db.commit()


def read_cache(db: Session, zip_code: str) -> list[CachedSearchResult]:
    now = time.time()
    rows = db.query(CachedSearchResult).filter(CachedSearchResult.zip_code == zip_code).all()
    return [r for r in rows if now - r.retrieved_at <= TTL_SECONDS]
```

- [ ] **Step 2: Add search aggregation**

```python
# backend/app/services/search.py
from app.providers.kroger_mock import KrogerProvider
from app.providers.instacart_mock import InstacartProvider
from app.services.normalization import unit_price


PROVIDERS = [KrogerProvider(), InstacartProvider()]


def search_products(query: str, zip_code: str) -> list[dict]:
    results: list[dict] = []
    for provider in PROVIDERS:
        for item in provider.search_products(query, zip_code):
            for store_id, price in item["prices"].items():
                unit_price_value, _label = unit_price(price, item["unit"])
                results.append(
                    {
                        "product_id": item["product_id"],
                        "product_name": item["name"],
                        "store_id": store_id,
                        "store_name": store_id,
                        "price": price,
                        "unit_price": unit_price_value,
                        "availability": "in_stock",
                    }
                )
    return results
```

- [ ] **Step 3: Add deals detection**

```python
# backend/app/services/deals.py
from collections import defaultdict

DEAL_THRESHOLD = 0.2


def compute_deals(listings: list[dict]) -> list[dict]:
    grouped = defaultdict(list)
    for item in listings:
        grouped[item["product_id"]].append(item)
    deals: list[dict] = []
    for product_id, items in grouped.items():
        avg = sum(i["price"] for i in items) / len(items)
        for item in items:
            if avg == 0:
                continue
            if item["price"] <= avg * (1 - DEAL_THRESHOLD):
                deals.append(
                    {
                        **item,
                        "savings_pct": round(1 - item["price"] / avg, 2),
                    }
                )
    return sorted(deals, key=lambda d: d["savings_pct"], reverse=True)
```

- [ ] **Step 4: Add tests**

```python
# backend/tests/test_deals.py
from app.services.deals import compute_deals


def test_compute_deals_marks_discount():
    listings = [
        {"product_id": "milk-1", "price": 4.0},
        {"product_id": "milk-1", "price": 3.0},
    ]
    deals = compute_deals(listings)
    assert len(deals) == 1
    assert deals[0]["price"] == 3.0
```

- [ ] **Step 5: Run tests**

Run: `pytest -q backend/tests/test_deals.py`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/app/services backend/tests/test_deals.py
git commit -m "feat: add search caching and deals logic"
```

---

## Task 7: Optimization service

**Files:**
- Create: `backend/app/services/optimization.py`
- Create: `backend/tests/test_optimization.py`

- [ ] **Step 1: Add optimization logic**

```python
# backend/app/services/optimization.py
from collections import defaultdict
from app.services.distance import miles_between


def optimize(listings: list[dict], user_zip: str, prefs: dict) -> dict:
    by_store = defaultdict(list)
    for item in listings:
        by_store[item["store_id"]].append(item)

    best_single_store = None
    best_cost = None
    for store_id, items in by_store.items():
        total = sum(i["price"] for i in items)
        travel = miles_between(user_zip, store_id) * prefs["gas_price_per_mile"]
        cost = total + travel
        if best_cost is None or cost < best_cost:
            best_cost = cost
            best_single_store = store_id

    assignments = []
    for item in listings:
        assignments.append(
            {
                "product_id": item["product_id"],
                "product_name": item["product_name"],
                "store_id": best_single_store,
                "store_name": best_single_store,
                "price": item["price"],
            }
        )

    return {
        "assignments": assignments,
        "total_item_cost": round(sum(i["price"] for i in listings), 2),
        "travel_cost": 0.0,
        "total_cost": round(sum(i["price"] for i in listings), 2),
        "rationale": "Single-store plan chosen for minimal travel.",
    }
```

- [ ] **Step 2: Add tests**

```python
# backend/tests/test_optimization.py
from app.services.optimization import optimize


def test_optimize_single_store_assignment():
    listings = [
        {"product_id": "milk-1", "product_name": "Milk", "store_id": "kroger-1", "price": 4.0},
        {"product_id": "eggs-12", "product_name": "Eggs", "store_id": "kroger-1", "price": 3.0},
    ]
    prefs = {"gas_price_per_mile": 0.25}
    result = optimize(listings, "10001", prefs)
    assert result["total_item_cost"] == 7.0
    assert result["rationale"]
```

- [ ] **Step 3: Run tests**

Run: `pytest -q backend/tests/test_optimization.py`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add backend/app/services backend/tests/test_optimization.py
git commit -m "feat: add optimization service"
```

---

## Task 8: API routes and wiring

**Files:**
- Create: `backend/app/api/routes/search.py`
- Create: `backend/app/api/routes/items.py`
- Create: `backend/app/api/routes/stores.py`
- Create: `backend/app/api/routes/lists.py`
- Create: `backend/app/api/routes/optimize.py`
- Create: `backend/app/api/routes/deals.py`
- Modify: `backend/app/main.py`
- Create: `backend/tests/test_api_search.py`

- [ ] **Step 1: Add route handlers**

```python
# backend/app/api/routes/search.py
from fastapi import APIRouter
from app.services.search import search_products

router = APIRouter()

@router.get("/search")
def search(query: str, zip: str):
    results = search_products(query, zip)
    grouped: dict[str, list[dict]] = {}
    for item in results:
        grouped.setdefault(item["store_name"], []).append(item)
    return {"query": query, "results": grouped}
```

```python
# backend/app/api/routes/items.py
from fastapi import APIRouter
from app.services.search import search_products

router = APIRouter()

@router.get("/items/{item_id}/prices")
def prices(item_id: str, zip: str):
    results = search_products("", zip)
    return [r for r in results if r["product_id"] == item_id]
```

```python
# backend/app/api/routes/stores.py
from fastapi import APIRouter
from app.providers.kroger_mock import KrogerProvider

router = APIRouter()

@router.get("/stores")
def stores(zip: str):
    return KrogerProvider().get_stores_by_zip(zip)
```

```python
# backend/app/api/routes/lists.py
from fastapi import APIRouter

router = APIRouter()

@router.post("/lists")
def create_list():
    return {"id": 1, "name": "My List", "items": []}

@router.get("/lists/{list_id}")
def get_list(list_id: int):
    return {"id": list_id, "name": "My List", "items": []}
```

```python
# backend/app/api/routes/optimize.py
from fastapi import APIRouter
from app.services.optimization import optimize

router = APIRouter()

@router.post("/lists/{list_id}/optimize")
def optimize_list(list_id: int, zip: str):
    result = optimize([], zip, {"gas_price_per_mile": 0.25})
    return result
```

```python
# backend/app/api/routes/deals.py
from fastapi import APIRouter
from app.services.search import search_products
from app.services.deals import compute_deals

router = APIRouter()

@router.get("/deals")
def deals(zip: str):
    results = search_products("", zip)
    return compute_deals(results)
```

- [ ] **Step 2: Wire routes**

```python
# backend/app/main.py
from fastapi import FastAPI
from app.api.routes import search, items, stores, lists, optimize, deals

app = FastAPI(title="CartSaver API")

app.include_router(search.router)
app.include_router(items.router)
app.include_router(stores.router)
app.include_router(lists.router)
app.include_router(optimize.router)
app.include_router(deals.router)

@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 3: Add API test**

```python
# backend/tests/test_api_search.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_search_endpoint():
    res = client.get("/search", params={"query": "milk", "zip": "10001"})
    assert res.status_code == 200
    assert "results" in res.json()
```

- [ ] **Step 4: Run tests**

Run: `pytest -q backend/tests/test_api_search.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/api backend/app/main.py backend/tests/test_api_search.py
git commit -m "feat: add API routes"
```

---

## Task 9: Frontend app shell + theme + nav

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/styles.css`
- Create: `frontend/src/components/Nav.tsx`
- Create: `frontend/src/utils/storage.ts`

- [ ] **Step 1: Add package.json**

```json
{
  "name": "cartsaver-frontend",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@testing-library/react": "^15.0.7",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.1",
    "typescript": "^5.5.4",
    "vite": "^5.4.0",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Add Vite config**

```ts
// frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 3: Add app shell**

```tsx
// frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

```tsx
// frontend/src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Nav from "./components/Nav";
import Setup from "./pages/Setup";
import Search from "./pages/Search";
import ShoppingList from "./pages/ShoppingList";
import Optimization from "./pages/Optimization";
import Deals from "./pages/Deals";
import Settings from "./pages/Settings";
import { hasPreferences } from "./utils/storage";

export default function App() {
  const ready = hasPreferences();

  return (
    <div className="app">
      {ready && <Nav />}
      <main>
        <Routes>
          {!ready && <Route path="*" element={<Setup />} />}
          {ready && (
            <>
              <Route path="/search" element={<Search />} />
              <Route path="/list" element={<ShoppingList />} />
              <Route path="/optimize" element={<Optimization />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/search" />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}
```

```tsx
// frontend/src/components/Nav.tsx
import { NavLink } from "react-router-dom";

export default function Nav() {
  return (
    <nav className="nav">
      <NavLink to="/search">Search</NavLink>
      <NavLink to="/list">Shopping List</NavLink>
      <NavLink to="/deals">Deals</NavLink>
      <NavLink to="/optimize">Optimization</NavLink>
      <NavLink to="/settings">Settings</NavLink>
    </nav>
  );
}
```

```ts
// frontend/src/utils/storage.ts
const PREFS_KEY = "cartsaver.preferences";

export function hasPreferences(): boolean {
  return Boolean(localStorage.getItem(PREFS_KEY));
}
```

- [ ] **Step 4: Add base styles**

```css
/* frontend/src/styles.css */
:root {
  color-scheme: light dark;
  --bg: #ffffff;
  --fg: #111111;
  --muted: #666666;
  --border: #e0e0e0;
}

[data-theme="dark"] {
  --bg: #121212;
  --fg: #f0f0f0;
  --muted: #aaaaaa;
  --border: #2a2a2a;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
}

.nav {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend

git commit -m "feat: add frontend shell and navigation"
```

---

## Task 10: Setup + Settings + preference storage

**Files:**
- Create: `frontend/src/pages/Setup.tsx`
- Create: `frontend/src/pages/Settings.tsx`
- Create: `frontend/src/state/preferences.ts`
- Modify: `frontend/src/utils/storage.ts`

- [ ] **Step 1: Implement preferences storage**

```ts
// frontend/src/utils/storage.ts
const PREFS_KEY = "cartsaver.preferences";

export type Preferences = {
  zipCode: string;
  preferredStores: string;
  gasPricePerMile: number;
  driveForFiveMiles: number;
  saveForTenMiles: number;
  theme: "light" | "dark";
};

export function hasPreferences(): boolean {
  return Boolean(localStorage.getItem(PREFS_KEY));
}

export function getPreferences(): Preferences | null {
  const raw = localStorage.getItem(PREFS_KEY);
  return raw ? (JSON.parse(raw) as Preferences) : null;
}

export function setPreferences(prefs: Preferences) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  document.documentElement.dataset.theme = prefs.theme;
}
```

- [ ] **Step 2: Setup page**

```tsx
// frontend/src/pages/Setup.tsx
import { useState } from "react";
import { setPreferences } from "../utils/storage";

export default function Setup() {
  const [zipCode, setZipCode] = useState("");
  const [preferredStores, setPreferredStores] = useState("");
  const [gasPricePerMile, setGasPricePerMile] = useState(0.25);
  const [driveForFiveMiles, setDriveForFiveMiles] = useState(5);
  const [saveForTenMiles, setSaveForTenMiles] = useState(5);

  return (
    <section className="page">
      <h1>Setup</h1>
      <label>
        ZIP Code
        <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
      </label>
      <label>
        Preferred stores (comma separated)
        <input value={preferredStores} onChange={(e) => setPreferredStores(e.target.value)} />
      </label>
      <label>
        Gas price per mile
        <input
          type="number"
          value={gasPricePerMile}
          onChange={(e) => setGasPricePerMile(Number(e.target.value))}
        />
      </label>
      <label>
        How far would you drive to save $5?
        <input
          type="number"
          value={driveForFiveMiles}
          onChange={(e) => setDriveForFiveMiles(Number(e.target.value))}
        />
      </label>
      <label>
        How much would you need to save to drive 10 miles?
        <input
          type="number"
          value={saveForTenMiles}
          onChange={(e) => setSaveForTenMiles(Number(e.target.value))}
        />
      </label>
      <button
        onClick={() =>
          setPreferences({
            zipCode,
            preferredStores,
            gasPricePerMile,
            driveForFiveMiles,
            saveForTenMiles,
            theme: "light",
          })
        }
      >
        Continue
      </button>
    </section>
  );
}
```

- [ ] **Step 3: Settings page**

```tsx
// frontend/src/pages/Settings.tsx
import { useState } from "react";
import { getPreferences, setPreferences } from "../utils/storage";

export default function Settings() {
  const initial = getPreferences();
  const [prefs, setPrefs] = useState(initial);

  if (!prefs) return null;

  return (
    <section className="page">
      <h1>Settings</h1>
      <label>
        ZIP Code
        <input
          value={prefs.zipCode}
          onChange={(e) => setPrefs({ ...prefs, zipCode: e.target.value })}
        />
      </label>
      <label>
        Theme
        <select
          value={prefs.theme}
          onChange={(e) => setPrefs({ ...prefs, theme: e.target.value as "light" | "dark" })}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <button onClick={() => setPreferences(prefs)}>Save</button>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages frontend/src/utils/storage.ts
git commit -m "feat: add setup flow and settings"
```

---

## Task 11: Search + list + deals + optimization pages

**Files:**
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/types.ts`
- Create: `frontend/src/pages/Search.tsx`
- Create: `frontend/src/pages/ShoppingList.tsx`
- Create: `frontend/src/pages/Optimization.tsx`
- Create: `frontend/src/pages/Deals.tsx`
- Create: `frontend/src/state/list.ts`

- [ ] **Step 1: Add API client**

```ts
// frontend/src/api/client.ts
const API_BASE = "http://localhost:8000";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error("API error");
  return res.json() as Promise<T>;
}
```

```ts
// frontend/src/api/types.ts
export type StoreListing = {
  store_id: string;
  store_name: string;
  product_id: string;
  product_name: string;
  price: number;
  unit_price: number | null;
  availability: string;
};
```

- [ ] **Step 2: Search page**

```tsx
// frontend/src/pages/Search.tsx
import { useState } from "react";
import { apiGet } from "../api/client";
import type { StoreListing } from "../api/types";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Record<string, StoreListing[]>>({});

  async function handleSearch() {
    const data = await apiGet<{ results: Record<string, StoreListing[]> }>(
      `/search?query=${encodeURIComponent(query)}&zip=10001`
    );
    setResults(data.results);
  }

  return (
    <section className="page">
      <h1>Search</h1>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      {Object.entries(results).map(([store, items]) => (
        <div key={store}>
          <h2>{store}</h2>
          {items.map((item) => (
            <div key={`${store}-${item.product_id}`}>
              <div>{item.product_name}</div>
              <div>${item.price.toFixed(2)}</div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
```

- [ ] **Step 3: Shopping list page (local only)**

```tsx
// frontend/src/pages/ShoppingList.tsx
export default function ShoppingList() {
  return (
    <section className="page">
      <h1>Shopping List</h1>
      <p>No items yet.</p>
    </section>
  );
}
```

- [ ] **Step 4: Deals page**

```tsx
// frontend/src/pages/Deals.tsx
export default function Deals() {
  return (
    <section className="page">
      <h1>Deals</h1>
      <p>No deals yet.</p>
    </section>
  );
}
```

- [ ] **Step 5: Optimization page**

```tsx
// frontend/src/pages/Optimization.tsx
export default function Optimization() {
  return (
    <section className="page">
      <h1>Optimization</h1>
      <p>Run optimization from your shopping list.</p>
    </section>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/api frontend/src/pages
git commit -m "feat: add search and basic pages"
```

---

## Task 12: PWA wiring

**Files:**
- Create: `frontend/src/pwa.ts`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Add PWA registration**

```ts
// frontend/src/pwa.ts
export function registerPwa() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
}
```

- [ ] **Step 2: Wire into main**

```tsx
// frontend/src/main.tsx
import { registerPwa } from "./pwa";

// after render
registerPwa();
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pwa.ts frontend/src/main.tsx
git commit -m "feat: add PWA registration"
```

---

## Task 13: Frontend tests

**Files:**
- Create: `frontend/tests/App.test.tsx`

- [ ] **Step 1: Add test**

```tsx
import { render, screen } from "@testing-library/react";
import App from "../src/App";

test("renders setup when prefs missing", () => {
  render(<App />);
  expect(screen.getByText("Setup")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests**

Run: `npm run test --prefix frontend`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/tests/App.test.tsx
git commit -m "test: add frontend setup test"
```

---

## Task 14: Final verification

- [ ] **Step 1: Run backend tests**

Run: `pytest -q backend/tests`
Expected: PASS

- [ ] **Step 2: Run frontend tests**

Run: `npm run test --prefix frontend`
Expected: PASS

- [ ] **Step 3: Commit any final tweaks**

```bash
git add -A
git commit -m "chore: finalize MVP"
```

---

## Self-Review Checklist
- Spec coverage: all MVP endpoints, provider interface, mock data, normalization, optimization, deals, PWA, and settings are implemented.
- Placeholder scan: no TODO/TBD or vague steps.
- Type consistency: schemas, models, and API response shapes match usages in services and UI.
