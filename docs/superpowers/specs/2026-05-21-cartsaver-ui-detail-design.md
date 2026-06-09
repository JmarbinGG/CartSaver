# CartSaver UI — Search → Grid → Detail (Instacart-like)

## Overview
Build an Instacart-like shopping flow that allows users to search products, browse a grid of brands/options, open a product detail view, compare prices across stores in a clean table (price, store, distance, ETA), and add to cart with cheapest store default and an optional store dropdown. Desktop should place the primary cart CTA on the right side of the detail view; mobile should place the CTA above the comparison table on the left (top).

## Goals
- Amazon/Instacart-like UX for browsing and product details.
- Clear price comparison table with distance and ETA (no traffic).
- “Add to cart” default chooses cheapest store; dropdown allows override.
- UI should be modern, clean, and production-grade (not MVP rough).

## Non-goals
- Real store integrations beyond mock data.
- Complex routing, payments, or checkout.
- Advanced map visualizations.

## UX Flow
1. **Search**: User types a query in the global search bar.
2. **Grid**: Results appear as product cards (brand/options, size, base price). Clicking a card opens the product detail view.
3. **Detail**: Product detail shows image, name, size, description, and a **price comparison table**.
4. **Add to cart**: CTA defaults to cheapest store (derived from comparison table). A dropdown allows choosing a different store.
5. **Cart**: Header shows a cart badge; cart drawer lists items, quantities, and chosen stores.

## Layout & Responsive Behavior
- **Desktop (>= 1024px)**
  - Two-column layout.
  - Left: product detail content + comparison table.
  - Right: add-to-cart card with price, store dropdown, and CTA.
- **Mobile (< 1024px)**
  - Single-column layout.
  - Add-to-cart card appears **above** the comparison table (left/top).

## UI Components
- **Header**: Logo, search bar, ZIP selector, cart badge.
- **ProductGrid**: Cards with image, name, size, base price.
- **ProductDetail**:
  - Image, title, size, short description.
  - Add-to-cart card (see below).
  - ComparisonTable.
- **AddToCartCard**:
  - Primary button (“Add to cart”).
  - Subtext: “From Kroger — $3.49 (2.4 mi, ~7 min)”.
  - Store dropdown to override selection.
- **ComparisonTable**: Columns: Store | Price | Distance | ETA | Select.

## Data Flow
- Search API: `/search?query=...&zip_code=...`
- Product detail view uses search results to group listings by product.
- Distance and ETA computed on client from store ZIP distances:
  - Distance in miles from backend data.
  - ETA formula: $\text{minutes} = \text{round}(\text{miles} / 30 \times 60)$

## Error & Empty States
- No results: show empty-state card (“No products found for query”).
- Missing distance: show “—” for distance/ETA, still allow add-to-cart.
- Add-to-cart failure: show inline error banner.

## Testing
- UI snapshot tests for ProductGrid and ProductDetail.
- Unit test ETA formula.
- Manual QA: search → detail → compare → add to cart on desktop and mobile.

## Open Questions (to be resolved in implementation)
- What default ZIP to use when none selected (keep 02139 or prompt user)?
- Should cart be a drawer or dedicated page (default: drawer)?
