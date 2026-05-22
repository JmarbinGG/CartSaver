import React from 'react'

export default function ResultsView({ data }: { data: any }) {
  if (!data) return <div><em>No results yet — try searching or optimizing a list.</em></div>

  return (
    <div>
      <h2>Results</h2>
      <section>
        <h3>Assignments</h3>
        {data.assignments ? (
          <ul>
            {data.assignments.map((a: any, i: number) => (
              <li key={i}>{a.product_name} → {a.store_name} (${a.price.toFixed(2)})</li>
            ))}
          </ul>
        ) : (
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre>
        )}
      </section>

      {data.total_cost !== undefined && (
        <div style={{ marginTop: 12 }}>
          <strong>Total items:</strong> ${data.total_item_cost?.toFixed(2)}
          <br />
          <strong>Travel:</strong> ${data.travel_cost?.toFixed(2)}
          <br />
          <strong>Total:</strong> ${data.total_cost?.toFixed(2)}
        </div>
      )}
    </div>
  )
}
