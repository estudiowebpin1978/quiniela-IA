#!/usr/bin/env node
/**
 * Script alternativo sin dependencias:
 * - Muestra instrucciones para crear la tabla manualmente
 * - Reintenta inserciones via API REST de Supabase
 */

const fs = require('fs')
const path = require('path')

// Lee credenciales desde .env.local
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

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Credenciales Supabase no encontradas')
  process.exit(1)
}

console.log('\n=== Verificando tabla y reintentando inserciones ===\n')

async function checkTableExists() {
  try {
    const url = supabaseUrl.replace(/\/$/, '') + '/rest/v1/draws?limit=1'
    const response = await fetch(url, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    })

    if (response.status === 404) {
      console.log('⚠️  La tabla "draws" no existe en Supabase')
      console.log('\n📋 Ejecuta este SQL en Supabase Dashboard > SQL Editor:\n')
      
      const sqlPath = path.join(process.cwd(), 'supabase-create-draws-table.sql')
      const sql = fs.readFileSync(sqlPath, 'utf-8')
      console.log(sql)
      console.log('\n✅ Una vez ejecutado, reintenta este script.')
      return false
    }

    console.log('✅ Tabla "draws" existe en Supabase')
    return true
  } catch (err) {
    console.error('❌ Error verificando tabla:', err.message)
    return false
  }
}

async function retryInserts() {
  console.log('\n=== Reintentando inserciones pendientes ===\n')

  const dataDir = path.join(process.cwd(), 'data')
  const pendingJsonl = path.join(dataDir, 'pending_draws.jsonl')

  if (!fs.existsSync(pendingJsonl)) {
    console.log('✅ No hay filas pendientes')
    return
  }

  const content = fs.readFileSync(pendingJsonl, 'utf-8')
  const lines = content.split('\n').filter(l => l.trim())

  if (lines.length === 0) {
    console.log('✅ No hay filas pendientes')
    return
  }

  console.log(`📋 Total de filas a reintentar: ${lines.length}\n`)

  const restUrl = supabaseUrl.replace(/\/$/, '') + '/rest/v1/draws'
  const headers = {
    'Content-Type': 'application/json',
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Prefer': 'return=representation'
  }

  let successCount = 0
  let failCount = 0
  const failedLines = []

  for (let idx = 0; idx < lines.length; idx++) {
    try {
      const payload = JSON.parse(lines[idx])

      const response = await fetch(restUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const turno = payload.turno || 'Desconocido'
        console.log(`✅ Fila ${idx}: insertada (${payload.date} - ${turno})`)
        successCount++
      } else {
        const text = await response.text()
        console.log(`❌ Fila ${idx}: ${response.status}`)
        failCount++
        failedLines.push(lines[idx])
      }
    } catch (err) {
      console.log(`❌ Fila ${idx}: ${err.message}`)
      failCount++
      failedLines.push(lines[idx])
    }
  }

  // Guardar solo las líneas que fallaron
  if (failedLines.length === 0) {
    fs.writeFileSync(pendingJsonl, '')
    console.log(`\n✅ Todas ${successCount} filas fueron insertadas.`)
  } else {
    fs.writeFileSync(pendingJsonl, failedLines.join('\n') + '\n')
    console.log(`\n📊 Resultados: ${successCount} insertadas, ${failCount} aún pendientes`)
  }
}

(async () => {
  const tableExists = await checkTableExists()
  
  if (tableExists) {
    await retryInserts()
    console.log('\n✅ Proceso completado\n')
  }
})()
