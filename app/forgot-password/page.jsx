'use client'
import { useState } from 'react'
import { getSupabase } from '../libsupabase'

export default function Page() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const supabase = getSupabase()
      if (!supabase) {
        setError('Supabase no está configurado en el entorno')
        return
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      setMessage('Se ha enviado un enlace de restablecimiento a su correo.')
    } catch (err) {
      setError(err?.message || JSON.stringify(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Recuperar contraseña</h2>
      <input
        className="w-full border p-2 rounded mb-4"
        placeholder="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        onClick={submit}
        disabled={loading}
      >
        {loading ? 'Enviando…' : 'Enviar enlace'}
      </button>
      {message && <p className="text-green-600 mt-4">{message}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
      <p className="mt-4 text-sm">
        <a className="text-blue-500" href="/login">Volver al inicio de sesión</a>
      </p>
    </div>
  )
}
