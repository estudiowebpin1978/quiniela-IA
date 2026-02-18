/* eslint-disable @typescript-eslint/no-require-imports */
// Create a Supabase user using the service role key (admin) for testing
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

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

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const args = process.argv.slice(2)
if (args.length < 2) {
  console.log('Usage: node create-user-admin.js <email> <password>')
  process.exit(1)
}

const [email, password] = args

async function run() {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'user' }
    })
    if (error) {
      console.error('Error creating user:', error.message || error)
      process.exit(1)
    }
    console.log('User created (admin):', data)
  } catch (err) {
    console.error('Unexpected error:', err.message || err)
    process.exit(1)
  }
}

run()
