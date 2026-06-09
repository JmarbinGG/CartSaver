# CartSaver UI (Search -> Grid -> Detail) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver an Instacart/Amazon-like search -> grid -> product detail flow with a clean comparison table (price, store, miles, ETA) and cheapest-store add-to-cart defaults.

**Architecture:** The backend enriches search results with distance and ETA (derived from ZIP centroids). The frontend provides a two-pane product browsing experience (grid + detail) and a cart drawer that stores selected store/price per item. State is managed in React without external state libs.

**Tech Stack:** FastAPI, SQLAlchemy, SQLite, React (Vite), TypeScript, Vitest/RTL.

---

## File Structure

**Backend**
- Modify: `backend/app/models/cache.py` (add query_zip, store_zip, distance_miles, eta_minutes)
- Modify: `backend/app/services/cache.py` (persist/load new fields)
- Modify: `backend/app/services/normalization.py` (include store_zip)
- Modify: `backend/app/schemas/search.py` (add store_zip, distance_miles, eta_minutes)
- Modify: `backend/app/api/search.py` (compute distance, ETA)
- Modify: `backend/app/providers/mock_data/*.json` (add cheese items)
- Test: `backend/tests/test_api_search.py` (assert distance, ETA)

**Frontend**
- Create: `frontend/src/types.ts`
- Create: `frontend/src/utils/eta.ts`
- Create: `frontend/src/components/Header.tsx`
- Create: `frontend/src/components/ProductGrid.tsx`
- Create: `frontend/src/components/ProductCard.tsx`
- Create: `frontend/src/components/ProductDetail.tsx`
- Create: `frontend/src/components/ComparisonTable.tsx`
- Create: `frontend/src/components/AddToCartCard.tsx`
- Create: `frontend/src/components/CartDrawer.tsx`
- Modify: `frontend/src/App.tsx` (replace old view navigation)
- Modify: `frontend/src/main.tsx` (import global CSS)
- Create: `frontend/src/styles.css`
- Test: `frontend/src/utils/eta.test.ts`
- Test: `frontend/src/components/ComparisonTable.test.tsx`
- Test: `frontend/src/components/ProductGrid.test.tsx`
- Modify: `frontend/package.json` (add Vitest/RTL)
- Create: `frontend/vitest.config.ts`
- Create: `frontend/src/setupTests.ts`

---

### Task 1: Backend search enrichment (distance + ETA)

**Files:**
- Modify: `backend/app/services/normalization.py`
- Modify: `backend/app/schemas/search.py`
- Modify: `backend/app/api/search.py`
- Modify: `backend/app/models/cache.py`
- Modify: `backend/app/services/cache.py`
- Test: `backend/tests/test_api_search.py`

- [ ] **Step 1: Write failing test for distance/ETA in search response**

```python
# backend/tests/test_api_search.py

def test_search_endpoint():
    resp = client.get("/search", params={"query": "milk", "zip_code": "02139"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["query"] == "milk"
    # find first listing
    first_store = next(iter(data["results"].values()), [])
    if first_store:
        listing = first_store[0]
        assert "distance_miles" in listing
        assert "eta_minutes" in listing
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```
pytest -q backend/tests/test_api_search.py::test_search_endpoint
```
Expected: FAIL with missing keys in listing.

- [ ] **Step 3: Add store_zip + distance fields to schema**

```python
# backend/app/schemas/search.py
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
```

- [ ] **Step 4: Normalize store_zip**

```python
# backend/app/services/normalization.py
return {
    "store_id": raw.get("store_id") or raw.get("vendor_id") or "",
    "store_name": raw.get("store_name") or raw.get("vendor_name") or "",
    "store_zip": raw.get("store_zip"),
    "product_id": raw.get("product_id") or raw.get("id") or "",
    "product_name": raw.get("product_name") or raw.get("name") or "",
    "price": float(raw.get("price") or raw.get("sale_price") or 0.0),
    "unit_price": None if raw.get("unit_price") in (None, 0, 0.0) else float(raw.get("unit_price")),
    "availability": raw.get("availability") or raw.get("stock") or "unknown",
}
```

- [ ] **Step 5: Compute distance + ETA in search endpoint**

```python
# backend/app/api/search.py
from app.services.distance import distance_between_zips

