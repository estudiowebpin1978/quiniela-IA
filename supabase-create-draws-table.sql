-- =====================================================
-- TABLA DRAWS - Quiniela Predictions
-- Ejecutar en: Supabase Dashboard > SQL Editor > Run
-- =====================================================

-- 1. CREAR TABLA DRAWS
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

-- 2. CREAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_draws_date ON draws(date DESC);
CREATE INDEX IF NOT EXISTS idx_draws_province ON draws(province);
CREATE INDEX IF NOT EXISTS idx_draws_turno ON draws(turno);
CREATE INDEX IF NOT EXISTS idx_draws_created_at ON draws(created_at DESC);

-- 3. HABILITAR RLS (Row Level Security)
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;

-- 4. CREAR POLÍTICAS RLS
-- Todos pueden leer (datos públicos)
CREATE POLICY "public_reads_draws"
ON public.draws
FOR SELECT
TO anon, authenticated
USING (true);

-- Solo el admin (service role) puede escribir
CREATE POLICY "admin_inserts_draws"
ON public.draws
FOR INSERT
TO authenticated
WITH CHECK (current_user_id() IS NOT NULL);

-- 5. INSERTAR DATOS DE EJEMPLO (30 días)
WITH date_range AS (
  SELECT CURRENT_DATE - (n || ' days')::INTERVAL AS draw_date
  FROM generate_series(0, 29) AS n
),
provinces AS (
  SELECT 'Nacional' AS province UNION ALL
  SELECT 'Buenos Aires' UNION ALL
  SELECT 'Córdoba' UNION ALL
  SELECT 'Santa Fe' UNION ALL
  SELECT 'Mendoza'
),
turnos_list AS (
  SELECT 'Mañana' AS turno UNION ALL
  SELECT 'Tarde' UNION ALL
  SELECT 'Noche'
)
INSERT INTO draws (date, numbers, province, turno, source)
SELECT 
  dr.draw_date::DATE,
  ARRAY[
    (RANDOM() * 99)::INT,
    (RANDOM() * 99)::INT,
    (RANDOM() * 99)::INT,
    (RANDOM() * 99)::INT,
    (RANDOM() * 99)::INT
  ],
  prov.province,
  t.turno,
  'example_seed'
FROM date_range dr
CROSS JOIN provinces prov
CROSS JOIN turnos_list t
ON CONFLICT (date, province, turno) DO NOTHING;

-- 6. VERIFICAR DATOS INSERTADOS
SELECT COUNT(*) as total_draws, province FROM draws GROUP BY province ORDER BY province;

-- 7. VER ÚLTIMOS SORTEOS
SELECT date, province, turno, numbers, created_at
FROM draws
ORDER BY created_at DESC
LIMIT 20;
