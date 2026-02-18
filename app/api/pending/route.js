import path from 'path'
import fs from 'fs'

export async function GET() {
  const dataDir = path.join(process.cwd(), 'data')
  const pendingJsonl = path.join(dataDir, 'pending_draws.jsonl')
  
  // if file doesn't exist, return empty array
  if (!fs.existsSync(pendingJsonl)) {
    return Response.json([], { status: 200 })
  }

  try {
    const content = fs.readFileSync(pendingJsonl, 'utf-8')
    const rows = content
      .split('\n')
      .filter(line => line.trim())
      .map((line, idx) => ({
        id: idx,
        ...JSON.parse(line),
        status: 'pending'
      }))
    
    return Response.json(rows, { status: 200 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
