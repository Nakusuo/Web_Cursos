# Guía de Deployment para Spaceship

## 🚀 Preparación para Deployment

### 1. Configuración de Variables de Entorno

Antes de hacer el deployment, asegúrate de configurar las siguientes variables de entorno en tu servicio de hosting:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=tu_mongodb_uri_de_produccion
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRE=7d
ALLOWED_ORIGINS=https://tu-dominio.com
```

### 2. Estructura del Proyecto

El proyecto está listo para ser hosteado con la siguiente configuración:

- **Backend**: Node.js + Express en `/backend`
- **Frontend**: HTML/CSS/JS estáticos servidos por Express
- **Base de datos**: MongoDB (configurar MongoDB Atlas recomendado)

### 3. Archivos de Configuración Creados

- ✅ `Procfile` - Define el comando de inicio para Spaceship
- ✅ `package.json` (raíz) - Configuración del proyecto principal
- ✅ `.env.example` - Plantilla de variables de entorno
- ✅ `.slugignore` - Archivos a ignorar en el deployment

### 4. Comandos de Deployment

#### Para Spaceship/Heroku:
```bash
# Inicializar git si no lo has hecho
git init
git add .
git commit -m "Preparado para deployment"

# Deploy a Spaceship
git push spaceship main
```

#### Para otros servicios (Railway, Render):
1. Conecta tu repositorio de GitHub
2. Configura las variables de entorno
3. El servicio detectará automáticamente el `Procfile`

### 5. Configuración de MongoDB

**Opción recomendada: MongoDB Atlas**

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Configura un usuario de base de datos
4. Obtén la URI de conexión
5. Agrega la URI a tus variables de entorno

### 6. Verificación Post-Deployment

Después del deployment, verifica:

- ✅ `GET /api/health` - Endpoint de salud del servidor
- ✅ Frontend accesible en la raíz `/`
- ✅ API funcional en `/api/*`
- ✅ Conexión a base de datos exitosa

### 7. URLs de la Aplicación

Una vez deployed:

- **Homepage**: `https://tu-app.spaceship.com/`
- **Login**: `https://tu-app.spaceship.com/login.html`
- **Dashboard**: `https://tu-app.spaceship.com/dashboard.html`
- **Mi Perfil**: `https://tu-app.spaceship.com/mi-perfil.html`
- **API**: `https://tu-app.spaceship.com/api`

### 8. Actualizar la URL de la API

En producción, actualiza la constante `API_URL` en los archivos JavaScript del frontend:

```javascript
// En todos los archivos .js del frontend
const API_URL = 'https://tu-app.spaceship.com/api';
```

O mejor aún, usa una URL relativa:

```javascript
const API_URL = window.location.origin + '/api';
```

### 9. Seguridad

- ✅ CORS configurado para dominios específicos
- ✅ JWT para autenticación
- ✅ Variables de entorno para secretos
- ✅ Middleware de validación en todas las rutas

### 10. Monitoreo

Para producción, considera agregar:
- Logging con Winston o Morgan
- Error tracking con Sentry
- Monitoring con New Relic o DataDog

## 📝 Checklist Pre-Deployment

- [ ] Variables de entorno configuradas
- [ ] MongoDB Atlas configurado y URI obtenida
- [ ] JWT_SECRET generado (usa un string aleatorio seguro)
- [ ] ALLOWED_ORIGINS actualizado con tu dominio
- [ ] URLs de API actualizadas en el frontend
- [ ] Git repository inicializado
- [ ] Todos los cambios commiteados

## 🆘 Troubleshooting

### Error: Cannot connect to MongoDB
- Verifica que MONGODB_URI sea correcta
- Asegúrate de que tu IP está en la whitelist de MongoDB Atlas
- Usa `0.0.0.0/0` para permitir todas las IPs (solo para desarrollo)

### Error: CORS
- Verifica ALLOWED_ORIGINS incluya tu dominio
- En desarrollo, puedes usar `*` pero no en producción

### Error 404 en rutas
- Verifica que el servidor esté sirviendo archivos estáticos
- Confirma que los paths sean relativos

## 📚 Recursos Adicionales

- [Documentación de Spaceship](https://spaceship.com/docs)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
