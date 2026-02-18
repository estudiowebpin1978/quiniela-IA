-- Script para POBLAR tabla 'draws' con datos históricos
-- Ejecutar en: Supabase Console > SQL Editor
-- ⚠️  PRIMERO ejecuta el script de CREATE TABLE (ver abajo)

-- 1. CREAR LA TABLA (si no existe)
CREATE TABLE IF NOT EXISTS draws (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  date DATE NOT NULL,
  numbers INTEGER[] NOT NULL,
  province TEXT DEFAULT 'Nacional',
  turno TEXT DEFAULT 'Mañana',
  source TEXT,
  UNIQUE(date, province, turno)
);

-- 2. INSERTAR DATOS DE EJEMPLO (últimos 30 días)
-- Esto genera combinaciones de provincia/turno para cada día

WITH date_series AS (
  SELECT CURRENT_DATE - (n || ' days')::INTERVAL AS draw_date
  FROM generate_series(0, 29) AS n
),
provinces AS (
  SELECT 'Nacional' AS province
  UNION ALL SELECT 'Buenos Aires'
  UNION ALL SELECT 'Córdoba'
  UNION ALL SELECT 'Santa Fe'
  UNION ALL SELECT 'Mendoza'
),
turnos AS (
  SELECT 'Mañana' AS turno
  UNION ALL SELECT 'Tarde'
  UNION ALL SELECT 'Noche'
)
INSERT INTO draws (date, numbers, province, turno, source)
SELECT 
  ds.draw_date,
  ARRAY[
    (RANDOM() * 99)::INT,
    (RANDOM() * 99)::INT,
    (RANDOM() * 99)::INT,
    (RANDOM() * 99)::INT,
    (RANDOM() * 99)::INT
  ] AS numbers,
  prov.province,
  t.turno,
  'sql_seed'
FROM date_series ds
CROSS JOIN provinces prov
CROSS JOIN turnos t
ON CONFLICT (date, province, turno) DO NOTHING;

-- 3. VERIFICAR RESULTADOS
SELECT COUNT(*) as total_draws, province, turno
FROM draws
GROUP BY province, turno
ORDER BY province, turno;

-- 4. VER ÚLTIMOS SORTEOS
SELECT date, province, turno, numbers, created_at
FROM draws
ORDER BY created_at DESC
LIMIT 20;