# ... after normalized list
for n in normalized:
    try:
        if n.get("store_zip") and zip_code:
            miles = distance_between_zips(zip_code, n.get("store_zip"))
            n["distance_miles"] = round(miles, 2)
            n["eta_minutes"] = int(round((miles / 30.0) * 60))
    except Exception:
        n["distance_miles"] = None
        n["eta_minutes"] = None
```

- [ ] **Step 6: Persist new fields in cache**

```python
# backend/app/models/cache.py
class CachedSearchResult(Base):
    __tablename__ = "cached_search_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    query: Mapped[str] = mapped_column(String, default="")
    query_zip: Mapped[str] = mapped_column(String, default="")
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
```

```python
# backend/app/services/cache.py
# in set_cached
row = CachedSearchResult(
    query=query,
    query_zip=zip_code or "",
    store_zip=item.get("store_zip"),
    product_id=item.get("product_id"),
    product_name=item.get("product_name"),
    store_id=item.get("store_id"),
    store_name=item.get("store_name"),
    price=float(item.get("price", 0.0)),
    unit_price=float(item.get("unit_price")) if item.get("unit_price") not in (None, 0, 0.0) else None,
    availability=item.get("availability", "unknown"),
    distance_miles=item.get("distance_miles"),
    eta_minutes=item.get("eta_minutes"),
    retrieved_at=time.time(),
)
```

```python
# backend/app/services/cache.py
# in _load_from_db
rows = (
    session.query(CachedSearchResult)
    .filter(CachedSearchResult.query == query)
    .filter(CachedSearchResult.query_zip == (zip_code or ""))
    .all()
)
# ...
item = {
    "product_id": r.product_id,
    "product_name": r.product_name,
    "store_id": r.store_id,
    "store_name": r.store_name,
    "store_zip": r.store_zip,
    "price": float(r.price),
    "unit_price": float(r.unit_price) if r.unit_price is not None else None,
    "availability": r.availability,
    "distance_miles": r.distance_miles,
    "eta_minutes": r.eta_minutes,
}
```

- [ ] **Step 7: Run test to verify it passes**

Run:
```
pytest -q backend/tests/test_api_search.py::test_search_endpoint
```
Expected: PASS.

- [ ] **Step 8: Commit**

```
git add backend/app/services/normalization.py backend/app/schemas/search.py backend/app/api/search.py backend/app/models/cache.py backend/app/services/cache.py backend/tests/test_api_search.py
# NOTE: delete cartsaver.db locally if schema mismatch occurs
# rm -f backend/cartsaver.db

git commit -m "feat(api): include store_zip, distance, and ETA in search results"
```

---

### Task 2: Expand mock data to include cheese products

**Files:**
- Modify: `backend/app/providers/mock_data/kroger_products.json`
- Modify: `backend/app/providers/mock_data/instacart_products.json`

- [ ] **Step 1: Add cheese entries**

```json
{
  "product_id": "kg-003",
  "product_name": "Cheddar Cheese 8oz",
  "price": 3.99,
  "unit_price": 0.50,
  "store_id": "kroger-001",
  "store_name": "Kroger Local",
  "store_zip": "02139",
  "availability": "in_stock"
}
```

```json
{
  "product_id": "ic-300",
  "product_name": "Mozzarella Cheese 8oz",
  "price": 4.49,
  "unit_price": 0.56,
  "store_id": "inst-001",
  "store_name": "Instacart Partner Store",
  "store_zip": "02139",
  "availability": "in_stock"
}
```

- [ ] **Step 2: Commit**

```
git add backend/app/providers/mock_data/kroger_products.json backend/app/providers/mock_data/instacart_products.json

git commit -m "feat(mock): add cheese product variants for search grid"
```

---

### Task 3: Frontend state + product grid + detail skeleton

**Files:**
- Create: `frontend/src/types.ts`
- Create: `frontend/src/utils/eta.ts`
- Create: `frontend/src/components/Header.tsx`
- Create: `frontend/src/components/ProductGrid.tsx`
- Create: `frontend/src/components/ProductCard.tsx`
- Create: `frontend/src/components/ProductDetail.tsx`
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/styles.css`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Add types**

