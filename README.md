# 🎰 Quiniela Predictor - Buenos Aires Lottery Predictions

**Full-stack web app for predicting Buenos Aires Quiniela numbers with Premium features, 3D visualization, and automatic daily updates.**

---

## ⚡ Quick Start (10 Minutes)

**👉 [Start here: SETUP-FINAL.md](SETUP-FINAL.md)** - Step-by-step setup guide with screenshots

Or follow this quick summary:

```bash
# 1. Clone and install
npm install
pip install -r scripts/requirements-scraper.txt

# 2. Add .env.local with Supabase credentials
# (Get from https://app.supabase.com > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# 3. Create database table (SQL in Supabase Dashboard)
# See SETUP-FINAL.md Step 4

# 4. Start dev server
npm run dev

# 5. Populate data
python scripts/ingest_ruta1000.py https://ruta1000.com.ar --insecure

# 6. Open browser
# http://localhost:3000
```

---

## 📚 Documentation

- **[SETUP-FINAL.md](SETUP-FINAL.md)** - Complete step-by-step setup (recommended for first-time setup)
- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Full technical documentation, API reference, architecture
- **[README.md](README.md)** - This file (quick overview)

---

## 🚀 Main Commands

```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Build for production
npm run lint             # Run ESLint validation
node test-premium.js     # Create test user with premium access
```

---

## 🎯 Features

### ✅ Free Tier
- View 2-digit (10 number) predictions
- Select by turno: PREVIA, PRIMERA, MATUTINA, VESPERTINA, NOCTURNA
- 3D visualization of top predictions

### 👑 Premium Tier
- All free features +
- 3-digit predictions
- 4-digit predictions
- 1-year subscription

### 🔧 Backend
- Automatic scraping from ruta1000.com.ar every day
- Real-time parsing by turno
- Fallback storage (SQLite + JSONL) when Supabase unavailable
- Retry mechanism for failed inserts
- Payment webhook integration (Ualá)

---

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 16, React 19, TailwindCSS 4, three.js |
| **Backend** | Next.js API Routes, Supabase PostgreSQL |
| **Auth** | Supabase Auth with JWT |
| **Storage** | Supabase + SQLite fallback + JSONL queue |
| **Data Pipeline** | Python (BeautifulSoup scraper) |

---

## 📂 Project Structure


```
quiniela-ia/
├── app/
│   ├── api/
│   │   ├── predictions/       → API para predicciones
│   │   └── webhooks/uala/     → Webhook de pagos
│   ├── components/            → Componentes React
│   ├── login/                 → Página de login
│   ├── register/              → Página de registro
│   ├── dashboard/             → Dashboard protegido
│   ├── predictions/           → Página de predicciones
│   ├── profile/               → Perfil de usuario
│   ├── admin/                 → Panel admin
│   ├── libsupabase.js         → Cliente Supabase
│   └── layout.tsx             → Layout raíz
│
├── .env.local                 → Credenciales (privadas)
├── .env.example               → Template de variables
├── supabase-create-draws-table.sql → SQL para crear tabla
├── validate-setup.js          → Script de validación
├── test-premium.js            → Simular pagos
│
└── Documentación/
    ├── GUIA-FINAL-10-MINUTOS.md   ← COMIENZA AQUÍ
    ├── QUICK-START.md
    ├── SETUP-DRAWS-TABLE.md
    ├── PASO-1-POBLAR-DRAWS.md
    ├── PASO-2-CONFIG-ENV.md
    ├── PASO-3-TESTING-FLUJO.md
    └── RESUMEN-FINAL.md
```

---

## 🔐 Configuración requerida

### Archivos obligatorios:
- ✅ `.env.local` - Variables de Supabase
- ✅ Tabla `draws` en Supabase - Datos históricos

