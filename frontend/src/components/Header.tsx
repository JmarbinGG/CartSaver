import React from 'react'

export default function Header({ view, setView, listVersion }: { view: string, setView: (v: any) => void, listVersion?: number }) {
  return (
    <header className="cs-header">
      <div className="cs-logo" onClick={() => setView('home')}>
        <div className="cs-logo-mark">CS</div>
        <span>CartSaver</span>
      </div>

      <nav className="cs-nav">
        <button
          className={`cs-nav-btn ${view === 'home' ? 'cs-nav-active' : ''}`}
          onClick={() => setView('home')}
        >
          Home
        </button>
        <button
          className={`cs-nav-btn ${view === 'search' ? 'cs-nav-active' : ''}`}
          onClick={() => setView('search')}
        >
          Search
        </button>
        <button
          className={`cs-nav-btn ${view === 'list' ? 'cs-nav-active' : ''}`}
          onClick={() => setView('list')}
        >
          My List
        </button>
      </nav>

      <div className="cs-actions" />
    </header>
  )
}
