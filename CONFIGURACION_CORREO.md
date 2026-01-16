# 📧 Instrucciones de Configuración de Correo Electrónico

## ⚠️ IMPORTANTE: Configurar Gmail antes de usar el sistema de correos

Para que los correos automáticos funcionen, necesitas configurar una **Contraseña de Aplicación** de Gmail.

### 🔐 Paso 1: Crear una Contraseña de Aplicación de Gmail

1. **Accede a tu cuenta de Google**: https://myaccount.google.com/

2. **Ve a Seguridad**: En el menú de la izquierda, haz clic en "Seguridad"

3. **Activa la verificación en dos pasos** (si no la tienes activada):
   - Busca "Verificación en dos pasos"
   - Sigue los pasos para activarla (es necesaria para crear contraseñas de aplicación)

4. **Crea una contraseña de aplicación**:
   - Busca "Contraseñas de aplicaciones" o ve a: https://myaccount.google.com/apppasswords
   - Si no ves esta opción, asegúrate de tener la verificación en dos pasos activada
   - Haz clic en "Generar" o "Crear contraseña de aplicación"
   - Selecciona "Correo" y "Windows Computer" (o cualquier opción)
   - Google te generará una contraseña de 16 caracteres (sin espacios)
   - **COPIA ESTA CONTRASEÑA** - solo se muestra una vez

### 🔧 Paso 2: Actualizar el archivo .env

Edita el archivo `backend/.env` y actualiza estas líneas:

```env
EMAIL_USER=tu_correo@gmail.com          # Reemplaza con tu correo de Gmail
EMAIL_PASS=xxxx xxxx xxxx xxxx          # Reemplaza con la contraseña de aplicación de 16 caracteres
ADMIN_EMAIL=admin@academiapesquera.com  # Puedes cambiarlo por tu correo
```

**Ejemplo:**
```env
EMAIL_USER=maria.rodriguez@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
ADMIN_EMAIL=maria.rodriguez@gmail.com
```

### ✅ Paso 3: Reiniciar el servidor

Después de editar el `.env`:

1. Detén el servidor backend (Ctrl+C en la terminal)
2. Reinicia con: `node server.js`
3. Listo! El sistema de correos ya funcionará

---

## 📬 ¿Qué correos se envían automáticamente?

### 1. 🎉 Correo de Bienvenida (Registro)
- **Cuándo**: Cuando un usuario se registra en la plataforma
- **Para**: El nuevo usuario
- **Contenido**: Mensaje de bienvenida con instrucciones

### 2. 📩 Correo de Confirmación (Formulario de Contacto)
- **Cuándo**: Cuando alguien llena el formulario de contacto en index.html
- **Para**: 
  - El usuario que llenó el formulario (confirmación)
  - El administrador (notificación del mensaje)
- **Contenido**: Confirmación de recepción del mensaje

---

## 🧪 ¿Cómo probar que funciona?

### Opción 1: Registro de nuevo usuario
1. Ve a http://localhost:8080/registro.html
2. Llena el formulario con un correo válido
3. Haz clic en "Registrarse"
4. Revisa el correo - deberías recibir un email de bienvenida

### Opción 2: Formulario de contacto
1. Ve a http://localhost:8080/index.html
2. Busca el formulario de contacto (abajo de la página)
3. Llena todos los campos
4. Haz clic en "Enviar Mensaje"
5. Revisa el correo - deberías recibir una confirmación

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar otro servicio de correo que no sea Gmail?
Sí, pero debes cambiar las configuraciones en `.env`:

**Para Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=tu_correo@outlook.com
EMAIL_PASS=tu_contraseña
```

**Para Yahoo:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=tu_correo@yahoo.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

### ¿Qué pasa si no configuro el correo?
- El registro de usuarios **seguirá funcionando**
- El login **seguirá funcionando**
- Los correos simplemente no se enviarán
- Verás un error en la consola del servidor, pero la aplicación no se detendrá

### ¿Los correos se envían inmediatamente?
Sí, se envían en tiempo real cuando:
- Un usuario se registra
- Alguien envía el formulario de contacto

---

## 🔒 Seguridad

⚠️ **NUNCA COMPARTAS TU ARCHIVO .env**
- El archivo `.env` contiene información sensible
- NO lo subas a GitHub
- NO lo compartas en screenshots

✅ El archivo `.gitignore` ya incluye `.env` para protegerlo

---

## 📞 ¿Necesitas ayuda?

Si tienes problemas:
1. Verifica que la verificación en dos pasos esté activada en Gmail
2. Asegúrate de copiar la contraseña de aplicación completa (16 caracteres)
3. Revisa la consola del servidor para ver errores específicos
4. Intenta crear una nueva contraseña de aplicación si la actual no funciona
