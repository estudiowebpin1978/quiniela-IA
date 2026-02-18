# 🚀 GUÍA FINAL: De credenciales a app funcionando

## 📝 Tienes: Credenciales de Supabase
## 🎯 Quieres: App Quiniela funktionando en 10 minutos

---

## ⚡ PASO 1: Configurar variables de entorno (2 min)

### Abre tu archivo `.env.local`

En VS Code:
```
Ctrl+K Ctrl+O  → Abre la carpeta
Ctrl+P         → Busca ".env.local"
Enter          → Abre el archivo
```

### Actualiza con tus credenciales

Reemplaza los valores `your-...` con los que viste en el email de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**¿Dónde encontrar?**
1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Settings (engranaje 🔧) > API
4. Copia:
   - URL (https://...)
   - `anon public` → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - `service_role secret` (click Reveal) → SUPABASE_SERVICE_ROLE_KEY

### Guardar (Ctrl+S)

---

## ⚡ PASO 2: Crear tabla `draws` en Supabase (3 min)

### Abre SQL Editor de Supabase

```
1. https://supabase.com/dashboard
2. Tu proyecto > SQL Editor (menú izquierdo)
3. Click "New Query"
```

### Copia el SQL

En tu terminal/editor:
```bash
cat supabase-create-draws-table.sql
```

Copia TODO (Ctrl+A > Ctrl+C)

### Pega en Supabase

```
1. Haz click en el área de texto de la query
2. Pega (Ctrl+V)
3. Verás el SQL que crea la tabla draws
```

### Ejecuta (Ctrl+Enter o click RUN)

**Esperado:**
```
✅ Success
Query executed successfully
```

### Verifica que funcionó

En SQL Editor, ejecuta:
```sql
SELECT COUNT(*) FROM draws;
```

**Debe mostrar:** ~450 (30 días × 5 provincias × 3 turnos)

---

## ⚡ PASO 3: Validar configuración (1 min)

```bash
npm run validate
```

**Esperado:**
```
✅ VALIDACIÓN COMPLETADA
✅ .env.local existe
✅ NEXT_PUBLIC_SUPABASE_URL: configurada
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: configurada
✅ SUPABASE_SERVICE_ROLE_KEY: configurada
```

Si algo falla, revisa los errores mostrados.

---

## ⚡ PASO 4: Iniciar Next.js (1 min)

```bash
npm run dev
```

**Esperado:**
```
▲ Next.js 16.1.6
✓ Ready in 1234ms
- Environments: .env.local
```

**Abre en navegador:**
```
http://localhost:3000
```

---

## ⚡ PASO 5: Testing del flujo (3 min)

### 5A. Registrarse

```
URL: http://localhost:3000/register
Email: test@example.com
Password: Test123!@#
Confirmar: Test123!@#
Click: "Registrarse"
```

**Esperado:**
```
✅ Mensaje: "Revisa tu email para confirmar"
```

### 5B. Activar email (opcional en desarrollo)

En Supabase, si el email no se confirma automáticamente:
1. Settings > Authentication
2. Deshabilita "Confirm email" (para desarrollo)
3. O usa Supabase CLI para confirmar manualmente

### 5C. Login

```
URL: http://localhost:3000/login
Email: test@example.com
Password: Test123!@#
Click: "Iniciar Sesión"
```

**Esperado:**
```
✅ Redirige a /dashboard
✅ Muestra: "Conectado como: test@example.com"
✅ Muestra: "Versión Gratuita"
```

### 5D. Ver predicciones

```
URL: http://localhost:3000/predictions
```

**Esperado:**
```
✅ Muestra números (2 cifras) en azul
✅ Números 3-4 cifras: "Bloqueado (Versión Premium)"
✅ Filtros de Provincia y Turno funcionan
```

---

## 💳 BONUS: Simular compra Premium

```bash
npm run test:premium test@example.com
```

```
URL: http://localhost:3000/predictions
# Actualiza la página
```

**Esperado:**
```
✅ Ahora muestra: "✓ Miembro Premium activo"
✅ Números 3-4 cifras en verde y morado
```

---

## ✅ Checklist de validación

- [ ] `.env.local` tiene credenciales Supabase
- [ ] `npm run validate` retorna ✅
- [ ] Tabla `draws` existe en Supabase
- [ ] `npm run dev` inicia sin errores
- [ ] Registro funciona
- [ ] Login funciona
- [ ] Predicciones carga números
- [ ] Filtros funcionan

---

## 🐛 Troubleshooting

### ❌ "Supabase no configurado"
```
Causa: .env.local no tiene variables
Fix:
1. Verifica que .env.local existe (raíz del proyecto)
2. npm run validate (muestra qué falta)
3. npm run dev (reinicia)
```

### ❌ "Tabla draws no existe"
```
Causa: SQL no se ejecutó o hay error
Fix:
1. Ve a Supabase > SQL Editor
2. Ejecuta: supabase-create-draws-table.sql
3. Verifica que no hay errores en la consola
```

### ❌ "Email confirmation error"
```
Causa: Supabase requiere confirmar email
Fix (desarrollo):
1. Supabase > Authentication > Providers > Email
2. Desactiva "Confirm email required"
```

### ❌ "Variables no cargan en Next.js"
```
Causa: Next.js cachea variables
Fix:
1. Cierra npm run dev
2. npm run dev (reinicia)
3. O: npm run build (para ver si compila)
```

---

## 📊 Estructura del proyecto después

```
quiniela-ia/
├── .env.local                          ⬅️ Credenciales
├── .env.example                        (template)
├── app/
│   ├── libsupabase.js                  ⬅️ Cliente Supabase
│   ├── api/
│   │   ├── predictions/route.js        ⬅️ Lee de tabla draws
│   │   └── webhooks/uala/route.js
│   ├── predictions/
│   │   └── page.jsx                    ⬅️ Muestra predicciones
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   └── ...
├── supabase-create-draws-table.sql     ⬅️ Tabla de datos
├── validate-setup.js                   ⬅️ Script de validación
├── test-premium.js
├── package.json
└── ...
```

---

## 🎉 ¡Listo!

Tu app está ahora:
- ✅ Conectada a Supabase
- ✅ Con tabla de datos
- ✅ Mostrando predicciones
- ✅ Con sistema de Premium

### Próximos pasos:
1. **Scraper real** - Obtener datos reales de Quiniela
2. **ML training** - Entrenar modelo con datos históricos
3. **Webhooks Ualá** - Integración de pagos real
4. **Deployment** - Vercel/Docker

### Documentación disponible:
- `QUICK-START.md` - Inicio ultra rápido
- `PASO-3-TESTING-FLUJO.md` - Testing exhaustivo
- `RESUMEN-FINAL.md` - Resumen técnico completo

---

## 📞 Notas finales

1. **`.env.local` está en `.gitignore`**
   - No se sube a GitHub ✅
   - Tus credenciales están seguras ✅

2. **Variables `NEXT_PUBLIC_*`**
   - Se ven en el HTML (públicas)
   - No incluyen datos sensibles

3. **Variables privadas**
   - `SUPABASE_SERVICE_ROLE_KEY` solo en servidor
   - Nunca en el cliente (frontend)

4. **Datos de ejemplo**
   - Los números de `draws` son aleatorios
   - Suficientes para testing
   - Reemplazar con datos reales después

---

**¡Que disfrutes tu app! 🚀**
