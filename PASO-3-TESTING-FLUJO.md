# 🧪 GUÍA: Probar flujo completo

## ⚠️ PREREQUISITOS

Asegúrate de completar ANTES:
- [x] PASO 1: Poblar `draws` con datos históricos
- [x] PASO 2: Configurar `.env.local` con credenciales Supabase
- [ ] PASO 3: Este paso ⬅️

---

## 🚀 1. Iniciar servidor Next.js

```bash
npm run dev
```

**Esperado:**
```
▲ Next.js 16.1.6 (Turbopack)
- Environments: .env.local
...
✓ Ready in 1234ms
```

Abre en navegador: http://localhost:3000

---

## 👤 2. FLUJO 1: Registrarse como usuario

### 2.1 Ir a página de registro
```
http://localhost:3000/register
```

### 2.2 Llenar formulario
```
Email:     test@example.com
Password:  Test123!@#  (mín 6 caracteres)
Confirmar: Test123!@#
```

### 2.3 Hacer click en "Registrarse"

**Esperado:**
```
✅ Revisa tu email para confirmar tu cuenta
```

### 2.4 Verificar email en Supabase
```
Supabase Dashboard
├─ Authentication > Users
└─ Ver "test@example.com" con status "Unconfirmed"
```

Si ves un **link de confirmación** en los logs de Supabase:
```
Auth Debug:
Email to: test@example.com
Confirm URL: http://localhost:3000/auth/callback?token=...
```

**Para desarrollo:** Click en ese link o ajusta Supabase Auth settings:
```
Supabase > Authentication > Providers > Email
└─ Confirm email enabled ✓
└─ Confirm email required ☐ (desactiva para desarrollo)
```

---

## 🔐 3. FLUJO 2: Login con credenciales

### 3.1 Ir a página de login
```
http://localhost:3000/login
```

### 3.2 Ingresar credenciales
```
Email:    test@example.com
Password: Test123!@#
```

### 3.3 Click "Iniciar Sesión"

**Esperado:**
```
✅ Redirige a /dashboard
```

### 3.4 Verificar en dashboard
```
Pantalla:
- "Conectado como: test@example.com" ✅
- "Versión Gratuita - Ver solo 10 números de 2 cifras"
- Botón "Upgrade a Premium"
```

Si ves **error:**
```
❌ "Supabase no configurado"
→ Verifica .env.local (variables correctas)
→ Reinicia npm run dev
```

---

## 💳 4. FLUJO 3: Comprar Premium (simular)

### 4.1 Simular pago Ualá
Como aún no tienes webhook real de Ualá, voy a crear un **script de test**:

```bash
# Ejecuta esto en terminal
curl -X POST http://localhost:3000/api/webhooks/uala \
  -H "Content-Type: application/json" \
  -H "x-uala-signature: valid-signature" \
  -d '{
    "user_id": "uuid-del-usuario",
    "status": "success",
    "amount": 9.99,
    "currency": "USD",
    "transaction_id": "uala_123456",
    "expires_at": "2026-03-20T00:00:00Z"
  }'
```

⚠️ **Problema:** El webhook espera signature HMAC válida.

### 4.2 Solución: Crear un endpoint de test

Voy a hacer que el webhook acepte un "modo test":

```javascript
// En app/api/webhooks/uala/route.js
if (process.env.NODE_ENV === 'development') {
  // Si viene con ?test=1, ignorar signature
  const url = new URL(req.url)
  if (url.searchParams.get('test') === '1') {
    // ... procesar sin validar firma
  }
}
```

### 4.3 Alternativa: Actualizar usuario directamente en Supabase

```sql
UPDATE auth.users
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'::jsonb),
  '{role}',
  '"premium"'
)
WHERE email = 'test@example.com';

UPDATE auth.users
SET user_metadata = jsonb_set(
  user_metadata,
  '{premium_expires}',
  to_jsonb(NOW() + INTERVAL '30 days'::text)
)
WHERE email = 'test@example.com';
```

Ejecuta en **Supabase SQL Editor**.

---

## 🎰 5. FLUJO 4: Ver predicciones PREMIUM

### 5.1 Ir a predicciones
```
http://localhost:3000/predictions
```

### 5.2 Verificar status

**Antes de Premium:**
```
⚠️  Versión Gratuita - Ver solo 10 números de 2 cifras
- 2 Cifras (Gratis): [12] [34] [56] ... [89]
- 3 Cifras (Premium) [GRIS]: "Suscríbete para acceder"
- 4 Cifras (Premium) [GRIS]: "Suscríbete para acceder"
```

