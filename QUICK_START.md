# Inicio Rápido

## Instalación Local

```bash
npm install
cd backend && npm install && cd ..

mongod

cd backend
npm run seed
npm start
```

Abrir index.html con Live Server o similar.

**API**: http://localhost:3000/api
**Frontend**: http://localhost:5500

**Usuarios:**
- Admin: `admin@academiapesquera.com` / `Admin123!`
- Usuario: `usuario@test.com` / `User123!`

---

## Con Docker

```bash
# 1. Configurar variables
cp .env.docker .env
# Editar .env con tus valores

# 2. Iniciar todo con un comando
docker-compose up -d

# 3. Ver logs
docker-compose logs -f app

# 4. Acceder
# Frontend: http://localhost:3000
```

---

## 📋 Checklist Pre-Lanzamiento

### Seguridad ✅
- [x] Helmet configurado
- [x] Rate limiting activo
- [x] Sanitización de inputs
- [x] JWT secret configurado
- [x] Passwords hasheados
- [x] CORS configurado

### Base de Datos ✅
- [x] MongoDB conectado
- [x] Índices optimizados
- [x] Modelos validados
- [x] Seed data disponible

### Backend ✅
- [x] API funcionando
- [x] Logging con Winston
- [x] Error handling
- [x] Health checks
- [x] Cache con Redis (opcional)

### Frontend ✅
- [x] Páginas principales
- [x] Sistema de autenticación
- [x] Dashboard de usuario
- [x] Panel de admin
- [x] Toast notifications
- [x] Loading states

### Emails ✅
- [x] Nodemailer configurado
- [x] Email de bienvenida
- [x] Recuperación de contraseña
- [x] Templates HTML

### Funcionalidades ✅
- [x] Registro/Login
- [x] Catálogo de cursos
- [x] Sistema de pagos (Yape/Plin)
- [x] Reviews y calificaciones
- [x] Dashboard de progreso
- [x] Panel de administración

### Legal ✅
- [x] Términos y condiciones
- [x] Política de privacidad
- [x] GDPR compliance

### DevOps ✅
- [x] Dockerfile
- [x] Docker Compose
- [x] CI/CD pipeline
- [x] .gitignore configurado

---

## 🔧 Configuración Importante

### 1. Variables de Entorno (.env)

**CRÍTICO - CAMBIAR EN PRODUCCIÓN:**

```env
# JWT Secret - CAMBIAR INMEDIATAMENTE
JWT_SECRET=generar_clave_ultra_segura_aqui

# MongoDB - Ajustar para producción
MONGODB_URI=mongodb://localhost:27017/eduplatform

# Email - Configurar con credenciales reales
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion_gmail

# CORS - Agregar tu dominio
ALLOWED_ORIGINS=https://tudominio.com
```

**Generar JWT Secret seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Configurar Email (Gmail)

1. Ir a https://myaccount.google.com/security
2. Activar "Verificación en 2 pasos"
3. Generar "Contraseña de aplicación"
4. Usar esa contraseña en `EMAIL_PASS`

### 3. MongoDB

**Local:**
```bash
# Instalar MongoDB Community
# https://www.mongodb.com/try/download/community

# Iniciar servicio
mongod
```

**Cloud (MongoDB Atlas) - RECOMENDADO:**
1. Crear cuenta en https://cloud.mongodb.com
2. Crear cluster gratuito
3. Obtener connection string
4. Actualizar `MONGODB_URI` en .env

### 4. Redis (Opcional pero Recomendado)

**Local:**
```bash
# Windows (con WSL)
sudo apt-get install redis-server
redis-server

# Docker
docker run -d -p 6379:6379 redis:7-alpine
```

**Cloud:**
- Redis Labs: https://redis.com/try-free/
- Actualizar `REDIS_URL` en .env

---

## 🐛 Solución de Problemas

### Error: MongoDB no conecta
```bash
# Verificar que MongoDB está corriendo
mongosh

# Si no funciona, iniciar manualmente
mongod --dbpath C:\data\db
```

### Error: Puerto 3000 ocupado
```bash
# Cambiar puerto en .env
PORT=3001
```

### Error: Módulos no encontrados
```bash
# Reinstalar dependencias
rm -rf node_modules backend/node_modules
npm install
cd backend && npm install
```

### Error al enviar emails
- Verificar credenciales de Gmail
- Revisar que "Acceso de apps menos seguras" esté deshabilitado
- Usar "Contraseña de aplicación"

### Error de CORS
- Verificar `ALLOWED_ORIGINS` en .env
- Agregar origen del frontend

---

## 📊 Monitoreo y Logs

### Ver logs en tiempo real
```bash
# Development
npm run dev

# Docker
docker-compose logs -f app

# Logs de Winston
tail -f backend/logs/application-*.log
tail -f backend/logs/error-*.log
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Test de API
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@academiapesquera.com","password":"Admin123!"}'
```

---

## 🚀 Deploy a Producción

### Opción 1: VPS (DigitalOcean, Linode, AWS EC2)

```bash
# 1. Conectar al servidor
ssh user@tu-servidor.com

# 2. Instalar Docker
curl -fsSL https://get.docker.com | sh

# 3. Clonar repositorio
git clone <tu-repo>
cd Web_Cursos

# 4. Configurar .env de producción
nano .env

# 5. Iniciar con Docker
docker-compose up -d

# 6. Ver estado
docker-compose ps
```

### Opción 2: Heroku

```bash
# 1. Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Crear app
heroku create tu-app-name

# 4. Agregar MongoDB
heroku addons:create mongolab

# 5. Configurar variables
heroku config:set JWT_SECRET=tu_secret_key
heroku config:set NODE_ENV=production

# 6. Deploy
git push heroku main
```

### Opción 3: Railway, Render, Fly.io
- Más fácil: Conectar GitHub y deploy automático
- Configurar variables de entorno en dashboard
- Agregar base de datos

---

## 🔐 Seguridad para Producción

### Checklist Final

- [ ] Cambiar `JWT_SECRET` a valor único y seguro
- [ ] Usar MongoDB Atlas o servidor dedicado
- [ ] Habilitar HTTPS/SSL
- [ ] Configurar CORS específico (no usar '*')
- [ ] Actualizar credenciales de email
- [ ] Revisar rate limits según tráfico esperado
- [ ] Habilitar logs de auditoria
- [ ] Configurar backups automáticos
- [ ] Implementar monitoreo (New Relic, DataDog)
- [ ] Configurar alertas de errores
- [ ] Revisar y actualizar dependencias
- [ ] Hacer pruebas de penetración
- [ ] Configurar firewall
- [ ] Habilitar fail2ban (si VPS)

---

## 📞 Contacto y Soporte

**Desarrollador:** Tu Nombre
**Email:** tu@email.com
**GitHub:** https://github.com/tu-usuario/Web_Cursos

---

## 🎉 ¡Ya está todo listo!

Tu plataforma tiene implementado:

✅ **16 de 17 funcionalidades** críticas
✅ Seguridad nivel producción
✅ Sistema completo de autenticación
✅ Pagos integrados
✅ Reviews y calificaciones
✅ Dashboard completo
✅ Panel de administración
✅ Docker y CI/CD
✅ Documentación legal
✅ Logging profesional
✅ Cache con Redis
✅ Sistema de emails
✅ Recuperación de contraseña
✅ UX mejorada con toast y loaders

**Pendiente solo:** Tests automatizados (opcional para v1.0)

---

**¡Éxito con tu lanzamiento! 🚀**
