# 🔐 Control de Acceso - Lista de Emails Permitidos

La aplicación implementa un sistema de **whitelist** (lista blanca) que restringe el acceso solo a emails autorizados.

---

## 🎯 ¿Cómo Funciona?

Solo los emails incluidos en la lista `ALLOWED_EMAILS` pueden:
- Solicitar un Magic Link
- Recibir emails de autenticación
- Iniciar sesión en la aplicación

Los intentos de acceso con emails no autorizados son bloqueados automáticamente.

---

## ⚙️ Configuración en Desarrollo Local

### Opción 1: Variables de Entorno (.env)

Edita tu archivo `.env` y agrega:

```env
ALLOWED_EMAILS=admin@unirioja.es,user1@unirioja.es,user2@example.com
```

- Separa los emails con **comas** (sin espacios)
- Los emails NO son case-sensitive (Admin@Unirioja.es = admin@unirioja.es)
- Espacios antes/después de cada email son ignorados automáticamente

### Opción 2: Hardcodeado en el Código

Si no configuras `ALLOWED_EMAILS`, se usa la lista por defecto en `api/index.js`:

```javascript
const ALLOWED_EMAILS = [
  'franpas@gmail.com'
  // Agrega más emails aquí
];
```

**Para agregar emails permanentemente:**
1. Abre `api/index.js`
2. Busca `const ALLOWED_EMAILS`
3. Agrega emails al array

---

## 🌐 Configuración en Producción (Vercel)

### Método 1: Dashboard de Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. **Settings** → **Environment Variables**
3. Agrega la variable:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `ALLOWED_EMAILS` | `admin@unirioja.es,user1@example.com` | Production, Preview, Development |

4. Haz clic en **"Save"**
5. **Redeploy** el proyecto

### Método 2: CLI de Vercel

```powershell
# Configurar la variable
vercel env add ALLOWED_EMAILS production

# Cuando te pida el valor, escribe (sin comillas):
# admin@unirioja.es,user1@unirioja.es,user2@example.com

# Redesplegar
vercel --prod
```

---

## 🧪 Probar el Control de Acceso

### ✅ Email Permitido (200 OK)

```powershell
curl -X POST https://ad-website-beta.vercel.app/api/auth/magic-link `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@unirioja.es"}'
```

**Respuesta esperada:**
```json
{
  "mensaje": "✅ Enlace mágico enviado a admin@unirioja.es..."
}
```

### ⛔ Email NO Permitido (403 Forbidden)

```powershell
curl -X POST https://ad-website-beta.vercel.app/api/auth/magic-link `
  -H "Content-Type: application/json" `
  -d '{"email":"unauthorized@example.com"}'
```

**Respuesta esperada:**
```json
{
  "error": "Acceso no autorizado",
  "mensaje": "Este email no tiene permisos para acceder al sistema. Contacta con el administrador."
}
```

---

## 📋 Ejemplos de Configuración

### Ejemplo 1: Solo Dominios de la Universidad

```env
ALLOWED_EMAILS=admin@unirioja.es,jefe.departamento@unirioja.es,secretaria@unirioja.es
```

### Ejemplo 2: Equipo de Desarrollo

```env
ALLOWED_EMAILS=dev1@company.com,dev2@company.com,qa@company.com,manager@company.com
```

### Ejemplo 3: Producción + Testing

```env
# Producción
ALLOWED_EMAILS=admin@unirioja.es,staff@unirioja.es

# Preview/Development (en Vercel puedes tener diferentes valores por entorno)
ALLOWED_EMAILS=admin@unirioja.es,test@example.com,dev@localhost
```

---

## 🔍 Logs del Servidor

Cuando un usuario intenta acceder, verás en los logs:

**Email permitido:**
```
✅ Email autorizado: admin@unirioja.es
✅ Magic Link enviado exitosamente
```

**Email bloqueado:**
```
⛔ Intento de acceso denegado para: hacker@spam.com
```

---

## 🛡️ Seguridad

### Buenas Prácticas

- ✅ **No uses emails personales en producción** - Solo emails corporativos verificados
- ✅ **Revisa la lista periódicamente** - Elimina emails de ex-empleados
- ✅ **Usa variables de entorno** - No hardcodees emails sensibles en Git
- ✅ **Logs de auditoría** - Monitorea intentos de acceso fallidos
- ⚠️ **No compartas la lista públicamente** - Es información sensible

### Mejoras Futuras (Opcional)

Si necesitas más control, podrías implementar:

- **Whitelist por dominio**: Permitir todos los `*@unirioja.es`
- **Roles de usuario**: Admin, Staff, Guest
- **Base de datos**: Gestionar usuarios desde un panel
- **Caducidad de accesos**: Tokens con fecha de expiración
- **2FA**: Autenticación de dos factores

---

## ❓ Preguntas Frecuentes

### ¿Qué pasa si dejo ALLOWED_EMAILS vacío?

Solo los emails en el código (lista por defecto) podrán acceder.

### ¿Los emails son case-sensitive?

No. `Admin@Example.com` = `admin@example.com`

### ¿Puedo usar wildcards como `*@unirioja.es`?

No actualmente. Debes listar cada email completo. Si necesitas esta función, modifica `api/index.js`:

```javascript
// Permitir todos los emails de un dominio
const emailDomain = emailLowerCase.split('@')[1];
if (emailDomain === 'unirioja.es' || ALLOWED_EMAILS.includes(emailLowerCase)) {
  // Permitir acceso
}
```

### ¿Cómo agrego o quito emails sin redesplegar?

Actualmente necesitas redesplegar. Para cambios sin redeploy, considera usar:
- Base de datos (PostgreSQL, MongoDB)
- Servicio externo de gestión de usuarios
- API de configuración dinámica

---

## 📚 Archivos Relacionados

- `api/index.js` - Lógica de validación de whitelist
- `.env` - Configuración local
- `public/login.html` - Formulario de login con manejo de errores

---

✨ **Configuración completada**. Solo usuarios autorizados podrán acceder al sistema.
