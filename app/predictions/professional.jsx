"use client"
import { useEffect, useState, useCallback } from 'react'
import { getSupabase } from '../libsupabase'
import ThreeScene from '../components/ThreeScene'

export default function PredictionsPage() {
  // router removed (unused)
  const [predictions, setPredictions] = useState(null)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [premiumExpires, setPremiumExpires] = useState(null)
  const [loading, setLoading] = useState(true)
  const [province, setProvince] = useState('Nacional')
  const [turno, setTurno] = useState('Mañana')

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setError('Supabase no configurado')
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        setUserEmail(data.session.user.email)
        const role = data.session.user.user_metadata?.role
        const expires = data.session.user.user_metadata?.premium_expires
        setIsPremium(role === 'premium')
        if (expires) {
          const expiresDate = new Date(expires)
          if (expiresDate < new Date()) {
            // Premium expirado
            setIsPremium(false)
          } else {
            setPremiumExpires(expiresDate)
          }
        }
      }
      setLoading(false)
    })
  }, [])

  const fetchPredictions = useCallback(async () => {
    const params = new URLSearchParams()
    if (province) params.append('province', province)
    if (turno) params.append('turno', turno)
    if (isPremium) params.append('premium', '1')

    try {
      const resp = await fetch(`/api/predictions?${params}`)
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error)
      setPredictions(data)
    } catch (err) {
      setError(err.message)
    }
  }, [province, turno, isPremium])

  useEffect(() => {
    if (!loading) {
      fetchPredictions()
    }
  }, [fetchPredictions, loading])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-gray-400">
        Cargando...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Predicciones de Quiniela</h1>
        {userEmail && <p className="text-gray-400 mb-6">Conectado como: {userEmail}</p>}

        {/* Status Premium */}
        {isPremium && (
          <div className="bg-green-900 border border-green-500 rounded p-4 mb-6">
            ✓ Miembro Premium activo
            {premiumExpires && (
              <span className="ml-4 text-sm">
                (Vence: {premiumExpires.toLocaleDateString()})
              </span>
            )}
          </div>
        )}
        {!isPremium && (
          <div className="bg-amber-900 border border-amber-500 rounded p-4 mb-6">
            Versión Gratuita - Ver solo 10 números de 2 cifras
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-500 rounded p-4 mb-6 text-red-200">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm mb-2">Provincia</label>
            <input
              className="w-full bg-gray-700 border border-gray-600 p-2 rounded text-white"
              value={province}
              onChange={e => setProvince(e.target.value)}
              placeholder="Nacional"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Turno</label>
            <select
              className="w-full bg-gray-700 border border-gray-600 p-2 rounded text-white"
              value={turno}
              onChange={e => setTurno(e.target.value)}
            >
              <option>Mañana</option>
              <option>Tarde</option>
              <option>Noche</option>
            </select>
          </div>
        </div>

        {/* Escena 3D */}
        {predictions?.two && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Números más probables (2 cifras)</h2>
            <ThreeScene numbers={predictions.two.map(n => parseInt(n))} />
          </div>
        )}

        {/* Predicciones */}
        {predictions && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 2 cifras */}
            <div className="bg-gray-800 border border-blue-500 rounded-lg p-6">
              <h3 className="text-xl font-bold text-blue-400 mb-4">2 Cifras (Gratis)</h3>
              <div className="grid grid-cols-5 gap-2">
                {predictions.two.map((n, i) => (
                  <div
                    key={i}
                    className="bg-blue-600 rounded p-3 text-center font-bold text-lg hover:bg-blue-500 transition"
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>

            {/* 3 cifras - Premium */}
            {isPremium && predictions.three ? (
              <div className="bg-gray-800 border border-green-500 rounded-lg p-6">
                <h3 className="text-xl font-bold text-green-400 mb-4">3 Cifras (Premium)</h3>
                <div className="grid grid-cols-2 gap-2">
                  {predictions.three.map((n, i) => (
                    <div
                      key={i}
                      className="bg-green-600 rounded p-3 text-center font-bold text-lg hover:bg-green-500 transition"
                    >
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              isPremium === false && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 text-gray-400">
                  <h3 className="text-xl font-bold mb-4">3 Cifras (Premium)</h3>
                  <p className="text-sm">Suscríbete para acceder</p>
                </div>
              )
            )}

            {/* 4 cifras - Premium */}
            {isPremium && predictions.four ? (
              <div className="bg-gray-800 border border-purple-500 rounded-lg p-6">
                <h3 className="text-xl font-bold text-purple-400 mb-4">4 Cifras (Premium)</h3>
                <div className="grid grid-cols-1 gap-2">
                  {predictions.four.map((n, i) => (
                    <div
                      key={i}
                      className="bg-purple-600 rounded p-3 text-center font-bold text-lg hover:bg-purple-500 transition"
                    >
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              isPremium === false && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 text-gray-400">
                  <h3 className="text-xl font-bold mb-4">4 Cifras (Premium)</h3>
                  <p className="text-sm">Suscríbete para acceder</p>
                </div>
              )
            )}
          </div>
        )}

        {!isPremium && (
          <div className="mt-8 text-center">
            <button className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition">
              Upgrade a Premium
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
