-- =====================================================
-- TABLA DRAWS - Quiniela Nacional Buenos Aires
-- Ejecutar en: Supabase Dashboard > SQL Editor > Run
-- =====================================================

DROP TABLE IF EXISTS draws CASCADE;

-- 1. CREAR TABLA
CREATE TABLE draws (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  date DATE NOT NULL,
  numbers INTEGER[] NOT NULL,
  province TEXT NOT NULL DEFAULT 'Buenos Aires',
  turno TEXT NOT NULL DEFAULT 'Mañana',
  source TEXT,
  UNIQUE(date, province, turno)
);

-- 2. ÍNDICES
CREATE INDEX idx_draws_date ON draws(date DESC);
CREATE INDEX idx_draws_turno ON draws(turno);
CREATE INDEX idx_draws_created_at ON draws(created_at DESC);

-- 3. RLS
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "public_reads_draws"
ON draws
FOR SELECT
USING (true);

-- Inserción solo para usuarios autenticados (service role también pasa)
CREATE POLICY "authenticated_inserts_draws"
ON draws
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 4. DATOS DE EJEMPLO (últimos 30 días)
-- SOLO Nacional Buenos Aires
-- =====================================================

WITH date_range AS (
  SELECT CURRENT_DATE - n AS draw_date
  FROM generate_series(0, 29) AS n
),
turnos_list AS (
  SELECT 'Mañana' AS turno UNION ALL
  SELECT 'Tarde' UNION ALL
  SELECT 'Noche'
)
INSERT INTO draws (date, numbers, province, turno, source)
SELECT 
  dr.draw_date,
  ARRAY[
    floor(random()*100)::int,
    floor(random()*100)::int,
    floor(random()*100)::int,
    floor(random()*100)::int,
    floor(random()*100)::int
  ],
  'Buenos Aires',
  t.turno,
  'example_seed'
FROM date_range dr
CROSS JOIN turnos_list t
ON CONFLICT (date, province, turno) DO NOTHING;

-- =====================================================
-- 5. VERIFICACIONES
-- =====================================================

-- Total registros
SELECT COUNT(*) FROM draws;

-- Últimos sorteos
SELECT date, turno, numbers, created_at
FROM draws
ORDER BY created_at DESC
LIMIT 20;
