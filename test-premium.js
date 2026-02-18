#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Script de testing: Simula un pago Ualá via webhook
 * Uso: node test-premium.js <email-o-userid>
 * 
 * Ejemplo:
 *   node test-premium.js test@example.com
 *   node test-premium.js 12345-67890-abcde
 */

const http = require('http')

const args = process.argv.slice(2)
if (args.length === 0) {
  console.log('❌ Uso: node test-premium.js <email-o-userid>')
  console.log('Ejemplo: node test-premium.js test@example.com')
  process.exit(1)
}

const identifier = args[0]
const isEmail = identifier.includes('@')

const payload = {
  [isEmail ? 'email' : 'user_id']: identifier,
  status: 'success',
  amount: 9.99,
  currency: 'USD',
  transaction_id: `test_${Date.now()}`,
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
}

const body = JSON.stringify(payload)

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/webhooks/uala?test=1',  // ?test=1 ignora la firma en desarrollo
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'x-uala-signature': 'test-mode', // modo test, se ignora
  },
}

console.log('🧪 Enviando solicitud webhook de prueba...')
console.log(`📧 Identificador: ${identifier}`)
console.log(`💳 Estado: ${payload.status}`)
console.log(`⏰ Expira: ${payload.expires_at}`)
console.log('')

const req = http.request(options, (res) => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    console.log(`✅ Status: ${res.statusCode}`)
    console.log('')
    console.log('📋 Respuesta:')
    try {
      const response = JSON.parse(data)
      console.log(JSON.stringify(response, null, 2))
    } catch {
      console.log(data)
    }

    if (res.statusCode === 200) {
      console.log('')
      console.log('🎉 ¡Pago simulado exitosamente!')
      console.log(`📍 Ahora: http://localhost:3000/predictions`)
      console.log('   Deberías ver números Premium 3-4 cifras')
    }
  })
})

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`)
  process.exit(1)
})

req.write(body)
req.end()
