# 🚀 Inicio Rápido - Magic Link Auth

## ⚡ Instalación en 4 Pasos

### 1️⃣ Instalar dependencias con pnpm

```powershell
pnpm install
```

### 2️⃣ Configurar Resend (Opcional - para emails reales)

```powershell
# Copiar archivo de ejemplo
copy .env.example .env
```

Edita `.env` y agrega tu API Key de Resend:

```env
RESEND_API_KEY=re_tu_api_key_aqui
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Obtener API Key gratis:**
1. Ve a [resend.com](https://resend.com) y crea una cuenta
2. Copia tu API Key desde [resend.com/api-keys](https://resend.com/api-keys)

> 💡 **Sin Resend:** La app funciona en modo desarrollo mostrando los links en consola.

### 3️⃣ Iniciar servidor de desarrollo

```powershell
pnpm dev
```

### 4️⃣ Abrir en el navegador

Visita: **http://localhost:3000**

---

## 🧪 Prueba la Aplicación

### Con Resend Configurado:
1. **Ingresa tu email real** en el formulario
2. **Revisa tu bandeja de entrada** (o carpeta spam)
3. **Haz clic en el botón** del email recibido
4. **¡Listo!** Serás autenticado y redirigido al dashboard

### Sin Resend (Modo Desarrollo):
1. **Ingresa cualquier email** en el formulario
2. **Revisa la consola del terminal** donde ejecutaste `pnpm dev`
3. **Copia el enlace generado** o haz clic en el botón de la página
4. **¡Listo!** Serás autenticado

---

## 📧 Características del Email

El email que se envía incluye:
- ✨ Diseño profesional con gradientes
- 🔘 Botón grande y visible para iniciar sesión
- ⏱️ Aviso de expiración (15 minutos)
- 🔗 Enlace alternativo por si el botón no funciona
- 📱 Responsive para móviles

---

## 🔐 Navegar por las Páginas Protegidas

Una vez autenticado, puedes acceder a:

- 📊 **Dashboard**: http://localhost:3000/dashboard
- 👤 **Perfil**: http://localhost:3000/perfil
- 📈 **Reportes**: http://localhost:3000/reportes

---

## 🧹 Cerrar Sesión

Haz clic en el botón **"Cerrar Sesión"** en cualquier página protegida, o visita:

http://localhost:3000/api/auth/logout

---

## 🌐 Desplegar en Vercel

### Opción 1: CLI

```powershell
# Instalar Vercel CLI
npm install -g vercel

# Hacer login
vercel login

# Desplegar
vercel --prod
```

### Opción 2: Dashboard

1. Sube el código a GitHub
2. Importa el repositorio en [vercel.com](https://vercel.com)
3. Haz clic en "Deploy"

### ⚠️ IMPORTANTE: Configurar Variables de Entorno

En Vercel Dashboard:

1. **Settings** → **Environment Variables**
2. Agregar estas 3 variables **OBLIGATORIAS**:

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `JWT_SECRET` | `AbCd1234XyZ...` | Clave aleatoria larga |
| `RESEND_API_KEY` | `re_xxxxx...` | Tu API Key de Resend |
| `RESEND_FROM_EMAIL` | `noreply@tudominio.com` | Email verificado |

**Generar JWT_SECRET seguro:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Obtener RESEND_API_KEY:**
- Ve a [resend.com/api-keys](https://resend.com/api-keys)
- Para desarrollo: usa `onboarding@resend.dev`
- Para producción: [verifica tu dominio](https://resend.com/domains)

---

## 🛡️ Prueba de Seguridad

### Intentar acceder sin autenticación (debe fallar):

```powershell
# Desde PowerShell
curl http://localhost:3000/views/dashboard.html
```

**Resultado esperado**: Redirección a `/login.html` (código 302)

### Intentar descargar con wget (debe fallar):

```powershell
wget http://localhost:3000/views/perfil.html
```

**Resultado esperado**: Descarga `login.html` en lugar del archivo protegido

---

## 📦 Comandos Útiles

```powershell
# Instalar dependencias
pnpm install

# Desarrollo local
pnpm dev

# Simular Vercel localmente
pnpm vercel-dev

# Desplegar a producción
pnpm deploy

# Agregar nueva dependencia
pnpm add nombre-paquete
```

---

## 🐛 Problemas Comunes

### "Cannot find module 'express'"

```powershell
pnpm install
```

### El Magic Link no funciona

- Verifica que no hayan pasado 15 minutos desde que se generó
- Copia el enlace COMPLETO desde la consola

### Redirige constantemente a login

- Abre DevTools (F12) → Application → Cookies
- Verifica que existe `session_token`
- Si no existe, autentícate de nuevo

---

## 📖 Más Información

Lee el **README.md** completo para documentación detallada.

---

✨ **¡Disfruta de tu aplicación con autenticación Magic Link!**
