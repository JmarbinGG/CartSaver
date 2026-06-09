import React from 'react'

type Listing = {
  product_id: string
  product_name: string
  brand?: string
  store_name?: string
  store_id?: string
  price: number
  unit_price?: number
  distance_miles?: number
  eta_minutes?: number
}

type Props = {
  listings: Listing[]
  selected?: string
  onSelect?: (productId: string) => void
}

export default function ComparisonTable({ listings, selected, onSelect }: Props) {
  const sorted = [...listings].sort((a, b) => a.price - b.price)
  const bestPrice = sorted[0]?.price ?? 0
  const worstPrice = sorted[sorted.length - 1]?.price ?? 0

  return (
    <div className="comparison-wrap">
      <table className="comparison-table">
        <thead>
          <tr>
            <th style={{ width: 52 }}></th>
            <th>Store</th>
            <th>Brand</th>
            <th style={{ textAlign: 'right' }}>Price</th>
            <th style={{ textAlign: 'right' }}>Per unit</th>
            <th style={{ textAlign: 'right' }}>Distance</th>
            <th style={{ textAlign: 'right' }}>ETA</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((l, i) => {
            const isBest = l.price === bestPrice
            const isSelected = selected === l.product_id
            const savings = worstPrice - l.price

            return (
              <tr
                key={l.product_id}
                className={[
                  'comparison-row',
                  isBest ? 'comparison-best' : '',
                  isSelected ? 'comparison-selected' : '',
                ].join(' ')}
                onClick={() => onSelect?.(l.product_id)}
              >
                <td className="comparison-rank">
                  {isBest
                    ? <span className="cs-badge-best">Best</span>
                    : <span className="comparison-rank-num">{i + 1}</span>
                  }
                </td>
                <td className="comparison-store">{l.store_name || l.store_id}</td>
                <td className="comparison-brand">{l.brand || '—'}</td>
                <td className={`comparison-price ${isBest ? 'comparison-price-best' : ''}`} style={{ textAlign: 'right' }}>
                  <span className="comparison-price-num">${l.price.toFixed(2)}</span>
                  {isBest && savings > 0.05 && (
                    <span className="comparison-savings">saves ${savings.toFixed(2)}</span>
                  )}
                </td>
                <td className="comparison-unit" style={{ textAlign: 'right' }}>
                  {l.unit_price ? `$${l.unit_price.toFixed(3)}` : '—'}
                </td>
                <td className="comparison-dist" style={{ textAlign: 'right' }}>
                  {l.distance_miles != null ? `${l.distance_miles.toFixed(1)} mi` : '—'}
                </td>
                <td className="comparison-eta" style={{ textAlign: 'right' }}>
                  {l.eta_minutes != null ? `${l.eta_minutes} min` : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
