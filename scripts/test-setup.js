#!/usr/bin/env node
/**
 * Script de prueba:
 * - Consulta la tabla draws
 * - Prueba la API predictions
 */

const path = require('path')
const fs = require('fs')

// Lee credenciales
const envPath = path.join(process.cwd(), '.env.local')
let envContent = fs.readFileSync(envPath, 'utf-8')

if (envContent.charCodeAt(0) === 0xFEFF) {
  envContent = envContent.slice(1)
}

const envVars = {}
envContent.split('\n').forEach(line => {
  line = line.trim()
  if (!line || line.startsWith('#')) return
  
  const eqIdx = line.indexOf('=')
  if (eqIdx > 0) {
    const key = line.substring(0, eqIdx).trim()
    const value = line.substring(eqIdx + 1).trim()
    envVars[key] = value
  }
})

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL']
const serviceKey = envVars['SUPABASE_SERVICE_ROLE_KEY']

console.log('\n=== Test de Tabla y Predicciones ===\n')

async function testTable() {
  console.log('1️⃣  Consultando tabla draws...\n')
  
  try {
    const url = supabaseUrl.replace(/\/$/, '') + '/rest/v1/draws?limit=1'
    const response = await fetch(url, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    })

    if (!response.ok) {
      console.log(`❌ Error: ${response.status}`)
      const text = await response.text()
      if (text) console.log(`   Detalle: ${text.substring(0, 100)}`)
      return false
    }

    const data = await response.json()
    console.log(`✅ Tabla draws accesible con ${data.length} registros en esta página\n`)
    
    if (data.length > 0) {
      console.log('📋 Registro de ejemplo:')
      const r = data[0]
      console.log(`   - Fecha: ${r.date}`)
      console.log(`   - Turno: ${r.turno}`)
      console.log(`   - Números: ${r.numbers?.slice(0, 3).join('-')}...`)
      console.log(`   - Provincia: ${r.province}`)
      console.log()
    }
    
    return true
  } catch (err) {
    console.error(`❌ Error: ${err.message}\n`)
    return false
  }
}

async function testPredictions() {
  console.log('2️⃣  Probando API predicciones (sin premium)...\n')
  
  try {
    const url = `http://localhost:3000/api/predictions?turno=Mañana&premium=0`
    const response = await fetch(url)

    if (!response.ok) {
      console.log(`❌ Error HTTP: ${response.status}`)
      return
    }

    const data = await response.json()
    
    if (data.error) {
      console.log(`⚠️  Error en API: ${data.error}`)
      return
    }

    console.log('✅ Predicciones (2 cifras):')
    if (data.two && data.two.length > 0) {
      console.log(`   Top 5: ${data.two.slice(0, 5).join(', ')}`)
    } else {
      console.log('   (Sin datos disponibles)')
    }
    
    console.log()
  } catch (err) {
    if (err.message.includes('ECONNREFUSED')) {
      console.log(`⚠️  Servidor local no está corriendo (http://localhost:3000)`)
      console.log(`   Ejecuta: npm run dev`)
    } else {
      console.error(`❌ Error: ${err.message}`)
    }
  }
}

(async () => {
  await testTable()
  await testPredictions()
  console.log('✅ Test completado\n')
})()
