import React, { useState } from 'react'
import SearchForm from '../components/SearchForm'
import ProductGrid from '../components/ProductGrid'
import ProductDetail from '../components/ProductDetail'
import { GroceryIcon } from '../components/Icon'

type Props = {
  zip: string
  onZipChange: (z: string) => void
  onAddToList?: (l: any) => void
}

export default function SearchPage({ zip, onZipChange, onAddToList }: Props) {
  const [searchData, setSearchData] = useState<any>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  function handleResults(r: any) {
    setSearchData(r)
    setSelectedGroup(null)
  }

  const groups = searchData?.groups || null

  return (
    <div className="search-page">
      <SearchForm zip={zip} onZipChange={onZipChange} onResults={handleResults} />

      <div style={{ marginTop: 24 }}>
        {!searchData && (
          <div className="cs-empty-state">
            <div className="cs-empty-icon"><GroceryIcon size={38} /></div>
            <div>Search for groceries to compare prices across stores</div>
            <div style={{ fontSize: 13, marginTop: 6, color: 'var(--muted)' }}>Try: milk, eggs, bread, butter</div>
          </div>
        )}
        {searchData && !selectedGroup && (
          <ProductGrid groups={groups} results={searchData.results} onSelect={setSelectedGroup} />
        )}
        {searchData && selectedGroup && groups && groups[selectedGroup] && (
          <ProductDetail
            group={groups[selectedGroup]}
            onBack={() => setSelectedGroup(null)}
            onAddToList={onAddToList}
          />
        )}
      </div>
    </div>
  )
}
