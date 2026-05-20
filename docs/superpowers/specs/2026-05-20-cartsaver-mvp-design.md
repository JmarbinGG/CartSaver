# CartSaver MVP Design

## Summary
CartSaver is a minimalist grocery price comparison and optimization web app (desktop + mobile PWA) that uses live provider abstractions but ships MVP with mock data. It normalizes unit pricing, builds shopping lists, computes an optimized plan with travel costs, and highlights deals. The system avoids a product catalog and stores only user preferences and shopping lists in local SQLite.

## Goals
- Search grocery items and compare prices across stores.
- Normalize unit pricing ($/lb, $/oz, $/unit) where possible.
- Build a shopping list and optimize store assignments.
- Factor travel cost based on user-entered distance and savings thresholds.
- Highlight deals based on local average pricing.
- Support light/dark mode with persistent settings.

## Non-Goals
- User accounts or cloud sync.
- Full product catalog or historical pricing warehouse.
- Real maps or routing APIs.
- Native mobile apps (PWA only).

## Constraints
- Frontend: React.
- Backend: Python + FastAPI + Uvicorn.
- DB: SQLite + SQLAlchemy.
- Providers: Kroger, Instacart (mocked in MVP), add Walmart later without core changes.
- No decorative UI, no gradients/animations, functional-first layout.

## Architecture
### Monorepo Structure
- frontend/ (React PWA)
- backend/ (FastAPI)
  - app/api/ (routes)
  - app/providers/ (StoreProvider interface, KrogerProvider, InstacartProvider, mock data adapters)
  - app/services/ (normalization, deals, optimization, search aggregation)
  - app/models/ (SQLAlchemy)
  - app/schemas/ (Pydantic)
  - app/mocks/ (seed datasets, zip centroid data)

### Provider Abstraction
StoreProvider interface:
- search_products(query, zip)
- get_product_prices(product_id, zip)
- get_stores_by_zip(zip)

Each provider maps raw data to a shared internal model. Core services only consume the shared model to remain provider-agnostic.

## Data Model (SQLite)
- users (single local user)
- user_preferences (zip, preferred stores, gas_price_per_mile, drive_for_5_savings_miles, save_for_10_miles)
- shopping_lists
- shopping_list_items
- cached_search_results (ttl, zip, product_id, store_id, price, unit_price, availability, retrieved_at)

All data is stored locally on device.

## APIs
- GET /search?query=&zip=
- GET /items/{id}/prices?zip=
- GET /stores?zip=
- POST /lists
- GET /lists/{id}
- POST /lists/{id}/optimize
- GET /deals?zip=

## Data Flow
1. Search calls /search; backend queries providers (mock adapters), normalizes unit pricing, groups by store.
2. Item detail calls /items/{id}/prices; backend aggregates per-store prices and unit prices.
3. Shopping list persisted locally; optimize calls /lists/{id}/optimize which uses preferences and travel logic.
4. Deals uses cached search results to compute local averages and percentage savings.

## Normalization
- Parse packaging/unit info into standardized units when possible.
- Return unit_price null with a unit_label note when missing or inconsistent.
- Supported units: $/lb, $/oz, $/unit.

## Optimization
Objective:
$total_cost = item_cost + travel_cost$
$travel_cost = distance * gas_price_per_mile$

Rules:
- Prefer single-store plan unless savings exceed user thresholds.
- User thresholds from onboarding:
  - "How far would you drive to save $5?" (miles)
  - "How much would you need to save to drive 10 miles?" (dollars)

Distance:
- No maps API. Use local ZIP centroid lookup and simple straight-line distance between user ZIP and store ZIP.

## Deals Detection
- Use cached results to compute local average per item.
- Flag deals when price is >= 15-20% below average (configurable constant).
- Rank by percentage savings.

## UI/UX
### Navigation
Top nav with tabs: Search, Shopping List, Deals, Optimization, Settings.

### First-Run Setup
- Collect ZIP, preferred stores, gas price per mile.
- Collect drive/savings threshold questions.
- Persist preferences locally.

### Search
- Primary search bar.
- Results grouped by store.
- Each item shows name, price, unit price, store, availability, add-to-list.

### Item Detail
- Modal with per-store price table and normalized unit pricing.
- Add-to-list button.

### Shopping List
- List items with quantity controls and remove.
- "Optimize Shopping Plan" CTA.

### Optimization
- Item-to-store assignment.
- Total cost per store.
- Travel cost and final recommendation.
- Plain-language rationale.

### Deals
- Items below local average.
- Show percent savings and store.

### Settings
- Editable preferences and theme toggle (light/dark).
- All settings persisted locally.

## PWA
- Responsive layout for mobile.
- Installable PWA with basic offline shell (no data caching beyond API errors).

## Caching
- Short TTL cache for search results to avoid repeated provider calls.
- Cached results used by deals computation.

## Error Handling
- Clear user-facing errors for provider failures.
- Empty states for no results, no deals, no list items.

## Testing
- Backend unit tests for normalization, optimization thresholds, deals detection.
- API tests for endpoints using mock data.
- Frontend minimal component tests for search->list->optimize flow.

## Open Questions (Resolved)
- MVP includes all phases 1-5.
- Mock data allowed for providers.
- No maps API; distance via ZIP centroids.
- PWA required.
- Single-user local preferences only.
