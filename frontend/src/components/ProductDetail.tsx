import React, { useState } from 'react'
import ComparisonTable from './ComparisonTable'
import Toast from './Toast'
import { ArrowLeftIcon, CategoryIcon, CheckIcon, MapPinIcon } from './Icon'

type Listing = {
  product_id: string
  product_name: string
  brand?: string
  store_id: string
  store_name?: string
  store_zip?: string
  price: number
  unit_price?: number
  distance_miles?: number
  eta_minutes?: number
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
  group: ProductGroup
  onBack: () => void
  onAddToList?: (l: Listing) => void
}

export default function ProductDetail({ group, onBack, onAddToList }: Props) {
  const sorted = [...group.listings].sort((a, b) => a.price - b.price)
  const cheapest = sorted[0]

  const [selectedId, setSelectedId] = useState<string>(cheapest?.product_id ?? '')
  const [toast, setToast] = useState<string | null>(null)

  const selected = group.listings.find(l => l.product_id === selectedId) ?? cheapest
  const savings = sorted.length > 1
    ? sorted[sorted.length - 1].price - sorted[0].price
    : 0

  function addToList() {
    if (!selected) return
    onAddToList?.(selected)
    setToast(`Added to list — ${selected.store_name || selected.store_id}`)
    setTimeout(() => setToast(null), 2200)
  }

  return (
    <div className="product-detail-page">
      <button className="btn cs-back-btn" onClick={onBack}>
        <ArrowLeftIcon size={14} />
        Back to results
      </button>

      <div className="product-detail-header">
        <div className="product-detail-icon-wrap">
          {group.image_url
            ? <img src={group.image_url} alt={group.display_name} className="product-detail-hero-img" />
            : <CategoryIcon category={group.category} size={26} />
          }
        </div>
        <div>
          <h2 className="product-detail-title">{group.display_name}</h2>
          <div className="product-detail-subtitle">
            Available at {group.store_count} store{group.store_count !== 1 ? 's' : ''}
            {savings > 0.05 && (
              <span className="cs-savings-badge">
                {' '}· save up to ${savings.toFixed(2)} by choosing right
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="product-detail-body">
        <div className="product-detail-table-wrap">
          <h3 className="product-detail-section-title">Compare prices</h3>
          <p className="product-detail-hint">
            Select a row to choose your preferred store, then add to list.
          </p>
          <ComparisonTable
            listings={group.listings}
            selected={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        <div className="product-detail-sidebar">
          <div className="product-detail-selected-card">
            <div className="pds-label">Selected option</div>

            {selected ? (
              <>
                <div className="pds-store">{selected.store_name || selected.store_id}</div>
                <div className="pds-brand">{selected.brand || selected.product_name}</div>
                <div className="pds-price">${selected.price.toFixed(2)}</div>

                {selected.distance_miles != null && (
                  <div className="pds-dist">
                    <MapPinIcon size={11} color="var(--muted)" />
                    {' '}{selected.distance_miles.toFixed(1)} mi · {selected.eta_minutes} min drive
                  </div>
                )}

                {selected.price === cheapest?.price && sorted.length > 1 && (
                  <div className="pds-best-tag">
                    <CheckIcon size={13} />
                    Best price
                  </div>
                )}

                <div className="pds-divider" />
              </>
            ) : (
              <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 14 }}>
                Select a row above
              </div>
            )}

            <button
              className="btn btn-primary pds-add-btn"
              onClick={addToList}
              disabled={!selected}
            >
              Add to My List
            </button>
          </div>

          <div className="product-detail-tip">
            <strong>Smart routing:</strong> When you optimize your list,
            CartSaver factors in drive distance — so it won't send you
            across town to save a few cents.
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
