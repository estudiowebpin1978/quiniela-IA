'use client'
import { useState } from 'react'
import { getSupabase } from '../../libsupabase'

export default function UploadDraw() {
  const [date, setDate] = useState('')
  const [numbers, setNumbers] = useState('')
  const [province, setProvince] = useState('Nacional')
  const [turno, setTurno] = useState('Mañana')
  const [message, setMessage] = useState('')

  async function submit() {
    const supabase = getSupabase()
    if (!supabase) return
    const nums = numbers.split(/\D+/).map(n=>parseInt(n,10)).filter(n=>!isNaN(n))
    const { error } = await supabase.from('draws').insert({
      date,
      numbers: nums,
      lottery: province,
      turno,
    })
    if (error) setMessage(error.message)
    else setMessage('Sorteo añadido')
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-gray-900 text-gray-100">
      <h2 className="text-2xl font-bold mb-4">Cargar sorteo</h2>
      <input
        className="w-full border p-2 rounded mb-4 bg-gray-800"
        type="date"
        value={date}
        onChange={e=>setDate(e.target.value)}
      />
      <input
        className="w-full border p-2 rounded mb-4 bg-gray-800"
        placeholder="Números (ej. 12,34,56,78)"
        value={numbers}
        onChange={e=>setNumbers(e.target.value)}
      />
      <input
        className="w-full border p-2 rounded mb-4 bg-gray-800"
        placeholder="Provincia"
        value={province}
        onChange={e=>setProvince(e.target.value)}
      />
      <input
        className="w-full border p-2 rounded mb-4 bg-gray-800"
        placeholder="Turno"
        value={turno}
        onChange={e=>setTurno(e.target.value)}
      />
      <button
        className="w-full bg-blue-600 py-2 rounded"
        onClick={submit}
      >Añadir</button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}
