import React from 'react'

export default function Home({ onStart }: { onStart: () => void }) {
  return (
    <div className="home-hero">
      <div className="home-inner">
        <div className="home-eyebrow">Price comparison across stores</div>

        <h1>
          Stop overpaying<br />
          for <em>groceries</em>
        </h1>

        <p className="lead">
          CartSaver compares prices across Walmart, Kroger, and Whole Foods,
          then tells you exactly where to shop — factoring in distance so you
          never drive 20 miles to save 50 cents.
        </p>

        <div className="home-cta-row">
          <button className="btn btn-primary btn-hero" onClick={onStart}>
            Compare prices now
          </button>
        </div>

        <div className="home-divider">
          <div className="home-divider-line" />
          <span className="home-divider-text">Available stores</span>
          <div className="home-divider-line" />
        </div>

        <div className="home-stores">
          <span className="home-store-badge">Kroger</span>
          <span className="home-store-badge">Walmart</span>
          <span className="home-store-badge">Whole Foods</span>
          <span className="home-store-badge">+ more coming</span>
        </div>
      </div>
    </div>
  )
}
