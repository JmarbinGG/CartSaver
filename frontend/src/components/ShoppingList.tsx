import React, { useEffect, useState } from 'react'
import { BoltIcon, CloseIcon, ListIcon, MapPinIcon } from './Icon'

type Item = {
  product_id: string
  product_name: string
  quantity: number
  store_id?: string
  store_name?: string
  price?: number
}

type Assignment = {
  product_id: string
  product_name: string
  store_id: string
  store_name: string
  price: number
}

type OptimizeResult = {
  assignments: Assignment[]
  total_item_cost: number
  travel_cost: number
  total_cost: number
}

type Props = {
  listVersion?: number
  zip: string
  onOptimizeResult?: (r: OptimizeResult) => void
}

function groupByStore(assignments: Assignment[]) {
  const map: Record<string, Assignment[]> = {}
  for (const a of assignments) {
    const key = a.store_name || a.store_id
    if (!map[key]) map[key] = []
    map[key].push(a)
  }
  return map
}

export default function ShoppingList({ listVersion, zip, onOptimizeResult }: Props) {
  const [items, setItems] = useState<Item[]>(() => {
    try { return JSON.parse(localStorage.getItem('cartsaver:list') || '[]') } catch { return [] }
  })
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<OptimizeResult | null>(null)

  useEffect(() => {
    localStorage.setItem('cartsaver:list', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem('cartsaver:list') || '[]')) } catch { setItems([]) }
  }, [listVersion])

  function updateQty(i: number, qty: number) {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, quantity: Math.max(1, qty) } : it))
    setPlan(null)
  }

  function removeAt(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i))
    setPlan(null)
  }

  async function optimize() {
    if (items.length === 0) return
    setLoading(true)
    try {
      const resp = await fetch('http://localhost:8000/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(it => ({ product_id: it.product_id, product_name: it.product_name, quantity: it.quantity })),
          zip_code: zip,
        }),
      })
      const data: OptimizeResult = await resp.json()
      setPlan(data)
      onOptimizeResult?.(data)
    } finally {
      setLoading(false)
    }
  }

  const subtotal = items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0)
  const storeGroups = plan ? groupByStore(plan.assignments) : null

  return (
    <div className="list-page">
      <div className="list-layout">
        <div className="list-main">
          <h2 className="list-title">My Shopping List</h2>

          {items.length === 0 ? (
            <div className="cs-empty-state">
              <div className="cs-empty-icon"><ListIcon size={36} /></div>
              <div>Your list is empty.</div>
              <div style={{ fontSize: 13, marginTop: 6, color: 'var(--muted-2)' }}>
                Search for products and add them here.
              </div>
            </div>
          ) : (
            <>
              <table className="list-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Store</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i} className="list-row">
                      <td className="list-product-name">{it.product_name}</td>
                      <td className="list-store">{it.store_name || '—'}</td>
                      <td className="list-price" style={{ textAlign: 'right' }}>
                        {it.price ? `$${it.price.toFixed(2)}` : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={e => updateQty(i, Number(e.target.value))}
                          className="list-qty-input"
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn list-remove-btn" onClick={() => removeAt(i)}>
                          <CloseIcon size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="list-actions">
                <div className="list-subtotal">
                  Subtotal: <strong>${subtotal.toFixed(2)}</strong>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={optimize}
                  disabled={loading}
                >
                  <BoltIcon size={13} color="#fff" />
                  {loading ? 'Optimizing…' : 'Optimize Route'}
                </button>
                <button
                  className="btn list-clear-btn"
                  onClick={() => { setItems([]); setPlan(null) }}
                >
                  Clear list
                </button>
              </div>
            </>
          )}
        </div>

        {plan && storeGroups && (
          <div className="plan-panel">
            <div className="plan-header">
              <div className="plan-title">Your Shopping Plan</div>
              <div className="plan-subtitle">Optimized for price + distance</div>
            </div>

            <div className="plan-body">
              {Object.entries(storeGroups).map(([storeName, assignments]) => (
                <div key={storeName} className="plan-store-block">
                  <div className="plan-store-name">
                    <MapPinIcon size={12} color="var(--green)" />
                    {storeName}
                  </div>
                  <ul className="plan-items">
                    {assignments.map((a, i) => (
                      <li key={i} className="plan-item">
                        <span className="plan-item-name">{a.product_name}</span>
                        <span className="plan-item-dots" />
                        <span className="plan-item-price">${a.price.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="plan-totals">
              <div className="plan-total-row">
                <span>Items</span>
                <span>${plan.total_item_cost.toFixed(2)}</span>
              </div>
              <div className="plan-total-row">
                <span>Travel estimate</span>
                <span>${plan.travel_cost.toFixed(2)}</span>
              </div>
              <div className="plan-total-grand">
                <span>Total</span>
                <span>${plan.total_cost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
