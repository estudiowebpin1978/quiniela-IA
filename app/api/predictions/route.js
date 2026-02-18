import { createClient } from '@supabase/supabase-js'

export async function GET(req) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: 'Supabase no configurado' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  const { searchParams } = new URL(req.url)
  const province = searchParams.get('province') || 'Nacional'
  const turno = searchParams.get('turno') || 'Mañana'
  const premium = searchParams.get('premium') === '1'

  try {
    // Cargar últimos 100 sorteos (filtrados por provincia/turno si aplica)
    let query = supabase.from('draws').select('numbers').limit(100)
    
    if (province && province !== 'todas') {
      query = query.eq('province', province)
    }
    if (turno && turno !== 'todos') {
      query = query.eq('turno', turno)
    }

    const { data: draws, error } = await query.order('created_at', { ascending: false })
    if (error) throw error

    if (!draws || draws.length === 0) {
      return Response.json(
        { two: [], three: [], four: [] },
        { status: 200 }
      )
    }

    // Calcular frecuencias
    const freq2 = {}
    const freq3 = {}
    const freq4 = {}

    draws.forEach(draw => {
      if (!draw.numbers || !Array.isArray(draw.numbers)) return

      // 2 cifras (últimos 2 dígitos)
      const twoDigit = String(draw.numbers[draw.numbers.length - 1]).padStart(2, '0')
      freq2[twoDigit] = (freq2[twoDigit] || 0) + 1

      // 3 cifras
      if (draw.numbers.length >= 2) {
        const threeDigit =
          String(draw.numbers[draw.numbers.length - 2]).padStart(2, '0') +
          String(draw.numbers[draw.numbers.length - 1]).padStart(2, '0')
        freq3[threeDigit] = (freq3[threeDigit] || 0) + 1
      }

      // 4 cifras
      if (draw.numbers.length >= 3) {
        const fourDigit =
          String(draw.numbers[draw.numbers.length - 3]).padStart(2, '0') +
          String(draw.numbers[draw.numbers.length - 2]).padStart(2, '0') +
          String(draw.numbers[draw.numbers.length - 1]).padStart(2, '0')
        freq4[fourDigit] = (freq4[fourDigit] || 0) + 1
      }
    })

    // Top números por categoría
    const getTop = (freq, limit) => {
      return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([num]) => num)
    }

    const two = getTop(freq2, 10)
    const three = premium ? getTop(freq3, 5) : []
    const four = premium ? getTop(freq4, 2) : []

    return Response.json({ two, three, four }, { status: 200 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
