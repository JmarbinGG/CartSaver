import React, { useState, useEffect } from 'react'
import ProductGrid from './ProductGrid'
import ProductDetail from './ProductDetail'

export default function ResultsView({ data, onAddToList }: { data: any, onAddToList?: (l: any) => void }) {
  const [selected, setSelected] = useState<string | null>(null)

  if (!data) return <div><em>No results yet — try searching or optimizing a list.</em></div>

  const results = data.results || data // support both assignments payload and raw search

  return (
    <div>
      <h2>Results</h2>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          {!selected && <ProductGrid results={results} onSelect={(id) => setSelected(id)} />}
          {selected && <ProductDetail productId={selected} results={results} onBack={() => setSelected(null)} onAddToList={onAddToList} />}
        </div>

        <div style={{ width: 360 }}>
          <section>
            <h3>Assignments</h3>
            {data.assignments ? (
              <ul>
                {data.assignments.map((a: any, i: number) => (
                  <li key={i}>{a.product_name} → {a.store_name} (${Number(a.price || 0).toFixed(2)})</li>
                ))}
              </ul>
            ) : (
              <div style={{ color: '#666' }}><em>No assignment summary</em></div>
            )}

            {data.total_cost !== undefined && (
              <div style={{ marginTop: 12 }}>
                <div><strong>Items:</strong> ${Number(data.total_item_cost || 0).toFixed(2)}</div>
                <div><strong>Travel:</strong> ${Number(data.travel_cost || 0).toFixed(2)}</div>
                <div><strong>Total:</strong> ${Number(data.total_cost || 0).toFixed(2)}</div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
