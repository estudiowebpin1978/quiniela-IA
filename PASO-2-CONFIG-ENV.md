# 🔐 GUÍA: Configurar `.env.local` con Supabase

## Paso 1: Obtener credenciales de Supabase

### 1.1 Crear/Acceder a proyecto Supabase
1. Ve a https://supabase.com/
2. Click **"Start your project"** (o accede si ya tienes cuenta)
3. Crea un nuevo proyecto o selecciona uno existente

### 1.2 Obtener `NEXT_PUBLIC_SUPABASE_URL`
```
Supabase Dashboard
├─ Settings (engranaje 🔧)
├─ API
└─ URL → Copiar aquí en el cuadro gris (https://xxxxx.supabase.co)
```
**Ejemplo:**
```
https://dvqczyjsizxqmkohfcfn.supabase.co
```

### 1.3 Obtener `NEXT_PUBLIC_SUPABASE_ANON_KEY`
```
Supabase Dashboard
├─ Settings (engranaje 🔧)
├─ API
└─ anon public → Copiar llave (eyJhbGc...)
```
**Ejemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJl...
```

### 1.4 Obtener `SUPABASE_SERVICE_ROLE_KEY` ⚠️
```
Supabase Dashboard
├─ Settings (engranaje 🔧)
├─ API
└─ service_role secret → Copiar llave
   (Si no la ves, click "Reveal" o "Show")
```
**⚠️ IMPORTANTE:** Esta es tu **llave privada**
- 🔒 **NUNCA** la compartas o subas a GitHub
- 🔒 **NUNCA** la uses en el cliente (frontend)
- ✅ Solo en archivos `.env.local` (está en `.gitignore`)

---

## Paso 2: Crear/Editar `.env.local`

### Ubicación:
```
quiniela-ia/
├─ .env.local         ← CREAR AQUÍ (raíz del proyecto)
├─ .env.example       ← Template referencia
├─ package.json
└─ ...
```

### Crear archivo `.env.local`:
```bash
# PowerShell
New-Item -Path ".\.env.local" -ItemType File
```

O simplemente abrirlo en VS Code:
- Ctrl+Shift+P → "Create: New File"
- Nombre: `.env.local`

### Contenido de `.env.local`:
```env
# Supabase - Credenciales públicas
NEXT_PUBLIC_SUPABASE_URL=https://dvqczyjsizxqmkohfcfn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...

# Supabase - Credencial privada (SOLO SERVIDOR)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...

# (Opcional) Webhooks Ualá
UALA_WEBHOOK_SECRET=tu-secret-webhook-uala
```

---

## Paso 3: Reemplazar credenciales en el template

**NO hagas esto:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co  ❌
```

**HAZ ESTO:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://dvqczyjsizxqmkohfcfn.supabase.co  ✅
```

### Copia el template:
```env
# ===== SUPABASE =====
NEXT_PUBLIC_SUPABASE_URL=AQUI_VA_TU_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=AQUI_VA_TU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=AQUI_VA_TU_SERVICE_KEY

# ===== WEBHOOKS =====
UALA_WEBHOOK_SECRET=opcional-por-ahora
```

---

## Paso 4: Verificar configuración

### Test 1: Que Next.js lea las variables
```bash
npm run build
```
**Esperado:** Sin errores de variables indefinidas

### Test 2: Conexión a Supabase (desde terminal)
```bash
# Crear un script temporal de test
cat > test-supabase.js << 'EOF'
const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.log('❌ Falta configurar .env.local')
  process.exit(1)
}

const supabase = createClient(url, key)
console.log('✅ Supabase configurado correctamente')
console.log('URL:', url)
EOF

node test-supabase.js
```

### Test 3: Verificar que Next.js usa las variables
```bash
npm run dev
```
En el servidor, verás:
```
- Environments: .env.local
```

---

## Solución de problemas

### ❌ "Cannot find module: getSupabase"
**Causa:** `.env.local` no existe o variables no están definidas
**Solución:**
1. Verifica que `.env.local` está en raíz (junto a `package.json`)
2. Verifica que NO está vacío
3. Reinicia el servidor: `npm run dev`

### ❌ "Supabase no configurado" (en la app)
**Causa:** Variables de Supabase inválidas o faltantes
**Solución:**
1. Verifica credenciales en https://supabase.com/dashboard
2. Copia nuevamente (sin espacios/saltos)
3. Guarda `.env.local` (Ctrl+S)
4. Reinicia: `npm run dev`

### ❌ "Invalid API key"
**Causa:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` mal copiada
**Solución:**
1. Ve a Supabase > Settings > API
2. Click **"Reveal"** si está oculta
3. Copia completa (desde `eyJ...` hasta el final)

### ❌ Error 401/403 en predicciones
**Causa:** `SUPABASE_SERVICE_ROLE_KEY` incorrecta
**Solución:**
1. Ve a Supabase > Settings > API
2. Busca **"service_role secret"** (no "anon")
3. Si no la ves, click **"Reveal" o "Show"**

---

## ✅ Checklist final

- [ ] Archivo `.env.local` creado en raíz
- [ ] `NEXT_PUBLIC_SUPABASE_URL` pegada correctamente
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` pegada correctamente
- [ ] `SUPABASE_SERVICE_ROLE_KEY` pegada correctamente
- [ ] `.env.local` está en `.gitignore` (no subas a GitHub)
- [ ] Reiniciaste `npm run dev`
- [ ] Test de compilación pasa: `npm run build`

---

## Próximo paso:
→ **PASO 3**: Probar flujo completo (Registrarse → Premium → Predicciones)
