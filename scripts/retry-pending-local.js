#!/usr/bin/env node
/**
 * Reintenta todas las filas pendientes localmente:
 * - Valida formato JSON
 * - Verifica campos obligatorios
 * - Reporta validez de cada fila
 * - Limpia archivo si todas son válidas
 */

const fs = require('fs')
const path = require('path')

const dataDir = path.join(process.cwd(), 'data')
const pendingJsonl = path.join(dataDir, 'pending_draws.jsonl')

function retryPendingLocal() {
  console.log('\n=== Validando filas pendientes localmente ===\n')

  if (!fs.existsSync(pendingJsonl)) {
    console.log('✅ No hay filas pendientes (archivo no existe)')
    return
  }

  const content = fs.readFileSync(pendingJsonl, 'utf-8')
  const lines = content.split('\n').filter(l => l.trim())

  if (lines.length === 0) {
    console.log('✅ No hay filas pendientes (archivo vacío)')
    return
  }

  let validCount = 0
  let invalidLines = []

  console.log(`📋 Total de filas a validar: ${lines.length}\n`)

  lines.forEach((line, idx) => {
    try {
      const payload = JSON.parse(line)

      // Validar campos obligatorios
      if (!payload.date || !payload.numbers || !Array.isArray(payload.numbers)) {
        console.log(`❌ Fila ${idx}: formato inválido (falta date o numbers)`)
        invalidLines.push(line)
        return
      }

      if (payload.numbers.length === 0) {
        console.log(`❌ Fila ${idx}: array numbers vacío`)
        invalidLines.push(line)
        return
      }

      // Validación exitosa
      const turno = payload.turno || 'Turno desconocido'
      console.log(`✅ Fila ${idx}: válida (${payload.date} - ${turno})`)
      validCount++
    } catch (parseErr) {
      console.log(`❌ Fila ${idx}: JSON inválido - ${parseErr.message}`)
      invalidLines.push(line)
    }
  })

  // Guardar solo las líneas inválidas
  if (invalidLines.length === 0) {
    fs.writeFileSync(pendingJsonl, '')
    console.log(`\n✅ ${validCount}/${lines.length} filas son válidas. pending_draws.jsonl limpiado (listo para retry via API).`)
  } else {
    fs.writeFileSync(pendingJsonl, invalidLines.join('\n') + '\n')
    console.log(`\n⚠️  ${validCount}/${lines.length} filas válidas, ${invalidLines.length} inválidas aún en pending_draws.jsonl`)
  }
}

retryPendingLocal()
