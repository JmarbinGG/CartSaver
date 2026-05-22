import React, { useState } from 'react'
import SearchForm from './components/SearchForm'
import ShoppingList from './components/ShoppingList'
import ResultsView from './components/ResultsView'

export default function App() {
  const [results, setResults] = useState<any>(null)
  const [view, setView] = useState<'search' | 'list' | 'results'>('search')

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>CartSaver</h1>
        <nav style={{ marginLeft: 'auto' }}>
          <button onClick={() => setView('search')} style={{ marginRight: 8 }}>Search</button>
          <button onClick={() => setView('list')} style={{ marginRight: 8 }}>Shopping List</button>
          <button onClick={() => setView('results')}>Results</button>
        </nav>
      </header>

      <main style={{ marginTop: 18 }}>
        {view === 'search' && <>
          <SearchForm onResults={(r) => { setResults(r); setView('results') }} />
        </>}

        {view === 'list' && <ShoppingList onOptimizeResult={(r) => { setResults(r); setView('results') }} />}

        {view === 'results' && <ResultsView data={results} />}
      </main>
    </div>
  )
}