### Variables necesarias:
```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Crear tabla (SQL):
```sql
-- Sigue: SETUP-DRAWS-TABLE.md
-- O ejecuta: supabase-create-draws-table.sql
```

---

## 🎯 Funcionalidades

### Autenticación ✅
- Registro con email/password
- Login con sesión
- Auth recovery
- Recuperar contraseña
- Perfil editable con roles

### Predicciones ✅
- Algoritmo por frecuencia histórica
- Filtrado por provincia y turno
- Gating por rol (Free vs Premium)
- 2, 3, 4 cifras según plan
- Visualización 3D (Three.js)

### Pagos ✅
- Webhook para Ualá
- Upgrade automático a Premium
- Expiración de suscripción
- Control de acceso por role

### Admin ✅
- Panel administrativo
- Inserción manual de sorteos
- Validación de roles

---

## 📊 Tabla de datos (`draws`)

```sql
draws (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  numbers INTEGER[] NOT NULL,     -- [num1, num2, num3, num4, num5]
  province TEXT,                  -- "Nacional", "Buenos Aires", etc
  turno TEXT,                     -- "Mañana", "Tarde", "Noche"
  created_at TIMESTAMP DEFAULT NOW(),
  source TEXT
)
```

**Datos de ejemplo:** 450 registros (30 días × 5 provincias × 3 turnos)

---

## 🧪 Testing

### Registro
```bash
http://localhost:3000/register
Email: test@example.com
Password: Test123!@#
```

### Login
```bash
http://localhost:3000/login
# Redirige a /dashboard (Versión Gratuita)
```

### Simular pago Premium
```bash
npm run test:premium test@example.com
# Actualizar: /predictions verá números Premium
```

### Validar configuración
```bash
npm run validate
# Muestra: ✅ o ❌ de cada variable
```

---

## 🔍 Troubleshooting

| Problema | Solución |
|----------|----------|
| "Supabase no configurado" | Verifica `.env.local` y reinicia `npm run dev` |
| "Tabla no existe" | Ejecuta `supabase-create-draws-table.sql` en Supabase |
| "Email confirmation" | Desactiva en Supabase > Auth > Email provider (desarrollo) |
| Predicciones vacías | Verifica tabla `draws` tiene datos (SELECT COUNT) |
| Webhook retorna 401 | Usa `npm run test:premium` (incluye ?test=1) |

---

## 📚 Documentación

| Archivo | Propósito |
|---------|-----------|
| [GUIA-FINAL-10-MINUTOS.md](GUIA-FINAL-10-MINUTOS.md) | **Sigue esto primero** ← Todos los pasos |
| [QUICK-START.md](QUICK-START.md) | Resumen ultra rápido |
| [SETUP-DRAWS-TABLE.md](SETUP-DRAWS-TABLE.md) | Crear tabla en Supabase (detallado) |
| [PASO-3-TESTING-FLUJO.md](PASO-3-TESTING-FLUJO.md) | Testing exhaustivo |
| [RESUMEN-FINAL.md](RESUMEN-FINAL.md) | Resumen técnico completo |

---

## 🛠 Stack tecnológico

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TailwindCSS 4
- Three.js + react-three-fiber (3D)

**Backend:**
- Supabase Auth
- Supabase PostgreSQL
- Node.js API routes

**ML/Data:**
- Python (scraper, training)
- scikit-learn
- GitHub Actions (automation)

**DevOps:**
- Vercel (deployment)
- TypeScript
- ESLint

---

## 🚀 Próximos pasos

1. ✅ Validar setup con `npm run validate`
2. ✅ Iniciar servidor: `npm run dev`
3. ✅ Probar registro/login
4. ⏳ Integrar Ualá real (webhooks)
5. ⏳ Scraper de datos reales
6. ⏳ Entrenar ML model
7. ⏳ Deploy a Vercel

---

## 📞 Soporte

**¿Algo no funciona?**

1. Sigue: `GUIA-FINAL-10-MINUTOS.md`
2. Ejecuta: `npm run validate` (muestra qué falta)
3. Lee: Sección Troubleshooting arriba
4. Revisa: Las guías de documentación

---

## 📄 Licencia

Este proyecto es de ejemplo/demostración.

---

**¡Comienza con [GUIA-FINAL-10-MINUTOS.md](GUIA-FINAL-10-MINUTOS.md)! 🚀**

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

# Quiniela IA (customized)

Esta aplicación es una demo de autenticación con Supabase:

- Registro/inicio de sesión con Supabase Auth.
- Confirmación de correo (mensaje visible tras registro).
- Recuperación de contraseña.
- Edición de perfil y roles (`user` / `admin`).
- Páginas protegidas con middleware y guardas en cliente.
- Formularios estilizados con Tailwind CSS.

## Uso
1. Ajusta `.env.local` con tus credenciales de Supabase. Además de las variables públicas
   `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, si vas a ejecutar los
   scripts de Python para importar sorteos necesitarás la clave de servicio (service
   role) `SUPABASE_SERVICE_ROLE_KEY`.
