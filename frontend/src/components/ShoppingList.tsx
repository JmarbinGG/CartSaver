import React, { useEffect, useRef, useState } from 'react'

type Suggestion = {
  product_id: string
  product_name: string
  store_id?: string
  store_name?: string
}

type Item = {
  product_id: string
  product_name: string
  quantity: number
}

type Props = {
  onOptimizeResult?: (r: any) => void
}

export default function ShoppingList({ onOptimizeResult }: Props) {
  const [items, setItems] = useState<Item[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cartsaver:list') || '[]')
    } catch {
      return []
    }
  })
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    localStorage.setItem('cartsaver:list', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }
    // debounce + abort previous
    const ac = new AbortController()
    abortRef.current?.abort()
    abortRef.current = ac

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/search?query=${encodeURIComponent(query)}&zip_code=02139`, { signal: ac.signal })
        if (!res.ok) return
        const data = await res.json()
        // flatten results to unique product suggestions
        const flat: Suggestion[] = []
        const seen = new Set<string>()
        for (const store of Object.keys(data.results || {})) {
          for (const p of data.results[store]) {
            if (!seen.has(p.product_id)) {
              seen.add(p.product_id)
              flat.push({ product_id: p.product_id, product_name: p.product_name, store_id: p.store_id, store_name: p.store_name })
            }
          }
        }
        setSuggestions(flat.slice(0, 10))
      } catch (err) {
        // ignore
      }
    }, 250)

    return () => { clearTimeout(t); ac.abort() }
  }, [query])

  function addSuggestion(s: Suggestion) {
    setItems(prev => [...prev, { product_id: s.product_id, product_name: s.product_name, quantity: 1 }])
    setQuery('')
    setSuggestions([])
  }

  function updateQty(i: number, qty: number) {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, quantity: qty } : it))
  }

  function removeAt(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i))
  }

  async function optimize() {
    setLoading(true)
    try {
      const payload = { items: items.map(it => ({ product_id: it.product_id, product_name: it.product_name, quantity: it.quantity })), zip_code: '02139' }
      const resp = await fetch('/optimize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      const data = await resp.json()
      onOptimizeResult?.(data)
    } finally {
      setLoading(false)
    }
  }

  function saveList(name = `list-${Date.now()}`) {
    setSaving(true)
    try {
      const saved = JSON.parse(localStorage.getItem('cartsaver:saved_lists') || '{}')
      saved[name] = items
      localStorage.setItem('cartsaver:saved_lists', JSON.stringify(saved))
    } finally {
      setSaving(false)
    }
  }

  function loadList(name: string) {
    const saved = JSON.parse(localStorage.getItem('cartsaver:saved_lists') || '{}')
    const list = saved[name] || []
    setItems(list)
  }

  function deleteSaved(name: string) {
    const saved = JSON.parse(localStorage.getItem('cartsaver:saved_lists') || '{}')
    delete saved[name]
    localStorage.setItem('cartsaver:saved_lists', JSON.stringify(saved))
  }

  const savedLists = Object.keys(JSON.parse(localStorage.getItem('cartsaver:saved_lists') || '{}'))

  return (
    <div>
      <h2>Shopping List</h2>

      <div style={{ maxWidth: 640 }}>
        <label>Find in-store item (type 2+ chars)</label>
        <div style={{ position: 'relative' }}>
          <input placeholder="Search products to add" value={query} onChange={(e) => setQuery(e.target.value)} />
          {suggestions.length > 0 && (
            <ul style={{ position: 'absolute', left: 0, right: 0, background: 'white', border: '1px solid #ddd', maxHeight: 200, overflow: 'auto', zIndex: 40 }}>
              {suggestions.map((s, i) => (
                <li key={s.product_id} style={{ padding: 8, cursor: 'pointer' }} onClick={() => addSuggestion(s)}>
                  <div style={{ fontWeight: 600 }}>{s.product_name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{s.store_name}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h3>Items</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Product</th>
              <th>Qty</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '8px 4px' }}>{it.product_name}</td>
                <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                  <input type="number" min={1} value={it.quantity} onChange={(e) => updateQty(i, Math.max(1, Number(e.target.value)))} style={{ width: 64 }} />
                </td>
                <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                  <button onClick={() => removeAt(i)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button onClick={optimize} disabled={items.length === 0 || loading}>{loading ? 'Optimizing…' : 'Optimize List'}</button>
          <button onClick={() => saveList() } disabled={items.length === 0 || saving}>{saving ? 'Saving…' : 'Save List'}</button>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3>Saved Lists</h3>
        {savedLists.length === 0 && <div><em>No saved lists</em></div>}
        <ul>
          {savedLists.map(name => (
            <li key={name} style={{ marginTop: 8 }}>
              {name}
              <button style={{ marginLeft: 8 }} onClick={() => loadList(name)}>Load</button>
              <button style={{ marginLeft: 8 }} onClick={() => { deleteSaved(name); window.location.reload() }}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
