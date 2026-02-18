import { createClient } from '@supabase/supabase-js'

// helper to create a client at runtime. throws if env vars are missing so
// callers can handle or log the error rather than silently creating an invalid
// client that will crash later.
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    // environment not configured yet; callers will handle null return
    return null
  }
  return createClient(url, key)
}
