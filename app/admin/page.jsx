'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../libsupabase'

export default function Page() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        router.push('/login')
      } else {
        const r = data.session.user.user_metadata?.role
        if (r !== 'admin') {
          router.push('/dashboard')
        }
      }
      setChecking(false)
    })
  }, [router])

  if (checking) return <div>Cargando...</div>

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold">Panel de administrador</h1>
      <p className="mt-4">Aquí podrías gestionar usuarios, roles, etc.</p>
    </div>
  )
}