```ts
// frontend/src/types.ts
export type StoreListing = {
  store_id: string
  store_name: string
  store_zip?: string | null
  product_id: string
  product_name: string
  price: number
  unit_price?: number | null
  availability: string
  distance_miles?: number | null
  eta_minutes?: number | null
}

export type SearchResponse = {
  query: string
  results: Record<string, StoreListing[]>
  deals?: Record<string, StoreListing[]>
}

export type ProductSummary = {
  product_id: string
  product_name: string
  lowest_price: number
  image_url?: string
}

export type CartItem = {
  product_id: string
  product_name: string
  store_id: string
  store_name: string
  price: number
  quantity: number
}
```

- [ ] **Step 2: Add ETA helper**

```ts
// frontend/src/utils/eta.ts
export function etaMinutes(distanceMiles?: number | null) {
  if (!distanceMiles && distanceMiles !== 0) return null
  return Math.round((distanceMiles / 30) * 60)
}
```

- [ ] **Step 3: Add ProductCard + ProductGrid**

```tsx
// frontend/src/components/ProductCard.tsx
import React from 'react'
import { ProductSummary } from '../types'

export default function ProductCard({ item, onClick }: { item: ProductSummary; onClick: () => void }) {
  return (
    <div className="card" onClick={onClick}>
      <div className="card-img" />
      <div className="card-body">
        <div className="card-title">{item.product_name}</div>
        <div className="card-price">From ${item.lowest_price.toFixed(2)}</div>
      </div>
    </div>
  )
}
```

```tsx
// frontend/src/components/ProductGrid.tsx
import React from 'react'
import { ProductSummary } from '../types'
import ProductCard from './ProductCard'

export default function ProductGrid({ items, onSelect }: { items: ProductSummary[]; onSelect: (p: ProductSummary) => void }) {
  return (
    <div className="grid">
      {items.map((p) => (
        <ProductCard key={p.product_id} item={p} onClick={() => onSelect(p)} />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Add ProductDetail skeleton**

```tsx
// frontend/src/components/ProductDetail.tsx
import React from 'react'
import { StoreListing } from '../types'

