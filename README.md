# Academia Pesquera - Plataforma de Charlas y Seminarios del Sector Pesquero

**Pescando conocimiento real - Menos teoría, más realidad**

Plataforma educativa especializada en el sector pesquero peruano donde profesionales comparten experiencias reales a través de charlas, seminarios y eventos en vivo. Los usuarios (estudiantes y trabajadores del sector) pueden acceder a contenido gratuito o pagar por certificados.

## 🎯 Identidad de Marca

- **Nombre**: Academia Pesquera
- **Eslogan**: Pescando conocimiento real
- **Mensaje**: Menos teoría, más realidad
- **Público**: Estudiantes del sector pesquero + trabajadores de la industria
- **Colores**:
  - Primario: #0B2F4A (Navy Blue)
  - Secundario: #1F6FA3 (Ocean Blue)
  - Acento: #6EC1E4 (Sky Blue)
  - Blanco: #FFFFFF
  - Gris Oscuro: #2E2E2E
- **Icono**: 🌊 Tsunami (Bootstrap Icons: bi-tsunami)

## 🚀 Características

- ✅ Sistema de autenticación (registro/login con JWT)
- 📚 Catálogo de charlas y seminarios con filtros del sector pesquero
- 🎥 Conferencias y entrevistas con profesionales de la industria
- 📅 Registro a eventos en vivo
- 💳 Sistema de pagos con Yape/Plin (métodos peruanos)
- 👤 Dashboard de usuario con progreso
- 🛡️ Panel de administración para verificación de pagos
- 📧 Registro con opción de newsletter

## 📁 Estructura del Proyecto

```
Web_Cursos/
├── frontend/
│   ├── index.html              # Página principal
│   ├── cursos.html             # Catálogo de cursos
│   ├── evento-vivo.html        # Registro de eventos
│   ├── login.html              # Login de usuarios
│   ├── registro.html           # Registro de usuarios
│   ├── dashboard.html          # Panel de usuario
│   ├── css/
│   │   └── styles.css          # Estilos personalizados
│   └── js/
│       ├── main.js             # Funciones generales
│       ├── auth.js             # Autenticación
│       ├── cursos.js           # Gestión de cursos
│       ├── eventos.js          # Gestión de eventos
│       └── dashboard.js        # Dashboard de usuario
│
└── backend/
    ├── server.js               # Servidor Express
    ├── package.json            # Dependencias
    ├── .env.example            # Variables de entorno
    ├── models/                 # Modelos de MongoDB
    │   ├── User.js
    │   ├── Course.js
    │   ├── Event.js
    │   ├── EventRegistration.js
    │   └── Purchase.js
    ├── routes/                 # Rutas de la API
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   ├── course.routes.js
    │   ├── event.routes.js
    │   ├── eventRegistration.routes.js
    │   └── purchase.routes.js
    └── middleware/
        └── auth.middleware.js  # Middleware de autenticación
```

## 🗄️ Modelo de Base de Datos

