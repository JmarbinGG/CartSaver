import React, { useState } from 'react'
import { SearchIcon, LocationPinIcon } from './Icon'

type Props = {
  zip: string
  onZipChange: (z: string) => void
  onResults?: (r: any) => void
}

export default function SearchForm({ zip, onZipChange, onResults }: Props) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function doSearch() {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `http://localhost:8000/search?query=${encodeURIComponent(query)}&zip_code=${encodeURIComponent(zip)}`
      )
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()
      onResults?.(data)
    } catch {
      setError('Search failed — is the backend running on port 8000?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cs-search-bar">
      <div className="cs-search-inner">
        <div className="cs-search-icon">
          <SearchIcon size={17} />
        </div>
        <input
          className="cs-search-input"
          placeholder="Search groceries — milk, eggs, bread, butter…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          autoFocus
        />
        <div className="cs-zip-divider" />
        <div className="cs-zip-wrap">
          <LocationPinIcon size={13} color="var(--muted)" />
          <input
            className="cs-zip-input"
            placeholder="ZIP"
            value={zip}
            onChange={e => onZipChange(e.target.value)}
            maxLength={5}
            aria-label="ZIP code"
          />
        </div>
        <button
          className="btn btn-primary cs-search-btn"
          onClick={doSearch}
          disabled={loading || !query.trim()}
        >
          {loading ? <span className="cs-spinner" /> : 'Search'}
        </button>
      </div>
      {error && <div className="cs-search-error">{error}</div>}
    </div>
  )
}
