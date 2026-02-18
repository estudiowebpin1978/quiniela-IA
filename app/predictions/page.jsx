'use client'
import { useEffect, useState, useCallback } from 'react'
import { getSupabase } from '../libsupabase'
import ThreeScene from '../components/ThreeScene'

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState(null)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [premiumExpires, setPremiumExpires] = useState(null)
  const [loading, setLoading] = useState(true)
  const [turno, setTurno] = useState('PRIMERA')
  const [allTurnos] = useState(['PREVIA', 'PRIMERA', 'MATUTINA', 'VESPERTINA', 'NOCTURNA'])

  // Load session
  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setError('Supabase no configurado')
      setLoading(false)
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
          if (expiresDate > new Date()) {
            setPremiumExpires(expiresDate)
          } else {
            setIsPremium(false)
          }
        }
      }
      setLoading(false)
    })
  }, [])

  // Fetch predictions by turno
  const fetchPredictions = useCallback(async () => {
    try {
      const resp = await fetch(`/api/predictions?turno=${turno}&premium=${isPremium ? '1' : '0'}`)
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error)
      setPredictions(data)
      setError('')
    } catch (err) {
      setError(err.message)
      setPredictions(null)
    }
  }, [turno, isPremium])

  // Refetch when turno or premium status changes
  useEffect(() => {
    if (!loading) {
      void fetchPredictions()
    }
  }, [turno, isPremium, loading, fetchPredictions])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4" />
          <p className="text-gray-300">Cargando predicciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            🎰 Predicciones Quiniela
          </h1>
          <p className="text-gray-400">Buenos Aires - Predicciones por frecuencia histórica</p>
          {userEmail && (
            <p className="text-sm text-gray-500 mt-2">Conectado como: <span className="text-yellow-400">{userEmail}</span></p>
          )}
        </div>

        {/* Premium Status Banner */}
        {isPremium ? (
          <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-400 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-green-400">
                ✨ Miembro Premium Activo
              </div>
              {premiumExpires && (
                <p className="text-sm text-gray-300">Vence: {premiumExpires.toLocaleDateString()}</p>
              )}
            </div>
            <span className="text-2xl">👑</span>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border border-amber-400 rounded-lg p-4 mb-6">
            <p className="font-semibold text-amber-300">📊 Modo Gratuito</p>
            <p className="text-sm text-gray-300">Ves predicciones de 2 cifras. <span className="text-amber-300">Upgrade a Premium</span> para ver 3 y 4 cifras.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-400 rounded-lg p-4 mb-6 text-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* Turno Selector */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-300 mb-3">Selecciona Turno:</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {allTurnos.map(t => (
              <button
                key={t}
                onClick={() => setTurno(t)}
                className={`py-2 px-3 rounded-lg font-semibold transition-all ${
                  turno === t
                    ? 'bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/50'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Visualization (if data exists) */}
        {predictions?.two && predictions.two.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">📈 Visualización 3D - Top Números 2 Cifras</h2>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <ThreeScene numbers={predictions.two.map(n => parseInt(n)).slice(0, 5)} />
            </div>
          </div>
        )}

        {/* Predictions Grid */}
        {predictions ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 2 Cifras - Always visible */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border-2 border-blue-400 rounded-lg p-6 hover:shadow-lg hover:shadow-blue-400/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-blue-300">2 Cifras</h3>
                <span className="text-2xl">🎯</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Disponible para todos</p>
              {predictions.two && predictions.two.length > 0 ? (
                <div className="grid grid-cols-5 gap-2">
                  {predictions.two.map((n, i) => (
                    <div
                      key={i}
                      className="bg-blue-600 hover:bg-blue-500 rounded-lg p-3 text-center font-bold text-lg transition-all transform hover:scale-105 cursor-default"
                    >
                      {n}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Sin datos disponibles</p>
              )}
            </div>

            {/* 3 Cifras - Premium */}
            <div
              className={`rounded-lg p-6 border-2 transition-all ${
                isPremium
                  ? 'bg-gradient-to-br from-green-900/30 to-green-900/10 border-green-400 hover:shadow-lg hover:shadow-green-400/20'
                  : 'bg-slate-800/30 border-slate-600 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${isPremium ? 'text-green-300' : 'text-gray-400'}`}>
                  3 Cifras
                </h3>
                <span className="text-2xl">{isPremium ? '🏅' : '🔒'}</span>
              </div>
              <p className={`text-xs mb-4 ${isPremium ? 'text-gray-400' : 'text-gray-500'}`}>
                {isPremium ? 'Acceso Premium' : 'Solo Premium'}
              </p>
              {isPremium && predictions.three && predictions.three.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {predictions.three.map((n, i) => (
                    <div
                      key={i}
                      className="bg-green-600 hover:bg-green-500 rounded-lg p-3 text-center font-bold text-lg transition-all transform hover:scale-105 cursor-default"
                    >
                      {n}
                    </div>
                  ))}
                </div>
              ) : isPremium ? (
                <p className="text-gray-400 text-sm">Sin datos disponibles</p>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400 mb-3">Suscríbete para acceder</p>
                  <button className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-semibold transition-all text-sm">
                    Upgrade Premium
                  </button>
                </div>
              )}
            </div>

            {/* 4 Cifras - Premium */}
            <div
              className={`rounded-lg p-6 border-2 transition-all ${
                isPremium
                  ? 'bg-gradient-to-br from-purple-900/30 to-purple-900/10 border-purple-400 hover:shadow-lg hover:shadow-purple-400/20'
                  : 'bg-slate-800/30 border-slate-600 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${isPremium ? 'text-purple-300' : 'text-gray-400'}`}>
                  4 Cifras
                </h3>
                <span className="text-2xl">{isPremium ? '👑' : '🔒'}</span>
              </div>
              <p className={`text-xs mb-4 ${isPremium ? 'text-gray-400' : 'text-gray-500'}`}>
                {isPremium ? 'Acceso Premium' : 'Solo Premium'}
              </p>
              {isPremium && predictions.four && predictions.four.length > 0 ? (
                <div className="space-y-2">
                  {predictions.four.map((n, i) => (
                    <div
                      key={i}
                      className="bg-purple-600 hover:bg-purple-500 rounded-lg p-3 text-center font-bold text-lg transition-all transform hover:scale-105 cursor-default"
                    >
                      {n}
                    </div>
                  ))}
                </div>
              ) : isPremium ? (
                <p className="text-gray-400 text-sm">Sin datos disponibles</p>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400 mb-3">Suscríbete para acceder</p>
                  <button className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg font-semibold transition-all text-sm">
                    Upgrade Premium
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No hay predicciones disponibles para este turno.</p>
            <p className="text-sm mt-2">Intenta ejecutar: <code className="bg-slate-800 px-2 py-1 rounded">python scripts/ingest_ruta1000.py</code></p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-sm text-gray-400">
          <p className="font-semibold text-gray-300 mb-2">📌 Información:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Los números se actualizan diariamente desde ruta1000.com.ar</li>
            <li>Las predicciones están basadas en frecuencia histórica</li>
            <li>Para Premium: acceso a predicciones de 3 y 4 cifras</li>
            <li>Simula un pago: <code className="bg-slate-700 px-2 py-0.5 rounded text-xs">node test-premium.js email@example.com</code></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
