# 🔐 Control de Acceso - Lista de uid Permitidos

La aplicación implementa un sistema de **whitelist** (lista blanca) que restringe el acceso solo a los `uid` autorizados. La identidad se obtiene autenticando contra el **SSO de la Universidad de La Rioja** (Apereo CAS, OAuth 2.0) en `https://sso.unirioja.es/dorus`.

---

## 🎯 ¿Cómo Funciona?

1. El usuario pulsa **"Iniciar sesión con SSO UniRioja"** y es redirigido al CAS.
2. Tras autenticarse, el CAS devuelve un `uid`.
3. Solo los `uid` incluidos en la lista `ALLOWED_UIDS` pueden iniciar sesión.

Los intentos de acceso con `uid` no autorizados son bloqueados automáticamente y se registra un aviso por email a la dirección de auditoría.

---

## ⚙️ Configuración en Desarrollo Local

### Opción 1: Variables de Entorno (.env)

Edita tu archivo `.env` y agrega:

```env
ALLOWED_UIDS=jperez,mgomez,fbarroso
```

- Separa los `uid` con **comas**
- Los `uid` NO son case-sensitive (JPerez = jperez)
- Espacios antes/después de cada `uid` son ignorados automáticamente

### Opción 2: Hardcodeado en el Código

Si no configuras `ALLOWED_UIDS`, se usa la lista por defecto en `api/index.js`:

```javascript
const ALLOWED_UIDS = [
  'admin',
  'fran.barroso'
  // Agrega más uid aquí
];
```

**Para agregar uid permanentemente:**
1. Abre `api/index.js`
2. Busca `const ALLOWED_UIDS`
3. Agrega los `uid` al array

---

## 🌐 Configuración en Producción (Vercel)

### Método 1: Dashboard de Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. **Settings** → **Environment Variables**
3. Agrega la variable:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `ALLOWED_UIDS` | `jperez,mgomez,fbarroso` | Production, Preview, Development |

4. Haz clic en **"Save"**
5. **Redeploy** el proyecto

### Método 2: CLI de Vercel

```powershell
# Configurar la variable
vercel env add ALLOWED_UIDS production

# Cuando te pida el valor, escribe (sin comillas):
# jperez,mgomez,fbarroso

# Redesplegar
vercel --prod
```

---

## 🧪 Probar el Control de Acceso

- **uid autorizado**: tras iniciar sesión en el SSO, se crea la sesión y se redirige al workspace. Llega un email de auditoría con resultado `concedido`.
- **uid NO autorizado**: se muestra una página **403** y llega un email de auditoría con resultado `denegado`.

---

## 📋 Ejemplos de Configuración

### Ejemplo 1: Personal de la Universidad

```env
ALLOWED_UIDS=admin,jefe.departamento,secretaria
```

### Ejemplo 2: Equipo de Desarrollo

```env
ALLOWED_UIDS=dev1,dev2,qa,manager
```

### Ejemplo 3: Producción + Testing

```env
# Producción
ALLOWED_UIDS=admin,staff

# Preview/Development (en Vercel puedes tener diferentes valores por entorno)
ALLOWED_UIDS=admin,test,dev
```

---

## 🔍 Logs del Servidor

Cuando un usuario intenta acceder, verás en los logs:

**uid permitido:**
```
Login exitoso - OAuth verificado {"uid":"admin",...}
```

**uid bloqueado:**
```
Intento de login denegado - uid no autorizado {"uid":"hacker",...}
```

---

## 🛡️ Seguridad

### Buenas Prácticas

- ✅ **Revisa la lista periódicamente** - Elimina `uid` de ex-empleados
- ✅ **Usa variables de entorno** - No hardcodees la lista en Git
- ✅ **Logs de auditoría** - Monitorea intentos de acceso fallidos y el email de aviso
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

### ¿Qué pasa si dejo ALLOWED_UIDS vacío?

Solo los `uid` en el código (lista por defecto) podrán acceder.

### ¿Los uid son case-sensitive?

No. `JPerez` = `jperez`

### ¿Puedo permitir a cualquier usuario del SSO?

No por defecto. Debes listar cada `uid`. Si necesitas permitir a todos los usuarios válidos del CAS, elimina la comprobación contra `ALLOWED_UIDS` en `api/index.js` (no recomendado).

### ¿Cómo agrego o quito uid sin redesplegar?

Actualmente necesitas redesplegar. Para cambios sin redeploy, considera usar:
- Base de datos (PostgreSQL, MongoDB)
- Servicio externo de gestión de usuarios
- API de configuración dinámica

---

## 📚 Archivos Relacionados

- `api/index.js` - Lógica de OAuth y validación de whitelist por uid
- `.env` - Configuración local
- `public/login.html` - Botón de inicio de sesión con el SSO

---

✨ **Configuración completada**. Solo usuarios autorizados podrán acceder al sistema.
