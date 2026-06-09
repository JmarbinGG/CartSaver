import React, { useEffect } from 'react'

export default function Toast({ message, onClose, duration = 1800 }: { message: string, onClose?: () => void, duration?: number }) {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), duration)
    return () => clearTimeout(t)
  }, [duration, onClose])

  return (
    <div className="cs-toast">
      <small>{message}</small>
    </div>
  )
}
