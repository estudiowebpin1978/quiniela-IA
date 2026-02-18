import path from 'path'
import fs from 'fs'

export async function POST(req) {
  const { id } = await req.json()

  const dataDir = path.join(process.cwd(), 'data')
  const pendingJsonl = path.join(dataDir, 'pending_draws.jsonl')

  if (!fs.existsSync(pendingJsonl)) {
    return Response.json({ error: 'No pending draws' }, { status: 404 })
  }

  try {
    const content = fs.readFileSync(pendingJsonl, 'utf-8')
    const lines = content.split('\n').filter(l => l.trim())
    if (id < 0 || id >= lines.length) {
      return Response.json({ error: 'Invalid id' }, { status: 400 })
    }

    const payload = JSON.parse(lines[id])
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return Response.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    // Try to insert via REST API
    const url = supabaseUrl.replace(/\/$/, '') + '/rest/v1/draws'
    const headers = {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: 'return=representation'
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    if (response.ok) {
      // Remove line from JSONL (by rewriting file without this line)
      const updatedLines = lines.filter((_, idx) => idx !== id).join('\n')
      fs.writeFileSync(pendingJsonl, updatedLines + (updatedLines ? '\n' : ''))
      return Response.json({ ok: true, message: 'Inserted and removed from pending' })
    }

    const errorData = await response.text()
    return Response.json(
      { error: errorData, status: response.status },
      { status: response.status }
    )
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
