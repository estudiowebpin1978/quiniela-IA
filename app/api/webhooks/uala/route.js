import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Clave secreta del webhook (guárdala en tu .env)
const WEBHOOK_SECRET = process.env.UALA_WEBHOOK_SECRET || 'test-secret'

function validateWebhookSignature(body, signature) {
  const hash = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex')
  return hash === signature
}

export async function POST(req) {
  console.log('[Webhook] Solicitud recibida')

  const url = new URL(req.url)
  const isTestMode = url.searchParams.get('test') === '1'

  // Validación de firma (saltable en modo test para desarrollo)
  const signature = req.headers.get('x-uala-signature')
  
  let rawBody
  try {
    rawBody = await req.text()
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!isTestMode && !signature) {
    return Response.json({ error: 'No signature provided' }, { status: 401 })
  }

  if (!isTestMode && !validateWebhookSignature(rawBody, signature)) {
    console.log('[Webhook] Firma inválida')
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Destructuración segura
  const { user_id, email, status, expires_at, transaction_id } = payload

  if (!user_id && !email) {
    return Response.json(
      { error: 'Must provide user_id or email' },
      { status: 400 }
    )
  }

  // Conectar a Supabase con service role (permite actualizar usuarios)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('[Webhook] Falta configuración de Supabase')
    return Response.json(
      { error: 'Configuration error' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    // Determina si la membresía es activa
    const isPremium = status === 'paid' || status === 'success' || status === 'active'
    const expiresDate = expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    // Buscar usuario por ID o email
    let targetUserId = user_id

    if (!targetUserId && email) {
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users?.users?.find(u => u.email === email)
      if (!user) {
        return Response.json({ error: 'User not found' }, { status: 404 })
      }
      targetUserId = user.id
    }

    // Actualiza el usuario con nuevo role y expiración
    const { error } = await supabase.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        role: isPremium ? 'premium' : 'user',
        premium_expires: expiresDate,
        last_payment: new Date().toISOString(),
        transaction_id: transaction_id || null,
      },
    })

    if (error) {
      console.error('[Webhook] Error actualizando usuario:', error)
      return Response.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log(`[Webhook] Usuario ${targetUserId} actualizado: role=${isPremium ? 'premium' : 'user'}`)

    return Response.json(
      {
        ok: true,
        message: 'User updated successfully',
        user_id: targetUserId,
        role: isPremium ? 'premium' : 'user',
        expires_at: expiresDate,
        test_mode: isTestMode,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('[Webhook] Error inesperado:', err)
    return Response.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
