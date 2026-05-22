import React, { useState } from 'react'
import SearchForm from './components/SearchForm'

export default function App() {
  const [lastResults, setLastResults] = useState<any>(null)

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1>CartSaver (PWA Shell)</h1>
      <SearchForm onResults={(r) => setLastResults(r)} />

      {lastResults && (
        <div style={{ marginTop: 16 }}>
          <h2>Last Results</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(lastResults, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
