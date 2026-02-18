'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../libsupabase'

export default function Page() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const supabase = getSupabase()
      if (!supabase) {
        setError('Supabase no está configurado. Revise .env.local')
        return
      }

      const { data } = await supabase.auth.getSession()

      if (data?.session) {
        router.replace('/dashboard')
      }
    }

    checkSession()
  }, [router])

  function validate() {
    if (!email.includes('@')) {
      return 'Ingrese un email válido.'
    }

    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.'
    }

    return ''
  }

  async function submit() {
    const validationError = validate()

    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = getSupabase()

      if (!supabase) {
        throw new Error('Supabase no está configurado en el entorno')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data?.user) {
        router.replace('/dashboard')
      }

    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Inicio de sesión</h2>

      <p className="mb-4 text-sm">
        ¿No tienes cuenta? 
        <a className="text-blue-500 ml-1" href="/register">
          Regístrate
        </a>
      </p>
      <p className="mb-4 text-sm">
        <a className="text-green-500" href="/predictions">Ver predicciones</a>
      </p>

      <input
        className="w-full border p-2 rounded mb-4"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded mb-4"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        onClick={submit}
        disabled={loading}
      >
        {loading ? 'Iniciando sesión…' : 'Entrar'}
      </button>

      {error && (
        <p className="text-red-600 mt-4">{error}</p>
      )}
    </div>
  )
}
