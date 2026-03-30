import { useState, useEffect } from 'react'

export default function ConfirmDelete({ onConfirm, label = '✕', className = '' }) {
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (confirming) {
      const timer = setTimeout(() => setConfirming(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [confirming])

  if (confirming) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          setConfirming(false)
          onConfirm()
        }}
        className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md hover:bg-red-100 transition-all cursor-pointer animate-slide-in"
      >
        Delete?
      </button>
    )
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        setConfirming(true)
      }}
      className={`text-stone-300 hover:text-red-500 transition-colors cursor-pointer text-sm ${className}`}
    >
      {label}
    </button>
  )
}