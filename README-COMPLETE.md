# Quiniela IA - Predictor de Números Lotería 🎰

Sistema inteligente de predicción de números para Quiniela Nacional Buenos Aires con integración a Supabase, análisis de frecuencia, y gating premium.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tech Stack](#tech-stack)
- [Inicio Rápido](#inicio-rápido)
- [Testing](#testing)
- [Docker](#docker)
- [Deploy](#deploy)
- [Documentación](#documentación)
- [Troubleshooting](#troubleshooting)

---

## ✨ Características

- **🎯 Predicciones Basadas en Frecuencia**
  - 2-dígitos: Libre para todos
  - 3-4 dígitos: Solo usuarios premium

- **📊 Base de Datos PostgreSQL**
  - Supabase integrado
  - Fallback local (SQLite + JSONL)
  - RLS policies para seguridad

- **🔄 Ingesta de Datos**
  - Web scraper para ruta1000.com.ar
  - Reintentos automáticos
  - Validación JSON integrada

- **💳 Premium Gating**
  - Webhook para Ualá
  - user_metadata role en Supabase Auth

- **📱 Frontend Moderno**
  - Next.js 16 + React 19
  - TailwindCSS + Three.js (visualización 3D)
  - Responsive design

- **🚀 Production-Ready**
  - CI/CD automático (GitHub Actions)
  - Docker multi-stage build
  - Deploy automático a Vercel/Railway

---

## 🛠 Tech Stack

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 16, React 19, TailwindCSS, Three.js |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | Supabase (PostgreSQL), SQLite (fallback) |
| **Auth** | Supabase Auth + JWT |
| **Scraping** | Python + BeautifulSoup |
| **Testing** | Playwright (E2E) |
| **DevOps** | Docker, Docker Compose, GitHub Actions |

---

## 🚀 Inicio Rápido

### 1. Clonar y Setup

```bash
git clone https://github.com/tu-usuario/quiniela-ia
cd quiniela-ia
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar template
cp .env.example .env.local

# Editar y agregar credenciales de Supabase
nano .env.local
```

**Variables requeridas:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

### 3. Crear tabla en Supabase

Ve a **SQL Editor** en Supabase Dashboard y copia/pega:

```bash
# O ejecuta el script
node scripts/execute-sql-supabase.js
```

### 4. Ejecutar localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing

### Tests E2E con Playwright

```bash
# Instalar browsers
npx playwright install

# Ejecutar tests
npm run test:e2e

# UI mode (interactivo)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Ver reporte
npm run test:e2e:report
```

**Archivos de test:** `./e2e/*.spec.ts`

#### Test Coverage

- ✅ Carga de páginas
- ✅ APIs (predictions, pending, retry)
- ✅ Premium gating (2/3/4-dígitos)
- ✅ Integración DB
- ✅ Formato de datos

### Tests Manuales

```bash
# Test premium gating
npm run test:premium

# Validar setup
npm run validate
```

---

## 🐳 Docker

### Build Local

```bash
# Build imagen
docker build -t quiniela-ia:latest .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="..." \
  -e SUPABASE_SERVICE_ROLE_KEY="..." \
  quiniela-ia:latest
```

### Docker Compose (Development)

```bash
# Levantar app + PostgreSQL
docker compose up

# En nuevo terminal, crear tabla
docker compose exec app node scripts/execute-sql-supabase.js

# Acceder a http://localhost:3000
```

### Production Deploy

Ver [DEPLOY.md](./DEPLOY.md) para Vercel, Railway, VPS, etc.

---

## 📦 Deploy

Ver **[DEPLOY.md](./DEPLOY.md)** para instrucciones completas.

**Resumen rápido:**

```bash
# Vercel (recomendado)
npm i -g vercel
vercel --prod

# Railway
railway up

# GitHub Actions (automático en main)
git push origin main
```

---

## 📚 Documentación

- [SETUP-FINAL.md](./SETUP-FINAL.md) - Setup paso a paso
- [DOCUMENTATION.md](./DOCUMENTATION.md) - Arquitectura y APIs
- [DEPLOY.md](./DEPLOY.md) - Guía de deployment
- [supabase-create-draws-table.sql](./supabase-create-draws-table.sql) - Schema SQL

---

## 🔧 Estructura del Proyecto

```
quiniela-ia/
├── app/
│   ├── api/              # Next.js API routes
│   │   ├── init-db/
│   │   ├── pending/
│   │   ├── predictions/
│   │   ├── retry/
│   │   └── webhooks/uala/
│   ├── pending/          # Página UI pending
│   ├── predictions/      # Página predicciones
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── scripts/
│   ├── execute-sql-supabase.js
│   ├── ingest_ruta1000.py
│   ├── parse_quiniela.py
│   └── test-setup.js
├── e2e/
│   └── full-flow.spec.ts
├── data/
│   ├── pending_draws.jsonl
│   └── draws.db           # SQLite fallback
├── Dockerfile
├── docker-compose.yml
├── playwright.config.ts
├── .github/workflows/ci-cd.yml
└── package.json
```

---

## 🔐 Variables de Entorno

### Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### Opcionales

```env
# Para desarrollo local
DB_PASSWORD=postgres

# Para deploy
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...

DOCKER_USERNAME=...
DOCKER_PASSWORD=...
```

---

## 📝 Scripts Disponibles

```bash
npm run dev              # Desarrollo
npm run build            # Build producción
npm run start            # Iniciar servidor
npm run lint             # ESLint
npm run test:premium     # Test premium gating
npm run validate         # Validar setup
npm run test:e2e         # Tests E2E
npm run test:e2e:ui      # Tests interactivo
npm run test:e2e:report  # Ver reporte
```

---

## 🚨 Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY not found"

```bash
# Verificar .env.local existe
cat .env.local

# Si está vacío, regenerar desde Supabase Dashboard
# Settings > API Keys > Copy service_role key
```

### "Tabla draws no existe"

```bash
# Ejecutar SQL en Supabase SQL Editor
# o usar script:
node scripts/execute-sql-supabase.js
```

### Build falla en Docker

```bash
# Limpiar cache
docker system prune -a

# Rebuild
docker build --no-cache -t quiniela-ia:latest .
```

### E2E tests fallan en CI

```bash
# Correr localmente primero
npm run test:e2e:debug

# Verificar que dev server está corriendo
npm run dev  # En otra terminal
npm run test:e2e
```

---

## 🤝 Contribuir

1. Fork el repo
2. Crear branch: `git checkout -b feature/tu-feature`
3. Commit: `git commit -m 'Add: descripción'`
4. Push: `git push origin feature/tu-feature`
5. PR a `main`

---

## 📄 Licencia

MIT License - Ver [LICENSE](./LICENSE) para detalles

---

## 📞 Soporte

- 📖 Documentación: [DOCUMENTATION.md](./DOCUMENTATION.md)
- 🚀 Deploy: [DEPLOY.md](./DEPLOY.md)
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

**Desarrollado con ❤️ para la comunidad de quiniela** 🎰