2. `npm run dev` y prueba las rutas `/register`, `/login`, `/dashboard`.
3. Crea un usuario, confirma correo, inicia sesión y navega al perfil.
4. Cambia el `role` a `admin` desde el perfil (debes ser admin) para ver el
   panel `/admin`.

## Estructura relevante
```
app/
  admin/page.jsx
  dashboard/page.jsx
  forgot-password/page.jsx
  login/page.jsx
  profile/page.jsx
  predictions/page.jsx   # nueva página de resultados/predicciones
  register/page.jsx
middleware.js
libsupabase.js
app/api/predictions/route.js  # lógica de cálculo de probabilidades
app/ia/fetch_draws.py          # script para obtener sorteos en tiempo real
```

---

## Datos y predicción de la Quiniela

El proyecto ahora incorpora un flujo para manejar datos de sorteos y generar
predicciones automáticas:

1. **Base de datos de sorteos**
   - Cree la tabla `draws` en Supabase con columnas `date` (timestamp),
     `numbers` (array de enteros) y `lottery` (texto).
   - Ejecute `app/ia/fetch_draws.py` periódicamente (cron, GitHub Actions,
     contenedor Python) para raspar el sitio de la Quiniela Nacional y
     volcar resultados en Supabase. Edite `fetch_latest_draw()` con el URL y
     parser reales.
   - Adapte la clave de servicio `SUPABASE_SERVICE_ROLE_KEY` para que el
     script pueda escribir en la tabla.

2. **API de predicciones**
   - Ruta GET `/api/predictions` calcula los 10 números de **2 cifras** más
     frecuentes de los últimos 100 sorteos.
   - Con el parámetro `?premium=1` (y, en un sistema real, si el usuario tiene
     `role: 'premium'`), devuelve además 5 números de 3 cifras y 2 de 4 cifras.
   - El algoritmo en `app/api/predictions/route.js` puede reemplazarse con
     modelos IA más sofisticados.

3. **Interfaz 3D y premium**
   - La página `/predictions` muestra las predicciones y un cubo 3D giratorio
     mediante CSS (`Cube` component). Puede reemplazarlo con Three.js o
     react-three-fiber para diseños más elaborados.
   - El acceso premium se controla mediante metadata de usuario (`role`), que
     se establece en el registro o desde el panel de administración.

4. **Notas de estilo**
   - Se añadió Tailwind para estilizar formularios y páginas.
   - Puede integrar diseños 3D (CSS/Three.js) para una apariencia atractiva.

5. **Próximos pasos sugeridos**
   - Completar el scraper con el feed real de la Quiniela.
   - Añadir sistema de pagos (Stripe, etc.) para otorgar el rol premium.
   - Emplear modelos de machine learning (scikit-learn, TensorFlow) en
     `iapredict.py` o en un servicio separado para producir mejores predicciones.
   - Crear visualizaciones 3D de los resultados usando librerías WebGL.

---