**Después de actualizar con `premium` role:**
```
✅ Miembro Premium activo (Vence: 20/03/2026)
- 2 Cifras (Gratis): [12] [34] [56] ... [89]
- 3 Cifras (Premium) [VERDE]: [123] [345] [567] [789] [901]
- 4 Cifras (Premium) [MORADO]: [1234] [3456]
```

### 5.3 Probar filtros
```
Provincia: "Buenos Aires"
Turno: "Tarde"
```

Click en filtros → Las predicciones se actualizan

---

## 📊 6. Verificar datos en Supabase

### 6.1 Ver usuario creado
```
Supabase Dashboard > Authentication > Users

Columna "User"        | test@example.com
Columna "Status"      | Confirmed ✅
Columna "Created"     | hoy
Columna "Last sign in"| hace poco
```

### 6.2 Ver roles en metadata
```sql
SELECT 
  email,
  user_metadata->'role' as role,
  user_metadata->'premium_expires' as expires
FROM auth.users
WHERE email = 'test@example.com';
```

**Esperado:**
```
email              | role      | expires
test@example.com   | "premium" | "2026-03-20T..."
```

### 6.3 Ver que los datos de draws están ahí
```sql
SELECT COUNT(*) as total, province, turno
FROM draws
GROUP BY province, turno;
```

**Esperado:** 1080+ registros

---

## 🔍 7. Troubleshooting

### ❌ Error: "Email exists"
**Causa:** Ya registraste ese email
**Solución:** 
1. Elimina el usuario en Supabase (Settings > Authentication)
2. O usa otro email: `test2@example.com`

### ❌ Error: "Invalid password"
**Causa:** Password muy corta (<6 caracteres)
**Solución:** Usa mínimo 6 caracteres

### ❌ No ve predicciones (solo carga)
**Causa:** No hay datos en tabla `draws`
**Solución:** Ejecuta PASO 1 (seed_draws.py)

### ❌ Predicciones vacías `[]`
**Causa:** API query retorna sin datos
**Solución:**
1. Verifica que hay registros: `SELECT COUNT(*) FROM draws;`
2. Verifica que tienes `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`

### ❌ Escena 3D no renderiza
**Causa:** Three.js no cargó
**Solución:**
1. Verifica console (F12 > Console tab)
2. Si ves error de módulo, reinstala: `npm install three`
3. Reinicia: `npm run dev`

---

## ✅ Checklist de tests

### Test 1: Registro
- [ ] Página de registro carga
- [ ] Form validación funciona (error si <6 chars)
- [ ] Registro exitoso muestra email con
virmación
- [ ] Usuario aparece en Supabase Auth

### Test 2: Login
- [ ] Página de login carga
- [ ] Login exitoso redirige a /dashboard
- [ ] Muestra email del usuario
- [ ] Muestra "Versión Gratuita"

### Test 3: Premium
- [ ] Actualizar role a "premium" en Supabase
- [ ] Dashboard muestra "Miembro Premium activo"
- [ ] Muestra expiración correcta

### Test 4: Predicciones
- [ ] Página /predictions carga
- [ ] Muestra números 2 cifras (gratis)
- [ ] Muestra números 3-4 cifras (solo si premium)
- [ ] Filtros funcionan (provincia/turno)
- [ ] Escena 3D renderiza (opcional)

---

## 🎬 Scripts de testing rápido

### Script para crear usuario premium automático:

```sql
-- Crear nuevo usuario test
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invitations_sent,
  confirmation_sent_at,
  confirmed_at,
  last_sign_in_at,
  user_metadata,
  raw_app_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  email_change,
  email_change_token_new,
  email_change_confirm_token,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'testpremium@example.com',
  crypt('Test123!@#', gen_salt('bf')),
  NOW(),
  0,
  NOW(),
  NOW(),
  NOW(),
  jsonb_build_object('role', 'premium', 'premium_expires', (NOW() + INTERVAL '30 days')::text),
  jsonb_build_object('provider', 'email'),
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
);
```

Ejecuta en Supabase SQL Editor.

---

## 🚀 Próximo paso:

Si todo pasó ✅:
1. Felicitaciones, tu app está funcionando
2. Next: Implementar pagos reales con Ualá
3. Next: Integrar scraper real de Quiniela
4. Next: Hacer deploy a producción (Vercel)
