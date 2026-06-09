import React from 'react'
import { CategoryIcon, ListIcon } from './Icon'

type Listing = {
  product_id: string
  product_name: string
  price: number
  store_name?: string
  distance_miles?: number
  image_url?: string
}

type ProductGroup = {
  match_key: string
  display_name: string
  category: string
  listings: Listing[]
  best_price: number
  store_count: number
  image_url?: string
}

type Props = {
  groups: Record<string, ProductGroup> | null
  results: Record<string, Listing[]> | null
  onSelect: (matchKey: string) => void
}

function buildGroupsFromResults(results: Record<string, Listing[]>): Record<string, ProductGroup> {
  const map = new Map<string, { listings: Listing[]; best_price: number; stores: Set<string> }>()
  for (const [storeId, list] of Object.entries(results)) {
    for (const p of list) {
      const key = p.product_id
      if (!map.has(key)) map.set(key, { listings: [], best_price: Infinity, stores: new Set() })
      const g = map.get(key)!
      g.listings.push(p)
      if (p.price < g.best_price) g.best_price = p.price
      g.stores.add(p.store_name || storeId)
    }
  }
  const out: Record<string, ProductGroup> = {}
  for (const [key, g] of map.entries()) {
    out[key] = {
      match_key: key,
      display_name: g.listings[0]?.product_name || key,
      category: 'other',
      listings: g.listings,
      best_price: g.best_price === Infinity ? 0 : g.best_price,
      store_count: g.stores.size,
      image_url: g.listings.find(l => l.image_url)?.image_url,
    }
  }
  return out
}

export default function ProductGrid({ groups, results, onSelect }: Props) {
  const effectiveGroups = groups || (results ? buildGroupsFromResults(results) : null)

  if (!effectiveGroups || Object.keys(effectiveGroups).length === 0) {
    return (
      <div className="cs-empty-state">
        <div className="cs-empty-icon"><ListIcon size={36} /></div>
        <div>No products found — try a different search term.</div>
      </div>
    )
  }

  const sorted = Object.values(effectiveGroups).sort((a, b) => a.best_price - b.best_price)

  return (
    <div>
      <div className="cs-results-header">
        <span className="cs-results-count">
          {sorted.length} product{sorted.length !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className="product-grid">
        {sorted.map(group => {
          const closest = group.listings
            .filter(l => l.distance_miles != null)
            .sort((a, b) => (a.distance_miles ?? 99) - (b.distance_miles ?? 99))[0]
          const maxPrice = Math.max(...group.listings.map(l => l.price))
          const savings = maxPrice - group.best_price

          return (
            <div
              key={group.match_key}
              className="product-card"
              onClick={() => onSelect(group.match_key)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onSelect(group.match_key)}
            >
              <div className="product-card-icon">
                {group.image_url
                  ? <img src={group.image_url} alt={group.display_name} className="product-card-thumb" />
                  : <CategoryIcon category={group.category} size={22} />
                }
              </div>

              <div className="product-card-name">{group.display_name}</div>

              <div className="product-card-meta">
                <span className="product-card-stores">
                  {group.store_count} store{group.store_count !== 1 ? 's' : ''}
                </span>
                {closest?.distance_miles != null && (
                  <span className="product-card-dist">
                    {closest.distance_miles.toFixed(1)} mi
                  </span>
                )}
              </div>

              <div className="product-card-price-row">
                <span className="product-card-price-label">from</span>
                <span className="product-card-price">${group.best_price.toFixed(2)}</span>
                {savings > 0.05 && (
                  <span className="product-card-save">
                    save ${savings.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
