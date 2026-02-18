'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../libsupabase'

export default function Page(){

  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  const router = useRouter()

  function validate(){
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return 'Proporcione un email válido.'
    }
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.'
    }
    return ''
  }

  async function submit(){
    const v = validate()
    if (v) {
      setError(v)
      return
    }

    setLoading(true)
    setError('')
    try {
      const supabase = getSupabase()
      if (!supabase) {
        setError('Supabase no está configurado en el entorno')
        return
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: 'user' } },
      })
      if (error) throw error
      // Supabase sends confirmation email automatically if configured.
      // Let the user know to check their inbox.
      alert('Registro exitoso. Por favor revise su correo para confirmar.')
      router.push('/login')
    } catch (err) {
      setError(err?.message || JSON.stringify(err))
    } finally {
      setLoading(false)
    }
  }


return(
  <div className="max-w-md mx-auto p-8">
    <h2 className="text-2xl font-bold mb-4">Registro</h2>
    <p className="mb-4 text-sm">
      ¿Ya tienes cuenta? <a className="text-blue-500" href="/login">Inicia sesión</a>
    </p>

    <input
      className="w-full border p-2 rounded mb-4"
      placeholder="email"
      value={email}
      onChange={e=>setEmail(e.target.value)}
    />

    <input
      className="w-full border p-2 rounded mb-4"
      type="password"
      placeholder="password"
      value={password}
      onChange={e=>setPassword(e.target.value)}
    />

    <button
      className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      onClick={submit}
      disabled={loading}
    >
      {loading ? 'Registrando…' : 'Registrar'}
    </button>
    {error && (
      <p className="text-red-600 mt-4">{error}</p>
    )}
  </div>
)
  }

