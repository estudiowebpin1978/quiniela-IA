/* eslint-disable @typescript-eslint/no-require-imports */
// Small helper to create a Supabase user via anon key (signup)
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const env = fs.readFileSync('.env.local', 'utf8')
const vars = {}
env.split(/\r?\n/).forEach(line => {
  const m = line.match(/^([A-Z_]+)=(.+)$/)
  if (m) vars[m[1]] = m[2].replace(/^"|"$/g, '')
})

const SUPABASE_URL = vars.NEXT_PUBLIC_SUPABASE_URL
const ANON = vars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !ANON) {
  console.error('Missing SUPABASE URL or anon key in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, ANON)

const args = process.argv.slice(2)
if (args.length < 2) {
  console.log('Usage: node create-user.js <email> <password>')
  process.exit(1)
}

const [email, password] = args

async function run() {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    console.error('Error creating user:', error.message)
    process.exit(1)
  }
  console.log('User created (or confirmation sent):', data)
}

run()
