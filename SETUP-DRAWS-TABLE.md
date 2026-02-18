# 🔧 CONFIGURACIÓN: Crear tabla `draws` en Supabase

## ⚡ Pasos rápidos (5 minutos)

### 1️⃣ Abrir Supabase SQL Editor

```
1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. En el menú izquierdo: SQL Editor
```

### 2️⃣ Crear nueva query

```
Click: New Query (botón arriba a la izquierda)
O: Ctrl+K (search) > "New Query"
```

### 3️⃣ Copiar el SQL

Abre este archivo: `supabase-create-draws-table.sql`

Copia TODO el contenido (Ctrl+A > Ctrl+C)

### 4️⃣ Pegar en SQL Editor

En Supabase:
```
1. Haz click en el área de texto de la query
2. Pega (Ctrl+V)
3. Ver el SQL creando tabla draws
```

### 5️⃣ Ejecutar

```
Click: RUN (botón azul arriba a la derecha)
O: Ctrl+Enter
```

**Esperado:**
```
✅ Success
Query executed successfully (X rows affected)
```

---

## ✅ Verificar que funcionó

### Ver tabla creada
```
En el menú izquierdo: Table Editor
Verás: "draws" en la lista de tablas
```

### Ver datos insertados
En SQL Editor, ejecuta:
```sql
SELECT COUNT(*) FROM draws;
```

**Esperado:**
```
count
------
  450
(1 row)
```

Esto significa: 30 días × 5 provincias × 3 turnos = 450 sorteos de ejemplo

### Ver últimas filas
```sql
SELECT * FROM draws LIMIT 5;
```

---

## 🚀 Ahora que la tabla existe

### 1. Verificar `.env.local` tiene credenciales
```bash
cat .env.local | grep NEXT_PUBLIC_SUPABASE
```

**Debe mostrar:**
```
NEXT_PUBLIC_SUPABASE_URL=https://elyggtrbztckyrophcgj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 2. Reiniciar Next.js
```bash
npm run dev
```

### 3. Probar conexión
```
http://localhost:3000/predictions
```

Debería:
- ✅ Mostrar números de predicción
- ✅ NO mostrar error "Supabase no configurado"
- ✅ Números aleatorios de la tabla `draws`

---

## 🐛 Si algo falla

### ❌ "Relation 'public.draws' doesn't exist"
**Causa:** El SQL no se ejecutó correctamente
**Solución:**
1. En Supabase, busca errores en la consola (abajo)
2. Verifica que copiaste TODO el SQL
3. Intenta ejecutar paso a paso (comentar líneas)

### ❌ "Permission denied"
**Causa:** RLS bloqueando acceso
**Solución:**
1. En Supabase > Authentication > Policies
2. Verifica que existe policy "public_reads_draws"
3. Si no, recrearla manualmente:
```sql
CREATE POLICY "public_reads_draws"
ON public.draws
FOR SELECT
USING (true);
```

### ❌ Next.js dice "Supabase no configurado"
**Causa:** Variables no cargadas
**Solución:**
1. Verifica `.env.local` existe (raíz del proyecto)
2. Reinicia: npm run dev
3. Revisa que `NEXT_PUBLIC_SUPABASE_URL` no está vacío

### ❌ Predicciones vacías `[]`
**Causa:** Tabla existe pero no tiene datos
**Solución:**
```sql
-- En SQL Editor, ejecuta esto:
INSERT INTO draws (date, numbers, province, turno) VALUES
  (CURRENT_DATE, ARRAY[12, 34, 56, 78, 90], 'Nacional', 'Mañana'),
  (CURRENT_DATE, ARRAY[23, 45, 67, 89, 11], 'Nacional', 'Tarde');
```

---

## 📊 Estructura de la tabla `draws`

```sql
draws
├─ id (BIGSERIAL PRIMARY KEY)      ← UUID único
├─ created_at (TIMESTAMP)           ← Cuándo se creó
├─ date (DATE)                      ← Fecha del sorteo
├─ numbers (INTEGER[])              ← Array [num1, num2, num3, num4, num5]
├─ province (TEXT)                  ← "Nacional", "Buenos Aires", etc
├─ turno (TEXT)                     ← "Mañana", "Tarde", "Noche"
└─ source (TEXT)                    ← "example_seed", "scraper", etc
```

---

## 🎯 Próximo paso

Una vez que verifies que:
- ✅ Tabla `draws` existe en Supabase
- ✅ Tiene datos (SELECT COUNT encontró registros)
- ✅ Next.js conecta sin errores

→ **Puedes probar el flujo completo:**
```bash
npm run dev
# Abre http://localhost:3000/register
# Registrate y login
# Verás predicciones desde la tabla draws
```
