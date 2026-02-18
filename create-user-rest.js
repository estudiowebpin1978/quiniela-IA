/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const fetch = global.fetch || require('node-fetch')

const env = fs.readFileSync('.env.local', 'utf8')
const vars = {}
env.split(/\r?\n/).forEach(line => {
  const m = line.match(/^([A-Z_]+)=(.+)$/)
  if (m) vars[m[1]] = m[2].replace(/^"|"$/g, '')
})

const SUPABASE_URL = vars.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = vars.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE URL or service role key in .env.local')
  process.exit(1)
}

const args = process.argv.slice(2)
if (args.length < 2) {
  console.log('Usage: node create-user-rest.js <email> <password>')
  process.exit(1)
}
const [email, password] = args

async function run() {
  const url = `${SUPABASE_URL}/auth/v1/admin/users`
  const body = { email, password, email_confirm: true }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    console.log('Status:', res.status)
    console.log(text)
  } catch (err) {
    console.error('Request error:', err.message || err)
    process.exit(1)
  }
}

run()
