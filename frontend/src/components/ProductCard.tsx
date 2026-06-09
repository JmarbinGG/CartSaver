import React from 'react'

type Listing = {
  product_id: string
  product_name: string
  price: number
  store_name?: string
  image_url?: string
}

export default function ProductCard({ item, onSelect }: { item: Listing, onSelect: (id: string) => void }) {
  return (
    <div className="product-card cs-font-inter" onClick={() => onSelect(item.product_id)}>
      <div className="thumb">
        {item.image_url ? (
          <img src={item.image_url} alt={item.product_name} style={{ maxHeight: '100%', maxWidth: '100%', display: 'block' }} />
        ) : (
          <div style={{ color: '#aaa' }}>No image</div>
        )}
      </div>
      <div className="title">{item.product_name}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <div className="price">${item.price.toFixed(2)}</div>
        <div className="store">{item.store_name}</div>
      </div>
    </div>
  )
}