### Users (Usuarios)
```javascript
{
  _id: ObjectId,
  firstName: String,          // Nombre
  lastName: String,           // Apellido
  email: String,              // Email único
  password: String,           // Contraseña hasheada
  phone: String,              // Teléfono (opcional)
  role: String,               // 'student', 'instructor', 'admin'
  enrolledCourses: [{         // Cursos inscritos
    course: ObjectId,
    enrolledAt: Date,
    progress: Number,         // 0-100
    completed: Boolean
  }],
  registeredEvents: [ObjectId], // Referencias a eventos
  newsletter: Boolean,        // Suscripción a newsletter
  isActive: Boolean,          // Usuario activo/inactivo
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Courses (Charlas y Seminarios)
```javascript
{
  _id: ObjectId,
  title: String,              // Título de la charla/seminario
  description: String,        // Descripción completa
  thumbnail: String,          // URL de imagen
  category: String,           // 'normativa', 'operaciones', 'calidad', 'seguridad', 'tecnologia'
  level: String,              // 'basico', 'intermedio', 'avanzado'
  price: Number,              // Precio en PEN (soles peruanos)
  instructor: String,         // Nombre del profesional/instructor
  instructorAvatar: String,   // URL avatar instructor
  duration: String,           // Duración (ej: "2h 30min")
  rating: Number,             // Rating 0-5
  students: Number,           // Cantidad de participantes
  learningPoints: [String],   // Puntos clave del aprendizaje
  modules: [{                 // Módulos de la charla
    title: String,
    lessons: Number,
    content: String
  }],
  featured: Boolean,          // Charla destacada
  isActive: Boolean,          // Charla activa
  videoUrl: String,           // URL del video
  createdAt: Date,
  updatedAt: Date
}
```

**Categorías del Sector Pesquero**:
- `normativa`: Normativa Pesquera
- `operaciones`: Operaciones y Procesos
- `calidad`: Calidad e Inocuidad
- `seguridad`: Seguridad y Medio Ambiente
- `tecnologia`: Tecnología Pesquera

### Events (Eventos en Vivo)
```javascript
{
  _id: ObjectId,
  title: String,              // Título del evento
  description: String,        // Descripción
  date: Date,                 // Fecha y hora del evento
  speaker: String,            // Nombre del speaker
  speakerBio: String,         // Biografía del speaker
  speakerAvatar: String,      // URL avatar speaker
  category: String,           // Categoría del evento
  maxCapacity: Number,        // Capacidad máxima
  registrations: Number,      // Cantidad de registrados
  isFree: Boolean,            // Evento gratuito
  price: Number,              // Precio (si aplica)
  meetingLink: String,        // Link de Zoom/Meet
  status: String,             // 'upcoming', 'live', 'completed', 'cancelled'
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### EventRegistrations (Registros a Eventos)
```javascript
{
  _id: ObjectId,
  event: ObjectId,            // Referencia al evento
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  company: String,            // Empresa (opcional)
  role: String,               // Rol profesional (opcional)
  motivation: String,         // Por qué quiere asistir
  newsletter: Boolean,
  status: String,             // 'registered', 'attended', 'cancelled', 'no-show'
  attended: Boolean,          // Asistió o no
  user: ObjectId,             // Referencia al usuario (opcional)
  createdAt: Date,
  updatedAt: Date
}
```

### Purchases (Compras/Pagos)
```javascript
{
  _id: ObjectId,
  user: ObjectId,             // Referencia al usuario
  course: ObjectId,           // Referencia a la charla/seminario
  amount: Number,             // Monto pagado en PEN
  currency: String,           // Moneda 'PEN' (soles peruanos)
  paymentMethod: String,      // 'yape', 'plin', 'credit_card', 'paypal'
  transactionId: String,      // ID de transacción único (auto-generado)
  yapePhone: String,          // Número de Yape (si aplica)
  yapeTransactionCode: String,// Código de operación Yape de 6 dígitos
  paymentProofUrl: String,    // URL de la captura de pantalla
  status: String,             // 'pending', 'completed', 'failed', 'refunded'
  verifiedBy: ObjectId,       // Admin que verificó (si aplica)
  verifiedAt: Date,           // Fecha de verificación
  paymentDate: Date,
  refundDate: Date,
  refundReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Flujo de pago con Yape/Plin**:
1. Usuario selecciona charla y método de pago (Yape/Plin)
2. Ingresa número de celular y código de operación de 6 dígitos
3. Sube captura de pantalla del comprobante
4. El pago queda en estado `pending`
5. Admin verifica el pago en el panel de administración
6. Admin aprueba → estado `completed` → usuario obtiene acceso
7. Admin rechaza → estado `failed` → usuario puede reintentar

## 🔧 Instalación y Configuración

### Prerequisitos
- Node.js (v14 o superior)
- MongoDB (v4.4 o superior)
- Git

### Backend

1. Navega a la carpeta backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea el archivo `.env` basado en `.env.example`:
```bash
copy .env.example .env
```

4. Configura las variables de entorno en `.env`:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/academiapesquera
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRE=7d
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
```

5. Inicia el servidor:
```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

### Frontend

1. Navega a la carpeta frontend:
```bash
cd frontend
```

2. Abre con Live Server de VS Code o sirve los archivos con cualquier servidor web:
```bash
# Usando Python
python -m http.server 5500

# Usando Node.js (http-server)
npx http-server -p 5500
```

3. Accede a `http://localhost:5500` en tu navegador

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario

### Usuarios
- `GET /api/users/me` - Obtener perfil del usuario
- `GET /api/users/me/courses` - Cursos del usuario
- `GET /api/users/me/events` - Eventos del usuario
- `PUT /api/users/me` - Actualizar perfil

### Cursos
- `GET /api/courses` - Listar todos los cursos
- `GET /api/courses/:id` - Obtener curso por ID
- `POST /api/courses` - Crear curso (Admin/Instructor)
- `PUT /api/courses/:id` - Actualizar curso (Admin/Instructor)
- `DELETE /api/courses/:id` - Eliminar curso (Admin)

### Eventos
- `GET /api/events` - Listar eventos
- `GET /api/events/upcoming` - Eventos próximos
- `GET /api/events/:id` - Obtener evento por ID
- `POST /api/events` - Crear evento (Admin)
- `PUT /api/events/:id` - Actualizar evento (Admin)
- `DELETE /api/events/:id` - Eliminar evento (Admin)

### Registros de Eventos
- `POST /api/event-registrations` - Registrarse a un evento
- `GET /api/event-registrations/event/:eventId` - Registros de un evento (Admin)
- `GET /api/event-registrations/my-registrations` - Mis registros
- `DELETE /api/event-registrations/:id` - Cancelar registro

### Compras
- `POST /api/purchases` - Comprar un curso
- `GET /api/purchases/my-purchases` - Historial de compras
- `GET /api/purchases/:id` - Detalle de compra
- `POST /api/purchases/:id/refund` - Solicitar reembolso

## 💳 Métodos de Pago

### Pagos con Yape y Plin (🇵🇪 Perú)

La plataforma soporta pagos con **Yape** y **Plin**, los métodos más populares en Perú:

**Proceso de pago con Yape:**
1. Usuario selecciona "Pagar con Yape" al comprar un curso
2. Sistema muestra el número de destino y monto en soles (S/)
3. Usuario realiza la transferencia desde su app Yape
4. Usuario ingresa:
   - Su número de celular Yape
   - Código de operación de 6 dígitos
   - Opcionalmente, captura de pantalla del comprobante
5. El pago queda en estado `pending` hasta verificación manual
6. Administrador verifica el pago y actualiza a `completed`

**Campos adicionales en Purchase:**
- `yapePhone`: Número de celular del pagador
- `yapeTransactionCode`: Código de operación de 6 dígitos
- `paymentProofUrl`: URL de la captura del comprobante

**Conversión de moneda:**
- Los precios se muestran en USD en el catálogo
- Al pagar con Yape/Plin, se convierte a PEN (tipo de cambio ~3.7)
- Ejemplo: $49.99 USD → S/ 184.96 PEN

### Otros métodos soportados
- Tarjeta de crédito/débito (simulado)
- PayPal (preparado para integración)
- Stripe (preparado para integración)

## 🎨 Tecnologías Utilizadas

### Frontend
- HTML5
- CSS3
- Bootstrap 5.3.2
- Bootstrap Icons
- JavaScript (Vanilla)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs (hash de contraseñas)
- jsonwebtoken (autenticación JWT)
- cors
- dotenv

### Pagos
- Yape (Perú) 🇵🇪
- Plin (Perú) 🇵🇪
- Integración preparada para: Stripe, PayPal

## 🔐 Seguridad
- Yape (Perú) 🇵🇪
- Plin (Perú) 🇵🇪
- Integración preparada para: Stripe, PayPal

## 🔐 Seguridade Pago

### Pagos con Yape y Plin (🇵🇪 Perú)

La plataforma soporta pagos con **Yape** y **Plin**, los métodos más populares en Perú:

**Proceso de pago con Yape:**
1. Usuario selecciona "Pagar con Yape" al comprar un curso
2. Sistema muestra el número de destino y monto en soles (S/)
3. Usuario realiza la transferencia desde su app Yape
4. Usuario ingresa:
   - Su número de celular Yape
   - Código de operación de 6 dígitos
   - Opcionalmente, captura de pantalla del comprobante
5. El pago queda en estado `pending` hasta verificación manual
6. Administrador verifica el pago y actualiza a `completed`

**Campos adicionales en Purchase:**
- `yapePhone`: Número de celular del pagador
- `yapeTransactionCode`: Código de operación de 6 dígitos
- `paymentProofUrl`: URL de la captura del comprobante

**Conversión de moneda:**
- Los precios se muestran en USD en el catálogo
- Al pagar con Yape/Plin, se convierte a PEN (tipo de cambio ~3.7)
- Ejemplo: $49.99 USD → S/ 184.96 PEN

### Otros métodos soportados
- Tarjeta de crédito/débito (simulado)
- PayPal (preparado para integración)
- Stripe (preparado para integración)

## 👨‍💻 Panel de Administración

### Verificación de Pagos con Yape

Para verificar pagos pendientes, el administrador debe:

1. Consultar compras con estado `pending`:
```javascript
GET /api/purchases?status=pending
```

2. Verificar el código de operación en la app Yape

3. Actualizar el estado de la compra:
```javascript
PUT /api/purchases/:id/verify
Body: { status: 'completed' }
```

## 🌎 Configuración Regional

### Perú
- Moneda principal: PEN (Soles)
- Métodos de pago: Yape, Plin, Tarjetas
- Tipo de cambio USD/PEN: ~3.7 (actualizar según mercado)

## 🛠️ Técnicas Avanzadas

- Contraseñas hasheadas con bcrypt
- Autenticación con JWT
- Validación de datos con express-validator
- CORS configurado
- Middleware de autenticación para rutas protegidas

## 📝 Notas de Desarrollo

1. **Variables de Entorno**: Siempre cambia el `JWT_SECRET` en producción
2. **MongoDB**: Asegúrate de tener MongoDB corriendo antes de iniciar el backend
3. **CORS**: Ajusta `ALLOWED_ORIGINS` según tus necesidades
4. **Pagos**: El sistema de pagos es simulado. Para producción integra Stripe, PayPal, etc.

## 🚀 Próximas Mejoras

- [ ] Integración con pasarela de pagos real (Stripe/PayPal)
- [ ] Sistema de notificaciones por email
- [ ] Chat en vivo durante eventos
- [ ] Sistema de calificaciones y reviews
- [ ] Certificados descargables
- [ ] Panel de administración completo
- [ ] Análisis y estadísticas
- [ ] Sistema de afiliados

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.

## 👨‍💻 Autor

Desarrollado para demostración de plataforma educativa online.
