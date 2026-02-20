# 📋 Pre-Deploy Checklist

Verificar estos items antes de desplegar a producción.

## 🔐 Seguridad

- [ ] `SUPABASE_SERVICE_ROLE_KEY` NO está en `.env.local` en el repo
- [ ] `.env.local` está en `.gitignore`
- [ ] Variables sensibles están en Vercel/Railway secrets
- [ ] RLS policies están habilitadas en Supabase
- [ ] Auth roles (free/premium) están configurados

## 🗄️ Base de Datos

- [ ] Tabla `draws` existe en Supabase
- [ ] Índices están creados (date, turno)
- [ ] Datos de ejemplo existen (al menos 1 registro)
- [ ] Backups automáticos está activados

## 🧪 Testing

- [ ] `npm run lint` pasa sin errores
- [ ] `npm run build` completa exitosamente
- [ ] Tests E2E pasan: `npm run test:e2e`
- [ ] Premium gating funciona: `npm run test:premium`

## 🚀 Build & Deploy

- [ ] Build time < 5 minutos
- [ ] Tamaño del bundle < 5MB (Next.js)
- [ ] No hay warnings TypeScript
- [ ] Docker image builds sin errores

## 📝 Documentación

- [ ] README.md está actualizado
- [ ] DEPLOY.md tiene instrucciones claras
- [ ] Variables de entorno están documentadas
- [ ] Scripts están comentados

## 🔗 Integración

- [ ] Webhook Ualá está configurado
- [ ] Email notifications funcionan (si aplica)
- [ ] API keys están en el entorno correcto
- [ ] Supabase anon + service keys son correctas

## 📊 Monitoring

- [ ] Error tracking configurado (Sentry, etc.)
- [ ] Analytics habilitadas
- [ ] Logs están visible en plataforma (Vercel/Railway)

## 🎯 Performance

- [ ] Lighthouse score > 75
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Images están optimizadas

## 🔄 CI/CD

- [ ] GitHub Actions workflow está corriendo
- [ ] Deploy automático está habilitado
- [ ] Rollback plan está documentado

---

## Quick Pre-Deploy Commands

```bash
# Verificar todo
npm run lint && npm run build && npm run test:e2e

# Test setup con Supabase
node scripts/test-setup.js

# Ejecutar pending inserts
node scripts/execute-sql-supabase.js

# Build Docker si vas a usar
docker build -t quiniela-ia:latest .
```

## Deploy Signals

✅ **Ready to deploy** si:
- Todos los tests pasan
- Build completa < 5 min
- Linter sin errores

⚠️ **Hold off** si:
- E2E tests fallan
- Linter reporta errores
- Performance degraded

---

## Post-Deploy Verification

```bash
# Verificar salud del servidor
curl https://tu-app.vercel.app/api/init-db

# Ver logs
# Vercel: Dashboard > Logs
# Railway: Dashboard > Logs

# Test APIs
curl https://tu-app.vercel.app/api/predictions?turno=Mañana

# Check database
# Supabase > SQL Editor > SELECT COUNT(*) FROM draws
```
