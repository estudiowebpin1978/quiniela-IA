# 🚀 Guía de Deploy

Opciones para desplegar Quiniela IA en producción.

---

## **Opción 1: Vercel (Recomendado para Next.js)**

### 1. Conexión inicial

```bash
npm i -g vercel
vercel login
```

### 2. Deploy automático

```bash
vercel
```

Sigue el asistente interactivo. Vercel detectará Next.js automáticamente.

### 3. Configurar variables de entorno

En **Vercel Dashboard > Project Settings > Environment Variables**, añade:

```
NEXT_PUBLIC_SUPABASE_URL=https://elyggtrbztckyrophcgj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Deploy de producción

```bash
vercel --prod
```

**Ventajas:**
- ✅ Deploy automático con `git push` (si conectas repo)
- ✅ SSL/CDN global incluido
- ✅ Muy rápido (serverless)
- ✅ Escalado automático

---

## **Opción 2: Railway (Docker-friendly)**

### 1. Crear proyecto en Railway

Ir a [https://railway.app](https://railway.app) y crear proyecto.

### 2. Conectar repositorio

```bash
railway login
railway link
```

### 3. Configurar variables de entorno

```bash
railway variables set NEXT_PUBLIC_SUPABASE_URL="https://elyggtrbztckyrophcgj.supabase.co"
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
railway variables set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Deploy

```bash
railway up
```

**Ventajas:**
- ✅ Soporta Docker nativo
- ✅ Más control que Vercel
- ✅ Base de datos PostgreSQL integrada (opcional)
- ✅ Precios competitivos

---

## **Opción 3: Docker + VPS (DigitalOcean, AWS, etc.)**

### 1. Crear instancia VPS

En DigitalOcean, AWS o similar: criar droplet con Ubuntu 24.04 LTS.

### 2. Instalar Docker

```bash
# SSH a tu VPS
ssh root@tu-ip

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
bash get-docker.sh

# Instalar Docker Compose
apt-get install docker-compose-plugin -y
```

### 3. Preparar proyecto

En tu máquina local:

```bash
git clone <tu-repo>
cd quiniela-ia

# Crear .env.production
cat > .env.production << EOF
NEXT_PUBLIC_SUPABASE_URL=https://elyggtrbztckyrophcgj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF

# Copy a servidor
scp -r . root@tu-ip:/app
```

### 4. Ejecutar en servidor

```bash
ssh root@tu-ip

cd /app

# Crear .env local en servidor si no viene
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://elyggtrbztckyrophcgj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF

# Lanzar Docker
docker compose up -d
```

### 5. Configurar Nginx (reverse proxy)

```bash
apt-get install nginx -y

cat > /etc/nginx/sites-available/quiniela << 'EOF'
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -s /etc/nginx/sites-available/quiniela /etc/nginx/sites-enabled/
nginx -s reload

# SSL con Let's Encrypt
apt-get install certbot python3-certbot-nginx -y
certbot --nginx -d tu-dominio.com
```

**Ventajas:**
- ✅ Control total del servidor
- ✅ Costos muy bajos (desde $4-5/mes)
- ✅ Puedes ejecutar crons/background jobs

---

## **Opción 4: Render (Alternativa simple)**

### 1. Conectar repo en [render.com](https://render.com)

### 2. Configurar build

- **Build command:** `npm run build`
- **Start command:** `npm start`

### 3. Añadir variables

En Settings → Environment:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 4. Deploy

Click en "Deploy" — Render construye y publica automáticamente.

---

## **Comparativa Rápida**

| Plataforma | Facilidad | Costo | Control | Escalado |
|-----------|----------|--------|---------|----------|
| **Vercel** | ⭐⭐⭐⭐⭐ | $$$$ | ⭐⭐ | Automático |
| **Railway** | ⭐⭐⭐⭐ | $$ | ⭐⭐⭐ | Semi-auto |
| **Docker VPS** | ⭐⭐⭐ | $ | ⭐⭐⭐⭐⭐ | Manual |
| **Render** | ⭐⭐⭐⭐ | $$$ | ⭐⭐⭐ | Automático |

---

## **Pasos Post-Deploy**

### 1. Verificar salud

```bash
curl https://tu-app.vercel.app/api/init-db
# Debe retornar { ok: true } o { warning: "..." }
```

### 2. Iniciar ingesta de datos

```bash
# Acceso via SSH/terminal
node scripts/execute-sql-supabase.js

# O ejecutar scraper
python scripts/ingest_ruta1000.py https://ruta1000.com.ar --insecure
```

### 3. Configurar monitoring

- **Vercel:** Analytics integrado
- **Railway:** Logs en dashboard
- **VPS:** Instalar Prometheus/Grafana (opcional)

### 4. Backups automáticos

Para Supabase, ir a **Settings > Backups** y habilitar backups diarios.

---

## **Troubleshooting Deploy**

**Error: SUPABASE_SERVICE_ROLE_KEY not found**
→ Verificar variables de entorno están en la plataforma

**Port 3000 ya en uso (VPS)**
```bash
lsof -i :3000
kill -9 <PID>
```

**Build falla por memoria**
```bash
# Aumentar virtual memory
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

---

## **Rollback en caso de error**

**Vercel:**
```bash
vercel deployments ls
vercel rollback # Vuelve a versión anterior
```

**Railway:**
Dashboard → Deployments → Select previous → Redeploy

**VPS Docker:**
```bash
docker compose down
git checkout HEAD~1  # Volver commit anterior
docker compose up -d
```

---

¿Necesitas ayuda con un deploy específico? 🚀
