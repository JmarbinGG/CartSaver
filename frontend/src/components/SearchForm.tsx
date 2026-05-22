import React, { useState } from 'react'

type Props = {
  onResults?: (r: any) => void
}

export default function SearchForm({ onResults }: Props) {
  const [query, setQuery] = useState('')
  const [zip, setZip] = useState('02139')
  const [loading, setLoading] = useState(false)

  async function doSearch() {
    setLoading(true)
    try {
      const res = await fetch(`/search?query=${encodeURIComponent(query)}&zip_code=${encodeURIComponent(zip)}`)
      const data = await res.json()
      onResults?.(data)
    } finally {
      setLoading(false)
    }
  }

  async function doOptimize(results: any) {
    // build a minimal shopping list payload from first product in results
    const items: any[] = []
    for (const store in results.results) {
      const list = results.results[store]
      if (list && list.length > 0) {
        items.push({ product_id: list[0].product_id, product_name: list[0].product_name, quantity: 1 })
      }
    }
    const resp = await fetch('/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, zip_code: zip }),
    })
    const body = await resp.json()
    onResults?.(body)
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input placeholder="Search query" value={query} onChange={(e) => setQuery(e.target.value)} />
      <input placeholder="ZIP" style={{ width: 100 }} value={zip} onChange={(e) => setZip(e.target.value)} />
      <button onClick={doSearch} disabled={loading || !query}>Search</button>
      <button
        onClick={async () => {
          setLoading(true)
          try {
            const res = await fetch(`/search?query=${encodeURIComponent(query)}&zip_code=${encodeURIComponent(zip)}`)
            const data = await res.json()
            await doOptimize(data)
          } finally {
            setLoading(false)
          }
        }}
        disabled={loading || !query}
      >
        Optimize
      </button>
    </div>
  )
}
