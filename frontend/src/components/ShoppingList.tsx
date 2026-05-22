import React, { useState } from 'react'

type Props = {
  onOptimizeResult?: (r: any) => void
}

export default function ShoppingList({ onOptimizeResult }: Props) {
  const [items, setItems] = useState<{ product_name: string; quantity: number }[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  function addItem() {
    if (!name) return
    setItems([...items, { product_name: name, quantity: 1 }])
    setName('')
  }

  function removeAt(i: number) {
    const copy = [...items]
    copy.splice(i, 1)
    setItems(copy)
  }

  async function optimize() {
    setLoading(true)
    try {
      const payload = { items: items.map((it, idx) => ({ product_id: `local-${idx}`, product_name: it.product_name, quantity: it.quantity })), zip_code: '02139' }
      const resp = await fetch('/optimize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      const data = await resp.json()
      onOptimizeResult?.(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Shopping List</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={addItem}>Add</button>
      </div>

      <ul>
        {items.map((it, i) => (
          <li key={i} style={{ marginTop: 8 }}>
            {it.product_name} — qty {it.quantity}
            <button style={{ marginLeft: 8 }} onClick={() => removeAt(i)}>Remove</button>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 12 }}>
        <button onClick={optimize} disabled={items.length === 0 || loading}>{loading ? 'Optimizing…' : 'Optimize List'}</button>
      </div>
    </div>
  )
}
