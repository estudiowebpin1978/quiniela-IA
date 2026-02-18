'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../libsupabase'

export default function Page() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setError('Supabase no está configurado. Revisar las variables de entorno.')
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        router.push('/login')
      } else {
        const u = data.session.user
        setUser(u)
        setFullName(u.user_metadata?.fullName || '')
        setRole(u.user_metadata?.role || '')
      }
      setLoading(false)
    })
  }, [router])

  async function updateProfile() {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const supabase = getSupabase()
      if (!supabase) {
        setError('Supabase no está configurado en el entorno')
        setSaving(false)
        return
      }
      const updates = { data: { ...user.user_metadata, fullName } }
      // only admin can change role
      if (role !== user.user_metadata?.role && user.user_metadata?.role === 'admin') {
        updates.data.role = role
      }
      const { error } = await supabase.auth.update(updates)
      if (error) throw error
      setMessage('Perfil actualizado')
    } catch (err) {
      setError(err?.message || JSON.stringify(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Cargando perfil...</div>

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Mi perfil</h2>
      <p>Email: {user.email}</p>
      <div className="mt-4">
        <label className="block mb-1">Nombre completo</label>
        <input
          className="w-full border p-2 rounded"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
        />
      </div>
      <div className="mt-4">
        <label className="block mb-1">Rol</label>
        <select
          className="w-full border p-2 rounded"
          value={role}
          onChange={e => setRole(e.target.value)}
          disabled={user.user_metadata?.role !== 'admin'}
        >
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>
        {user.user_metadata?.role !== 'admin' && (
          <p className="text-sm text-gray-600">(contacta al admin para cambiar)</p>
        )}
      </div>
      <button
        className="mt-6 w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
        onClick={updateProfile}
        disabled={saving}
      >
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
      {message && <p className="text-green-600 mt-4">{message}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
      <p className="mt-4 text-sm">
        <a className="text-blue-500" href="/dashboard">Volver al dashboard</a>
      </p>
    </div>
  )
}
