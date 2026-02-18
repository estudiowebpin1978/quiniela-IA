export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return Response.json(
      { error: 'Supabase not configured' },
      { status: 500 }
    )
  }

  try {
    // SQL to create draws table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.draws (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT NOW(),
        date DATE NOT NULL,
        numbers INTEGER[] NOT NULL,
        province TEXT DEFAULT 'Nacional',
        turno TEXT DEFAULT 'Mañana',
        source TEXT,
        UNIQUE(date, province, turno)
      );
      
      CREATE INDEX IF NOT EXISTS idx_draws_date ON draws(date DESC);
      CREATE INDEX IF NOT EXISTS idx_draws_turno ON draws(turno);
    `

    // Check if table exists by attempting to fetch from it
    const headers = {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`
    }

    const checkUrl = supabaseUrl.replace(/\/$/, '') + '/rest/v1/draws?limit=1'
    const checkReq = await fetch(checkUrl, {
      headers
    })

    if (checkReq.status === 404) {
      return Response.json({
        warning: 'Table draws does not exist. Please run SQL manually in Supabase Dashboard:',
        sql: createTableSQL,
        next: 'Go to Supabase > SQL Editor and paste the SQL above, then click Run'
      })
    }

    return Response.json({
      ok: true,
      message: 'Table draws exists'
    })
  } catch (err) {
    return Response.json({
      error: err.message,
      hint: 'Check Supabase credentials in .env.local'
    }, { status: 500 })
  }
}
