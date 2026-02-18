"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from '../libsupabase'

export default function Dashboard(){
  const router = useRouter()
  const [numero, setNumero] = useState(null)
  const [userEmail, setUserEmail] = useState('')
  const [role, setRole] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      router.push('/login')
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        router.push('/login')
      } else {
        setUserEmail(data.session.user.email || '')
        setRole(data.session.user.user_metadata?.role || '')
        const exp = data.session.user.user_metadata?.expires
        if (exp && new Date(exp) < new Date()) {
          // membership expired - revoke premium role
          supabase.auth.update({ data: { ...data.session.user.user_metadata, role: 'user' }})
          setRole('user')
        }
      }
      setChecking(false)
    })
  }, [router])

  function generar(){
    setNumero(Math.floor(Math.random()*100))
  }


  if (checking) return <div>Cargando...</div>

  return (
    <div className="max-w-md mx-auto p-8">

      <h1 className="text-2xl font-bold">Dashboard</h1>
      {userEmail && <p className="mt-2">Bienvenido, {userEmail}</p>}
      <p className="mt-2"><a href="/predictions" className="text-green-500">Ver predicciones</a></p>
      <p className="mt-2"><a href="/profile" className="text-blue-500">Editar perfil</a></p>
      {role === 'admin' && (
        <p className="mt-2">
          <a href="/admin" className="text-red-500">Panel de administrador</a>
        </p>
      )}

      {/* Botón Membresía */}
      <a 
        href="https://pagar.ualabis.com.ar/order/bb1f258c3dd4ba74d5d767ebdb36d69852ca6226d54ef4ff"
        target="_blank"
      >
        <button>Comprar membresía</button>
      </a>

      <br /><br />

      {/* Botón Generar */}
      <button onClick={generar}>
        Generar
      </button>

      <br /><br />

      {/* Logout */}
      <button onClick={async () => {
        const supabase = getSupabase()
        await supabase.auth.signOut()
        router.push('/login')
      }}>
        Cerrar sesión
      </button>

      {numero !== null && <h2>{numero}</h2>}

    </div>
  )
}
