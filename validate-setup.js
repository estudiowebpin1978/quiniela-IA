#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Script de validación: Verifica que Supabase esté correctamente configurado
 * Uso: node validate-setup.js
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Validando configuración de Supabase...\n')

// 1. Verificar .env.local existe
console.log('1️⃣  Verificando archivo .env.local...')
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local no encontrado en:', envPath)
  process.exit(1)
}
console.log('✅ .env.local existe\n')

// 2. Leer .env.local
console.log('2️⃣  Verificando variables de entorno...')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([A-Z_]+)=(.+)$/)
  if (match) {
    envVars[match[1]] = match[2]
  }
})

// 3. Validar variables críticas
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
]

let allValid = true
requiredVars.forEach(varName => {
  if (envVars[varName] && envVars[varName].trim() && envVars[varName] !== '""') {
    console.log(`  ✅ ${varName}: configurada`)
  } else {
    console.log(`  ❌ ${varName}: FALTA o está vacía`)
    allValid = false
  }
})

if (!allValid) {
  console.log('\n⚠️  Algunas variables están faltando. Ejecuta:')
  console.log('   cat .env.example')
  console.log('   # Copia los valores de Supabase > Settings > API')
  process.exit(1)
}

console.log('\n3️⃣  Verificando que Next.js puede leerlas...')
try {
  require('dotenv').config({ path: '.env.local' })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Variables not loaded')
  }

  console.log(`  ✅ NEXT_PUBLIC_SUPABASE_URL: ${url.substring(0, 30)}...`)
  console.log(`  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${key.substring(0, 30)}...`)
} catch (e) {
  console.log(`  ⚠️  No se pudieron cargar: ${e.message}`)
}

console.log('\n4️⃣  Verificando estructura del proyecto...')
const requiredFiles = [
  'app/libsupabase.js',
  'app/api/predictions/route.js',
  'app/predictions/page.jsx',
  '.env.local'
]

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`)
  } else {
    console.log(`  ⚠️  ${file} (falta o renombrado)`)
  }
})

console.log('\n5️⃣  Verificando tabla SQL necesaria...')
console.log('  Para verificar que tabla "draws" existe:')
console.log('  1. Ve a: https://supabase.com/dashboard')
console.log('  2. Tu proyecto > Table Editor')
console.log('  3. Busca tabla "draws"')
console.log('  4. Si no existe, ejecuta: supabase-create-draws-table.sql')

console.log('\n' + '='.repeat(60))
console.log('✅ VALIDACIÓN COMPLETADA')
console.log('='.repeat(60))
console.log('\nPróximos pasos:')
console.log('1. Asegúrate que tabla "draws" existe en Supabase')
console.log('2. Ejecuta: npm run dev')
console.log('3. Abre: http://localhost:3000')
console.log('4. Registrate y prueba')
