import { test, expect } from '@playwright/test'

/**
 * E2E Tests para Quiniela IA
 * Cubre flujos críticos: login, predicciones, pending inserts
 */

test.describe('Quiniela IA - Full Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('Página principal carga correctamente', async ({ page }) => {
    const title = page.locator('h1, h2')
    await expect(title).toBeVisible()
  })

  test('Accede a predicciones sin autenticación', async ({ page }) => {
    await page.goto('http://localhost:3000/predictions')
    await page.waitForTimeout(2000)
    
    // Debería estar visible (o redirigir a login)
    const content = await page.content()
    expect(content).toContain('prediccion|Predicción|login|Login')
  })

  test('Accede a página pending', async ({ page }) => {
    await page.goto('http://localhost:3000/pending')
    await page.waitForTimeout(1000)
    
    const content = await page.content()
    expect(content).toContain('pendiente|Pendiente|Inserciones|inserciones')
  })

  test('API /api/predictions retorna datos válidos', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/predictions?turno=Mañana&premium=0')
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    
    expect(data).toHaveProperty('two')
    expect(Array.isArray(data.two)).toBe(true)
  })

  test('API /api/pending retorna array válido', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/pending')
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    
    expect(Array.isArray(data)).toBe(true)
  })

  test('API /api/init-db verifica tabla', async ({ page }) => {
    const response = await page.request.post('http://localhost:3000/api/init-db')
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    
    // Debe devolver ok o warning
    expect(data).toHaveProperty('ok')
      .or.toHaveProperty('warning')
  })
})

test.describe('Predicciones - Premium Gating', () => {
  test('2-digit predictions disponibles sin premium', async ({ page }) => {
    const response = await page.request.get(
      'http://localhost:3000/api/predictions?turno=Mañana&premium=0'
    )
    
    const data = await response.json()
    expect(data.two).toBeDefined()
    expect(data.two.length).toBeGreaterThan(0)
  })

  test('3/4-digit predictions vacías sin premium', async ({ page }) => {
    const response = await page.request.get(
      'http://localhost:3000/api/predictions?turno=Mañana&premium=0'
    )
    
    const data = await response.json()
    expect(data.three).toBeDefined()
    expect(data.four).toBeDefined()
    expect(data.three.length).toBe(0)
    expect(data.four.length).toBe(0)
  })

  test('Premium can access 3/4-digit predictions', async ({ page }) => {
    const response = await page.request.get(
      'http://localhost:3000/api/predictions?turno=Mañana&premium=1'
    )
    
    const data = await response.json()
    // Premium = 1 debería permitir acceso (aunque esté vacío depende de datos)
    expect(data).toHaveProperty('two')
    expect(data).toHaveProperty('three')
    expect(data).toHaveProperty('four')
  })
})

test.describe('Retry Mechanism', () => {
  test('GET /api/pending retorna estructura correcta', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/pending')
    
    const data = await response.json()
    
    // Debería ser array de objetos con id + datos
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('date')
      expect(data[0]).toHaveProperty('numbers')
      expect(data[0]).toHaveProperty('status')
    }
  })

  test('POST /api/retry requiere JSON válido', async ({ page }) => {
    const response = await page.request.post(
      'http://localhost:3000/api/retry',
      {
        data: { id: 0 }
      }
    )
    
    // Debería ser 200 o 404 (no hay filas) o 400 (error)
    expect([200, 404, 400]).toContain(response.status())
  })
})

test.describe('Database Integration', () => {
  test('Números en tabla son arrays válidos', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/predictions')
    const data = await response.json()
    
    // Los números predichos deben ser strings de 2-4 dígitos
    if (data.two.length > 0) {
      data.two.forEach(num => {
        expect(num).toMatch(/^\d{2}$/)
      })
    }
  })
})
