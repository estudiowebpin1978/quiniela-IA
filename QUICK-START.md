# ⚡ INICIO RÁPIDO: Probar la app Quiniela

## 🎯 En 5 minutos, tendrás la app funcionando

### 1️⃣ Clonar/codeación del repositorio
```bash
cd quiniela-ia
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Configurar `.env.local` (⚠️ OBLIGATORIO)

**A) Obtener credenciales Supabase:**
- Ve a: https://supabase.com/dashboard
- Tu proyecto > Settings ⚙️ > API
- Copia:
  - URL (https://...)
  - anon public key
  - service_role secret (click Reveal)

**B) Crear `.env.local` en raíz:**
```bash
# En VS Code: Ctrl+Shift+P > "Create: New File"
# Nombre: .env.local
```

**C) Pegar contenido:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 4️⃣ Poblar datos históricos
```bash
# Opción A: Python script (recomendado)
pip install supabase-py
python app/ia/seed_draws.py

# Opción B: SQL directo en Supabase Console
# Copia contenido de: supabase-seed.sql
# En: https://supabase.com > SQL Editor > Run
```

### 5️⃣ Iniciar el servidor
```bash
npm run dev
```

Abre: http://localhost:3000

---

## ✅ Testing rápido (copiar/pegar)

### Test 1: Registrarse
```
URL: http://localhost:3000/register
Email: test@example.com
Password: Test123!@#
→ Click "Registrarse"
```

### Test 2: Login
```
URL: http://localhost:3000/login
Email: test@example.com
Password: Test123!@#
→ Click "Iniciar Sesión"
→ Redirige a /dashboard (Versión Gratuita)
```

### Test 3: Simular pago Premium
```bash
# En otra terminal (con npm run dev corriendo):
npm run test:premium test@example.com
```

**Respuesta esperada:**
```
✅ Status: 200
🎉 ¡Pago simulado exitosamente!
```

### Test 4: Ver predicciones Premium
```
1. Actualiza /dashboard → ahora dice "Miembro Premium"
2. Ve a /predictions
3. Verás:
   - 2 Cifras (Gratis): números azules
   - 3 Cifras (Premium): números verdes
   - 4 Cifras (Premium): números morados
```

---

## 🐛 Si algo no funciona

| Error | Solución |
|-------|----------|
| "Supabase no configurado" | Verifica `.env.local` existe |
| "Tabla no existe" | Ejecuta script seed (paso 4) |
| Predict ciones vacías | Asegúrate tabla `draws` tiene datos |
| Webhook retorna 401 | Usa `npm run test:premium` (incluye ?test=1) |
| Build falla | `npm run lint` y revisa errores |

---

## 📚 Documentación completa

- `PASO-1-POBLAR-DRAWS.md` - Detalles de seed
- `PASO-2-CONFIG-ENV.md` - Detalles de .env.local
- `PASO-3-TESTING-FLUJO.md` - Testing exhaustivo
- `RESUMEN-FINAL.md` - Resumen completo

---

## 🚀 Después de validar esto...

1. Integrar pagos reales de Ualá
2. Implementar scraper real de Quiniela
3. Entrenar modelo ML con datos reales
4. Hacer deploy a Vercel/producción

---

**¡Listo! Comienza con el Step 1 arriba ⬆️**
