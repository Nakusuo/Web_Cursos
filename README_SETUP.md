# 🐟 Academia Pesquera - Plataforma Educativa

Plataforma web completa para cursos, conferencias y eventos en línea sobre pesca y acuicultura.

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ 
- MongoDB
- npm o yarn

### Instalación Local

1. **Clonar el repositorio**
```bash
git clone <tu-repo-url>
cd Web_Cursos
```

2. **Instalar dependencias del backend**
```bash
cd backend
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Edita .env con tus configuraciones
```

4. **Iniciar MongoDB** (si usas MongoDB local)
```bash
mongod
```

5. **Iniciar el servidor**
```bash
npm start
# o para desarrollo con auto-reload:
npm run dev
```

6. **Abrir la aplicación**
- Frontend: `http://localhost:3000`
- API: `http://localhost:3000/api`
- Health Check: `http://localhost:3000/api/health`

## 📁 Estructura del Proyecto

```
Web_Cursos/
├── backend/                 # Servidor Node.js + Express
│   ├── config/             # Configuración de BD
│   ├── middleware/         # Middleware de autenticación
│   ├── models/             # Modelos de MongoDB
│   ├── routes/             # Rutas de la API
│   └── server.js           # Punto de entrada
├── frontend/               # Aplicación web (HTML/CSS/JS)
│   ├── css/               # Estilos
│   ├── js/                # Scripts del cliente
│   ├── index.html         # Página principal
│   ├── cursos.html        # Catálogo de cursos
│   ├── dashboard.html     # Panel del usuario
│   ├── mi-perfil.html     # Perfil y compras del usuario
│   └── ...
├── Procfile               # Configuración para Spaceship/Heroku
├── package.json           # Configuración del proyecto
└── .env.example           # Plantilla de variables de entorno
```

## 🌟 Características

### Para Usuarios
- ✅ Registro e inicio de sesión
- ✅ Explorar catálogo de cursos
- ✅ Comprar cursos con múltiples métodos de pago
- ✅ Registrarse a eventos en vivo
- ✅ **Nueva**: Vista de perfil con historial de compras
- ✅ **Nueva**: Ver conferencias previas
- ✅ **Nueva**: Seguimiento de progreso en cursos

### Para Administradores
- ✅ Crear y gestionar cursos
- ✅ Crear y gestionar eventos
- ✅ Ver estadísticas de usuarios
- ✅ Gestionar pagos y verificaciones

## 🔑 Variables de Entorno

Configura estas variables en tu archivo `.env`:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/eduplatform
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRE=7d
ALLOWED_ORIGINS=http://localhost:3000
```

## 🌐 Deployment en Spaceship

Ver [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) para instrucciones detalladas.

### Pasos Rápidos:

1. **Configurar MongoDB Atlas**
   - Crea un cluster en MongoDB Atlas
   - Obtén la URI de conexión

2. **Configurar variables de entorno en Spaceship**
   ```
   MONGODB_URI=tu_mongodb_atlas_uri
   JWT_SECRET=tu_secreto_seguro
   NODE_ENV=production
   ALLOWED_ORIGINS=https://tu-dominio.spaceship.com
   ```

3. **Deploy**
   ```bash
   git push spaceship main
   ```

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### Usuarios
- `GET /api/users/me` - Perfil del usuario
- `GET /api/users/me/profile-complete` - **Nuevo**: Perfil completo con compras y eventos
- `GET /api/users/me/courses` - Cursos del usuario
- `PUT /api/users/me` - Actualizar perfil

### Cursos
- `GET /api/courses` - Listar cursos
- `GET /api/courses/:id` - Detalle de curso
- `POST /api/courses` - Crear curso (Admin)

### Compras
- `POST /api/purchases` - Comprar curso
- `GET /api/purchases/my-purchases` - Historial de compras

### Eventos
- `GET /api/events` - Listar eventos
- `GET /api/events/upcoming` - Eventos próximos
- `POST /api/event-registrations` - Registrarse a evento

## 🛠️ Tecnologías

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT para autenticación
- bcryptjs para encriptación

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Bootstrap 5
- Bootstrap Icons

## 📝 Notas de la Nueva Funcionalidad

### Vista de Mi Perfil (`mi-perfil.html`)

La nueva vista incluye:

1. **Estadísticas del Usuario**
   - Total de cursos comprados
   - Cursos completados
   - Eventos asistidos
   - Total invertido

2. **Pestañas Organizadas**
   - **Mis Cursos**: Ver todos los cursos con barra de progreso
   - **Historial de Compras**: Ver todas las transacciones
   - **Próximos Eventos**: Eventos registrados pendientes
   - **Eventos Pasados**: Conferencias anteriores con acceso a grabaciones

3. **Conectado a la Base de Datos**
   - Obtiene datos en tiempo real de MongoDB
   - Muestra cursos de la colección `purchases`
   - Muestra eventos de la colección `eventregistrations`
   - Relaciona con colecciones `courses` y `events`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 👥 Soporte

Para soporte, por favor abre un issue en el repositorio de GitHub.

---

Hecho con ❤️ para Academia Pesquera
