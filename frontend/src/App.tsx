import React, { useState } from 'react'
import ShoppingList from './components/ShoppingList'
import SearchPage from './pages/SearchPage'
import Header from './components/Header'
import Home from './pages/Home'

export default function App() {
  const [view, setView] = useState<'home' | 'search' | 'list'>('home')
  const [listVersion, setListVersion] = useState(0)
  const [zip, setZip] = useState(() => localStorage.getItem('cartsaver:zip') || '02139')

  function handleZipChange(z: string) {
    setZip(z)
    localStorage.setItem('cartsaver:zip', z)
  }

  function handleAddToList(listing: any) {
    try {
      const cur = JSON.parse(localStorage.getItem('cartsaver:list') || '[]')
      cur.push({
        product_id: listing.product_id || listing.id,
        product_name: listing.product_name || listing.name,
        quantity: 1,
        store_id: listing.store_id,
        store_name: listing.store_name,
        price: Number(listing.price || 0),
      })
      localStorage.setItem('cartsaver:list', JSON.stringify(cur))
    } catch { /* ignore */ }
    setListVersion(v => v + 1)
    setView('list')
  }

  return (
    <div className="cs-app">
      <Header view={view} setView={setView} listVersion={listVersion} />
      <main>
        {view === 'home' && <Home onStart={() => setView('search')} />}
        {view === 'search' && (
          <SearchPage zip={zip} onZipChange={handleZipChange} onAddToList={handleAddToList} />
        )}
        {view === 'list' && (
          <ShoppingList listVersion={listVersion} zip={zip} onOptimizeResult={() => setView('list')} />
        )}
      </main>
    </div>
  )
}
