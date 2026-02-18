"use client"
import { useEffect, useState } from 'react'

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  return (
    <button
      className="fixed top-4 right-4 bg-gray-800 text-white p-2 rounded"
      onClick={() => setDark(d => !d)}
    >
      {dark ? '🌙' : '☀️'}
    </button>
  )
}