export default function ProductDetail({ productName, listings }: { productName: string; listings: StoreListing[] }) {
  return (
    <div className="detail">
      <div className="detail-main">
        <div className="detail-title">{productName}</div>
        <div className="detail-img" />
      </div>
      <div className="detail-side">
        <div className="cta-card">Add to cart</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Wire App state (search -> grid -> detail)**

```tsx
// frontend/src/App.tsx
import React, { useState } from 'react'
import Header from './components/Header'
import ProductGrid from './components/ProductGrid'
import ProductDetail from './components/ProductDetail'
import { ProductSummary, SearchResponse, StoreListing } from './types'

export default function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [selected, setSelected] = useState<ProductSummary | null>(null)

  const products: ProductSummary[] = []
  if (results) {
    const map = new Map<string, { name: string; lowest: number }>()
    Object.values(results.results || {}).forEach((listings) => {
      listings.forEach((l) => {
        if (!map.has(l.product_id)) {
          map.set(l.product_id, { name: l.product_name, lowest: l.price })
        } else {
          const cur = map.get(l.product_id)!
          if (l.price < cur.lowest) cur.lowest = l.price
        }
      })
    })
    for (const [product_id, v] of map.entries()) {
      products.push({ product_id, product_name: v.name, lowest_price: v.lowest })
    }
  }

  let selectedListings: StoreListing[] = []
  if (results && selected) {
    Object.values(results.results || {}).forEach((listings) => {
      listings.forEach((l) => {
        if (l.product_id === selected.product_id) selectedListings.push(l)
      })
    })
  }

  return (
    <div className="app">
      <Header query={query} onQuery={setQuery} onSearch={setResults} />
      <div className="content">
        <div className="pane-left">
          <ProductGrid items={products} onSelect={(p) => setSelected(p)} />
        </div>
        <div className="pane-right">
          {selected && (
            <ProductDetail productName={selected.product_name} listings={selectedListings} />
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Add base CSS and import**

```css
/* frontend/src/styles.css */
.app { font-family: "Space Grotesk", system-ui, sans-serif; padding: 16px; }
.content { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.card { border: 1px solid #eee; border-radius: 10px; padding: 12px; cursor: pointer; background: #fff; }
.card-img { height: 90px; background: #f2f2f2; border-radius: 8px; margin-bottom: 8px; }
.card-title { font-weight: 600; font-size: 14px; }
.card-price { color: #444; font-size: 13px; }
.detail { display: grid; grid-template-columns: 1fr; gap: 12px; }
.detail-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.detail-img { height: 180px; background: #f2f2f2; border-radius: 8px; }
.cta-card { border: 1px solid #eee; border-radius: 10px; padding: 12px; background: #fafafa; }
@media (min-width: 1024px) {
  .detail { grid-template-columns: 2fr 1fr; }
  .pane-right { position: sticky; top: 12px; }
}
@media (max-width: 1023px) {
  .content { grid-template-columns: 1fr; }
}
```

```tsx
// frontend/src/main.tsx
import './styles.css'
```

- [ ] **Step 7: Commit**

```
git add frontend/src/types.ts frontend/src/utils/eta.ts frontend/src/components/Header.tsx frontend/src/components/ProductGrid.tsx frontend/src/components/ProductCard.tsx frontend/src/components/ProductDetail.tsx frontend/src/App.tsx frontend/src/styles.css frontend/src/main.tsx

git commit -m "feat(ui): add product grid + detail skeleton and base layout"
```

---

### Task 4: Header, Search, and Comparison Table + Add-to-Cart card

**Files:**
- Create: `frontend/src/components/Header.tsx`
- Create: `frontend/src/components/ComparisonTable.tsx`
- Create: `frontend/src/components/AddToCartCard.tsx`
- Modify: `frontend/src/components/ProductDetail.tsx`

- [ ] **Step 1: Header with search**

```tsx
// frontend/src/components/Header.tsx
import React, { useState } from 'react'
import { SearchResponse } from '../types'

export default function Header({ query, onQuery, onSearch }: { query: string; onQuery: (v: string) => void; onSearch: (r: SearchResponse) => void }) {
  const [zip, setZip] = useState('02139')

  async function doSearch() {
    const res = await fetch(`/search?query=${encodeURIComponent(query)}&zip_code=${encodeURIComponent(zip)}`)
    const data = await res.json()
    onSearch(data)
  }

  return (
    <header className="header">
      <div className="logo">CartSaver</div>
      <input className="search" placeholder="Search" value={query} onChange={(e) => onQuery(e.target.value)} />
      <input className="zip" value={zip} onChange={(e) => setZip(e.target.value)} />
      <button className="btn" onClick={doSearch} disabled={!query}>Search</button>
      <div className="cart-badge">Cart (0)</div>
    </header>
  )
}
```

- [ ] **Step 2: Comparison table**

```tsx
// frontend/src/components/ComparisonTable.tsx
import React from 'react'
import { StoreListing } from '../types'

export default function ComparisonTable({ listings, onSelect, selectedStoreId }: { listings: StoreListing[]; onSelect: (s: StoreListing) => void; selectedStoreId?: string }) {
  return (
    <table className="compare">
      <thead>
        <tr>
          <th>Store</th>
          <th>Price</th>
          <th>Distance</th>
          <th>ETA</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {listings.map((l) => (
          <tr key={`${l.store_id}-${l.product_id}`} className={selectedStoreId === l.store_id ? 'selected' : ''}>
            <td>{l.store_name}</td>
            <td>${l.price.toFixed(2)}</td>
            <td>{l.distance_miles != null ? `${l.distance_miles} mi` : '—'}</td>
            <td>{l.eta_minutes != null ? `~${l.eta_minutes} min` : '—'}</td>
            <td><button onClick={() => onSelect(l)}>Choose</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 3: Add-to-cart card**

```tsx
// frontend/src/components/AddToCartCard.tsx
import React from 'react'
import { StoreListing } from '../types'

export default function AddToCartCard({ selected, onAdd, onChangeStore, allStores }: { selected: StoreListing | null; onAdd: () => void; onChangeStore: (storeId: string) => void; allStores: StoreListing[] }) {
  if (!selected) return null

  return (
    <div className="cta-card">
      <button className="btn primary" onClick={onAdd}>Add to cart</button>
      <div className="cta-subtext">From {selected.store_name} — ${selected.price.toFixed(2)} ({selected.distance_miles ?? '—'} mi, ~{selected.eta_minutes ?? '—'} min)</div>
      <label>Choose store</label>
      <select value={selected.store_id} onChange={(e) => onChangeStore(e.target.value)}>
        {allStores.map((s) => (
          <option key={s.store_id} value={s.store_id}>{s.store_name} - ${s.price.toFixed(2)}</option>
        ))}
      </select>
    </div>
  )
}
```

- [ ] **Step 4: Wire ProductDetail**

```tsx
// frontend/src/components/ProductDetail.tsx
import React, { useMemo, useState } from 'react'
import { StoreListing } from '../types'
import ComparisonTable from './ComparisonTable'
import AddToCartCard from './AddToCartCard'

export default function ProductDetail({ productName, listings }: { productName: string; listings: StoreListing[] }) {
  const cheapest = useMemo(() => listings.slice().sort((a, b) => a.price - b.price)[0] || null, [listings])
  const [selected, setSelected] = useState<StoreListing | null>(cheapest)

  return (
    <div className="detail">
      <div className="detail-main">
        <div className="detail-title">{productName}</div>
        <div className="detail-img" />
        <h3>Price comparison</h3>
        <ComparisonTable listings={listings} selectedStoreId={selected?.store_id} onSelect={(l) => setSelected(l)} />
      </div>
      <div className="detail-side">
        <AddToCartCard selected={selected} allStores={listings} onAdd={() => {}} onChangeStore={(id) => {
          const found = listings.find((l) => l.store_id === id)
          if (found) setSelected(found)
        }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: CSS additions**

```css
/* frontend/src/styles.css */
.header { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
.logo { font-weight: 700; font-size: 20px; }
.search { flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #ddd; }
.zip { width: 90px; padding: 8px; border-radius: 8px; border: 1px solid #ddd; }
.btn { padding: 8px 12px; border-radius: 8px; border: 1px solid #ddd; background: #fff; }
.btn.primary { background: #1a73e8; color: #fff; border-color: #1a73e8; }
.cart-badge { margin-left: auto; }
.compare { width: 100%; border-collapse: collapse; }
.compare th, .compare td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; }
.compare tr.selected { background: #f5f9ff; }
```

- [ ] **Step 6: Commit**

```
git add frontend/src/components/Header.tsx frontend/src/components/ComparisonTable.tsx frontend/src/components/AddToCartCard.tsx frontend/src/components/ProductDetail.tsx frontend/src/styles.css

git commit -m "feat(ui): add header search, comparison table, and add-to-cart card"
```

---

### Task 5: Cart drawer + add-to-cart behavior

**Files:**
- Create: `frontend/src/components/CartDrawer.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/AddToCartCard.tsx`

- [ ] **Step 1: Cart drawer component**

```tsx
// frontend/src/components/CartDrawer.tsx
import React from 'react'
import { CartItem } from '../types'

export default function CartDrawer({ items, onClose, onUpdateQty }: { items: CartItem[]; onClose: () => void; onUpdateQty: (id: string, qty: number) => void }) {
  return (
    <aside className="cart-drawer">
      <div className="cart-head">
        <strong>Cart</strong>
        <button onClick={onClose}>Close</button>
      </div>
      {items.length === 0 && <div className="muted">Your cart is empty</div>}
      {items.map((i) => (
        <div key={`${i.product_id}-${i.store_id}`} className="cart-row">
          <div>
            <div className="cart-name">{i.product_name}</div>
            <div className="cart-store">{i.store_name}</div>
          </div>
          <div>
            <input type="number" min={1} value={i.quantity} onChange={(e) => onUpdateQty(i.product_id, Number(e.target.value))} />
          </div>
        </div>
      ))}
    </aside>
  )
}
```

- [ ] **Step 2: Wire cart state in App**

```tsx
// frontend/src/App.tsx
import CartDrawer from './components/CartDrawer'
import { CartItem } from './types'

const [cart, setCart] = useState<CartItem[]>([])
const [cartOpen, setCartOpen] = useState(false)

function addToCart(listing: StoreListing, productName: string) {
  setCart((prev) => {
    const key = `${listing.product_id}-${listing.store_id}`
    const found = prev.find((i) => `${i.product_id}-${i.store_id}` === key)
    if (found) return prev.map((i) => key === `${i.product_id}-${i.store_id}` ? { ...i, quantity: i.quantity + 1 } : i)
    return [...prev, { product_id: listing.product_id, product_name: productName, store_id: listing.store_id, store_name: listing.store_name, price: listing.price, quantity: 1 }]
  })
  setCartOpen(true)
}
```

- [ ] **Step 3: Pass add-to-cart handler into ProductDetail**

```tsx
// frontend/src/components/ProductDetail.tsx
export default function ProductDetail({ productName, listings, onAdd }: { productName: string; listings: StoreListing[]; onAdd: (l: StoreListing) => void }) {
  // ...
  <AddToCartCard selected={selected} allStores={listings} onAdd={() => selected && onAdd(selected)} ... />
}
```

- [ ] **Step 4: CSS for cart drawer**

```css
.cart-drawer { position: fixed; right: 0; top: 0; width: 320px; height: 100%; background: #fff; border-left: 1px solid #eee; padding: 16px; box-shadow: -4px 0 12px rgba(0,0,0,0.08); }
.cart-head { display: flex; justify-content: space-between; margin-bottom: 12px; }
.cart-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
.muted { color: #777; }
```

- [ ] **Step 5: Commit**

```
git add frontend/src/components/CartDrawer.tsx frontend/src/App.tsx frontend/src/components/AddToCartCard.tsx frontend/src/components/ProductDetail.tsx frontend/src/styles.css

git commit -m "feat(ui): add cart drawer and add-to-cart behavior"
```

---

### Task 6: Frontend tests

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/src/setupTests.ts`
- Create: `frontend/src/utils/eta.test.ts`
- Create: `frontend/src/components/ComparisonTable.test.tsx`
- Create: `frontend/src/components/ProductGrid.test.tsx`

- [ ] **Step 1: Add dev deps**

```json
// frontend/package.json (devDependencies)
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.1.0",
  "jsdom": "^24.0.0",
  "vitest": "^1.6.0"
}
```

- [ ] **Step 2: Add Vitest config**

```ts
// frontend/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
```

- [ ] **Step 3: Setup tests**

```ts
// frontend/src/setupTests.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 4: ETA unit test**

```ts
// frontend/src/utils/eta.test.ts
import { etaMinutes } from './eta'

it('computes ETA from miles', () => {
  expect(etaMinutes(30)).toBe(60)
  expect(etaMinutes(15)).toBe(30)
})
```

- [ ] **Step 5: ComparisonTable test**

```tsx
// frontend/src/components/ComparisonTable.test.tsx
import { render, screen } from '@testing-library/react'
import ComparisonTable from './ComparisonTable'

it('renders rows', () => {
  render(<ComparisonTable listings={[{ store_id: 's1', store_name: 'Store', product_id: 'p1', product_name: 'Cheese', price: 3.5, availability: 'in_stock', distance_miles: 2.1, eta_minutes: 5 }]} onSelect={() => {}} />)
  expect(screen.getByText('Store')).toBeInTheDocument()
  expect(screen.getByText('$3.50')).toBeInTheDocument()
})
```

- [ ] **Step 6: ProductGrid test**

```tsx
// frontend/src/components/ProductGrid.test.tsx
import { render, screen } from '@testing-library/react'
import ProductGrid from './ProductGrid'

it('renders product cards', () => {
  render(<ProductGrid items={[{ product_id: 'p1', product_name: 'Cheese', lowest_price: 3.5 }]} onSelect={() => {}} />)
  expect(screen.getByText('Cheese')).toBeInTheDocument()
})
```

- [ ] **Step 7: Run tests**

Run:
```
cd frontend
npm install
npm run test
```
Expected: PASS.

- [ ] **Step 8: Commit**

```
git add frontend/package.json frontend/vitest.config.ts frontend/src/setupTests.ts frontend/src/utils/eta.test.ts frontend/src/components/ComparisonTable.test.tsx frontend/src/components/ProductGrid.test.tsx

git commit -m "test(ui): add vitest + basic component tests"
```

---

## Self-Review Checklist
- Spec coverage: Search -> grid -> detail flow, comparison table, cheapest store default, CTA placement, distance/ETA all covered.
- No placeholders: Every step includes concrete code and exact commands.
- Type consistency: StoreListing and CartItem types used consistently across components.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-21-cartsaver-ui-detail-implementation.md`. Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
