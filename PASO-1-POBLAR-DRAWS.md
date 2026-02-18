# 🌱 GUÍA: Poblar tabla `draws` con datos históricos

## Opción A: Usar script Python (RECOMENDADO)

### Paso 1: Configurar `.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Paso 2: Instalar supabase-py
```bash
pip install supabase-py
```

### Paso 3: Ejecutar script
```bash
python app/ia/seed_draws.py
```

**Qué hace:**
- ✅ Inserta 90 días de datos históricos
- ✅ Crea 4 provincias × 3 turnos × 90 días = 1080 sorteos
- ✅ Maneja duplicados automáticamente

---

## Opción B: Usar SQL directo en Supabase Console

### Paso 1: Ir a Supabase Console
1. Abre https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor**

### Paso 2: Copiar y ejecutar `supabase-seed.sql`
```bash
# Copiar contenido de:
cat supabase-seed.sql
```
- Pega en Supabase SQL Editor
- Click **Run**

**Qué hace:**
- ✅ Crea tabla `draws` si no existe
- ✅ Inserta 30 días × 4 provincias × 3 turnos = 360 sorteos
- ✅ Números aleatorios entre 0-99

---

## Verificar datos insertados

### En Supabase Console:
```sql
SELECT COUNT(*) FROM draws;
SELECT DISTINCT province, turno FROM draws;
```

### Con curl desde terminal:
```bash
curl "https://tu-project.supabase.co/rest/v1/draws?select=*&limit=10" \
  -H "apikey: tu-anon-key" \
  -H "Authorization: Bearer tu-anon-key"
```

---

## Troubleshooting

**Error: "Tabla no existe"**
- Ejecuta el script SQL CREATE TABLE primero

**Error: "Unique constraint violation"**
- Es normal, significa que ya existen datos para esa fecha/provincia/turno
- El script los ignora automáticamente

**Error: "Service role key inválida"**
- Verifica en Supabase Settings > API > Service Role Key (OCULTA por defecto)
- Copiar y pegar en `.env.local`

---

## Datos esperados

Después de ejecutar:**
- 📊 **1080+ registros** in tabla `draws`
- 🌍 **4 provincias**: Nacional, Buenos Aires, Córdoba, Santa Fe
- ⏰ **3 turnos**: Mañana, Tarde, Noche
- 📅 **90 días** de datos históricos (ajustable)

```
province      | turno | count
--------------|-------|-------
Nacional      | Mañana| 90
Nacional      | Tarde | 90
Nacional      | Noche | 90
Buenos Aires  | Mañana| 90
... etc
```

¡Listo para predicciones!
