# 🔐 Autenticación Magic Link con JWT en Vercel

Aplicación web minimalista y segura con autenticación sin contraseña mediante **Magic Links** (Enlaces Mágicos) usando JWT y Express, optimizada para despliegue en Vercel Serverless con pnpm.

## ✨ Características Principales

- ✅ **Autenticación sin contraseña** mediante Magic Links por correo electrónico
- � **Control de acceso por whitelist** - Solo emails autorizados pueden iniciar sesión- 📊 **Sistema de logging completo** - Auditoría de todos los accesos con rotación diaria- �🔒 **Protección absoluta de carpetas** - La carpeta `/views/` es completamente inaccesible sin autenticación
- 🛡️ **JWT seguro** con cookies HTTP-Only
- 🚫 **Prevención de descargas no autorizadas** - Imposible usar wget, curl u otras herramientas sin sesión válida
- ⚡ **Optimizado para Vercel Serverless** (capa gratuita Hobby)
- 📦 **Gestor de paquetes pnpm** para instalaciones rápidas y eficientes
- 🎨 **UI moderna y responsive** con gradientes y animaciones

## 📁 Estructura del Proyecto

```
mi-proyecto/
├── public/                  # ✅ Archivos públicos accesibles por cualquiera
│   ├── css/
│   │   └── styles.css      # Estilos CSS globales
│   └── login.html          # Formulario de login público
├── views/                   # 🔒 CARPETA PROTEGIDA - Solo con autenticación válida
│   ├── dashboard.html      # Panel principal (requiere sesión)
│   ├── perfil.html         # Página de perfil (requiere sesión)
│   └── reportes.html       # Reportes analíticos (requiere sesión)
├── api/
│   └── index.js            # 🚀 Aplicación Express (Serverless Function de Vercel)
├── vercel.json             # ⚙️ Configuración de rutas y builds de Vercel
├── package.json            # 📦 Dependencias del proyecto (configurado para pnpm)
├── .gitignore              # 🚫 Archivos ignorados por Git
└── README.md               # 📖 Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (Instalación: `npm install -g pnpm`)

### Paso 1: Inicializar el Proyecto

```powershell
# Crear carpeta del proyecto (si no existe)
mkdir mi-proyecto
cd mi-proyecto

# Inicializar pnpm (opcional, el package.json ya existe)
# pnpm init
```

### Paso 2: Instalar Dependencias con pnpm

```powershell
# Instalar todas las dependencias del proyecto
pnpm install
```

**Dependencias instaladas:**
- `express` - Framework web minimalista
- `jsonwebtoken` - Generación y verificación de JWT
- `cookie-parser` - Manejo de cookies en Express

### Paso 3: Configurar Variables de Entorno (Opcional para Desarrollo)

Para usar Resend en desarrollo local, crea un archivo `.env`:

```powershell
# Copiar el archivo de ejemplo
copy .env.example .env
```

Edita `.env` y agrega tu API Key de Resend:

```env
RESEND_API_KEY=re_tu_api_key_aqui
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Obtener API Key de Resend:**
1. Regístrate gratis en [resend.com](https://resend.com)
2. Ve a [API Keys](https://resend.com/api-keys)
3. Crea una nueva API Key
4. Cópiala en tu archivo `.env`

> **Nota:** Si no configuras Resend, la app funcionará en **modo desarrollo** mostrando los Magic Links en la consola.

### Paso 4: Ejecutar el Servidor en Desarrollo Local

```powershell
# Iniciar servidor Express en modo desarrollo
pnpm dev

# O directamente con Node.js
node api/index.js
```

El servidor estará disponible en: **http://localhost:3000**

### Paso 5: Probar la Aplicación

**Con Resend configurado:**
1. Abre tu navegador en `http://localhost:3000`
2. Ingresa tu correo electrónico real
3. Haz clic en "Enviar Enlace Mágico"
4. **Revisa tu bandeja de entrada** (o spam)
5. Haz clic en el botón del email
6. ¡Serás autenticado y redirigido al dashboard!

**Sin Resend (modo desarrollo):**
1. Ingresa cualquier correo electrónico
2. El Magic Link aparecerá:
   - En la consola del servidor (terminal)
   - Como botón clickeable en la página web
3. Haz clic en el enlace
4. Serás autenticado y redirigido a `/dashboard`

## 🌐 Despliegue en Vercel

### Opción 1: Despliegue Automático desde Git

1. Sube tu código a GitHub, GitLab o Bitbucket
2. Importa el repositorio en [Vercel](https://vercel.com)
3. Vercel detectará automáticamente la configuración de `vercel.json`
4. Haz clic en "Deploy"

### Opción 2: Despliegue desde la CLI de Vercel

```powershell
# Instalar Vercel CLI globalmente
npm install -g vercel

# Iniciar sesión en Vercel
vercel login

# Desplegar a preview (ambiente de prueba)
vercel

# Desplegar a producción
vercel --prod

# O usando el script predefinido en package.json
pnpm deploy
```

### Variables de Entorno en Vercel (OBLIGATORIO)

En producción, **DEBES configurar las siguientes variables**:

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega las siguientes variables:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `JWT_SECRET` | Cadena aleatoria larga | Clave para firmar tokens JWT |
| `RESEND_API_KEY` | `re_xxxxx...` | API Key de Resend |
| `RESEND_FROM_EMAIL` | `tu-email@tu-dominio.com` | Email verificado en Resend |
| `ALLOWED_EMAILS` | `admin@unirioja.es,user@example.com` | Emails autorizados (separados por comas) |
| `NODE_ENV` | `production` | Entorno de ejecución |

**Generar JWT_SECRET seguro (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Obtener RESEND_API_KEY:**
1. Regístrate en [resend.com](https://resend.com)
2. Obtén tu API Key en [resend.com/api-keys](https://resend.com/api-keys)
3. Para usar un dominio propio:
   - Ve a [Domains](https://resend.com/domains)
   - Agrega tu dominio y verifica los registros DNS
   - Usa un email como `noreply@tudominio.com`
4. Para desarrollo/testing, puedes usar `onboarding@resend.dev`

## 🔐 Funcionamiento de la Autenticación

### Flujo de Autenticación Magic Link

1. **Solicitud de Magic Link:**
   - Usuario ingresa su email en `/login.html`
   - POST a `/api/auth/magic-link`
   - Backend genera un JWT temporal (expira en 15 minutos)
   - Crea URL: `https://tu-app.vercel.app/api/auth/verificar?token=...`

2. **Verificación del Magic Link:**
   - Usuario hace clic en el enlace recibido
   - GET a `/api/auth/verificar?token=...`
   - Backend verifica el JWT del Magic Link
   - Si es válido, genera un nuevo JWT de sesión (válido 24 horas)
   - Establece cookie segura `session_token` (HTTP-Only, Secure, SameSite)
   - Redirige a `/dashboard`

3. **Acceso a Páginas Protegidas:**
   - Usuario intenta acceder a `/dashboard`, `/perfil`, `/reportes`, etc.
   - Middleware `verificarSesion` intercepta la petición
   - Verifica la cookie `session_token`
   - Si es válida: sirve el archivo HTML solicitado
   - Si es inválida o no existe: redirige a `/login.html`

4. **Cierre de Sesión:**
   - Usuario hace clic en "Cerrar Sesión"
   - GET a `/api/auth/logout`
   - Backend elimina la cookie `session_token`
   - Redirige a `/login.html`

### Seguridad Implementada

| Característica | Implementación |
|---------------|----------------|
| **Protección de archivos** | Middleware `verificarSesion` en todas las rutas de `/views/` |
| **Cookies HTTP-Only** | Token no accesible desde JavaScript del cliente |
| **Cookies Secure** | Solo transmitidas por HTTPS en producción |
| **Expiración de tokens** | Magic Links: 15 min, Sesiones: 24 horas |
| **Path Traversal Protection** | Bloqueo de caracteres `..` y `/` en nombres de archivo |
| **Redirección automática** | Usuarios no autenticados → `/login.html` |
| **Prevención de wget/curl** | Sin cookie válida = imposible descargar archivos de `/views/` |
| **Control de acceso por whitelist** | Solo emails autorizados pueden solicitar Magic Links |

### Control de Acceso (Whitelist)

La aplicación implementa un sistema de **lista blanca** que restringe el acceso solo a emails autorizados.

**Configuración en desarrollo (.env):**
```env
ALLOWED_EMAILS=admin@unirioja.es,user1@unirioja.es,user2@example.com
```

**Configuración en Vercel:**
1. Settings → Environment Variables
2. Agrega `ALLOWED_EMAILS` con los emails separados por comas
3. Ejemplo: `admin@unirioja.es,staff@unirioja.es`

**Comportamiento:**
- ✅ Emails autorizados → Reciben Magic Link
- ⛔ Emails NO autorizados → Error 403 "Acceso no autorizado"
- 📋 Si no se configura → Usa lista por defecto en `api/index.js`

**Ver documentación completa:** [WHITELIST.md](WHITELIST.md)

### Sistema de Logging y Auditoría

La aplicación registra **todos los intentos de acceso** en archivos de log con rotación diaria automática.

**¿Qué se registra?**
- ✅ Logins exitosos y fallidos
- ⛔ Intentos de acceso con emails no autorizados
- 🔒 Accesos sin token o con token expirado
- 📊 IP, navegador, fecha/hora de cada evento

**Ubicación de logs:**
```
logs/
├── access-2026-05-27.log
├── access-2026-05-26.log
└── ...
```

**Características:**
- 📅 Rotación diaria automática (solo en desarrollo local)
- 🗂️ Retención de 30 días (local)
- 📏 Máximo 20 MB por archivo
- 🔍 Formato JSON para análisis

**Analizar logs:**
```powershell
# Ver reporte del día (desarrollo local)
.\analyze-logs.ps1

# Ver reporte de fecha específica
.\analyze-logs.ps1 2026-05-27

# Ver logs en tiempo real
Get-Content logs/access-$(Get-Date -Format "yyyy-MM-dd").log -Wait
```

**Producción (Vercel):**
- ✅ Logs automáticos en Vercel Dashboard → Functions → Logs
- ✅ Retención según plan (1 hora gratis, 7 días Pro, 30+ Enterprise)
- ✅ Configura Log Drains para servicios externos (Datadog, Logtail, etc.)

**Ver documentación completa:** [LOGGING.md](LOGGING.md)

## 🛠️ API Endpoints

### Públicos (Sin autenticación)

- `GET /` - Redirige a `/login.html` o `/dashboard` según sesión
- `GET /login.html` - Formulario de login
- `GET /public/*` - Archivos estáticos públicos
- `POST /api/auth/magic-link` - Genera Magic Link
- `GET /api/auth/verificar?token=...` - Verifica Magic Link y crea sesión
- `GET /api/auth/logout` - Cierra sesión

### Protegidos (Requieren autenticación)

- `GET /dashboard` - Panel principal
- `GET /perfil` - Página de perfil
- `GET /reportes` - Reportes analíticos
- `GET /views/:archivo` - Acceso directo a archivos protegidos
- `GET /app/:archivo` - Alias para acceder a vistas
- `GET /api/status` - Estado de autenticación (útil para debugging)

## 🧪 Pruebas de Seguridad

### Verificar Protección contra Descarga Directa

```powershell
# Intentar descargar dashboard.html sin autenticación (DEBE FALLAR)
curl https://tu-app.vercel.app/views/dashboard.html

# Resultado esperado: Redirección a /login.html (código 302)
```

```powershell
# Intentar con wget (DEBE FALLAR)
wget https://tu-app.vercel.app/views/perfil.html

# Resultado esperado: Descarga login.html en lugar del archivo protegido
```

### VeConfiguración de Resend para Envío de Emails

La aplicación ya tiene **Resend integrado** y listo para usar.

### Configuración en Desarrollo Local

1. **Obtén tu API Key:**
   - Regístrate gratis en [resend.com](https://resend.com)
   - Ve a [API Keys](https://resend.com/api-keys)
   - Crea una nueva API Key

2. **Crea archivo `.env`:**
```bash
RESEND_API_KEY=re_tu_api_key_aqui
RESEND_FROM_EMAIL=onboarding@resend.dev
JWT_SECRET=tu-secreto-local-123
```

3. **Reinicia el servidor:**
```powershell
pnpm dev
```

### Configuración en Producción (Vercel)

1. **En Vercel Dashboard:**
   - Settings → Environment Variables
   - Agrega `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `JWT_SECRET`

2. **Usar Dominio Propio (Opcional):**
   - Ve a [Resend Domains](https://resend.com/domains)
   - Agrega tu dominio (ej: `tudominio.com`)
   - Verifica los registros DNS (SPF, DKIM, DMARC)
   - Cambia `RESEND_FROM_EMAIL` a `noreply@tudominio.com`

### Plan Gratuito de Resend

✅ **100 emails/día** (3,000/mes)  
✅ Sin tarjeta de crédito requerida  
✅ Verificación de dominio gratuita  
✅ Perfecto para proyectos pequeños/medianos  

### Email de Prueba

Para desarrollo, puedes usar `onboarding@resend.dev` sin verificar dominio.

### Modo Sin Resend

Si `RESEND_API_KEY` no está configurada, la app funciona en **modo desarrollo** mostrando los Magic Links en consola.ón</a>
      <p><small>Este enlace expira en 15 minutos.</small></p>
    `
  });
  
  res.json({ mensaje: 'Enlace enviado a tu correo' });
});
```

### Otras Opciones de Email

- **SendGrid** - Popular, plan gratuito generoso
- **Mailgun** - Buena documentación, fácil de usar
- **Postmark** - Excelente entregabilidad
- **AWS SES** - Muy económico para volúmenes altos

## 🔧 Comandos Útiles de pnpm

```powershell
# Instalar dependencias
pnpm install

# Agregar nueva dependencia
pnpm add nombre-paquete

# Agregar dependencia de desarrollo
pnpm add -D nombre-paquete

# Actualizar dependencias
pnpm update

# Remover dependencia
pnpm remove nombre-paquete

# Listar dependencias instaladas
pnpm list

# Limpiar caché de pnpm
pnpm store prune

# Ejecutar script definido en package.json
pnpm dev          # Desarrollo local
pnpm vercel-dev   # Simular ambiente Vercel localmente
pnpm deploy       # Desplegar a producción
```

## 🐛 Solución de Problemas

### Error: "Cannot find module 'express'"

```powershell
# Reinstalar dependencias
pnpm install
```

### Error: "JWT_SECRET is not defined"

En producción, asegúrate de configurar la variable de entorno `JWT_SECRET` en Vercel.

### El Magic Link no funciona

1. Verifica que el token no haya expirado (15 minutos)
2. Revisa la consola del navegador en busca de errores
3. Verifica que la URL del enlace sea correcta

### Redirige a login.html constantemente

1. Abre las DevTools → Application → Cookies
2. Verifica que existe la cookie `session_token`
3. Si no existe, intenta autenticarte de nuevo
4. Verifica que el servidor esté usando la misma `JWT_SECRET`

### Error 404 en Vercel

Verifica que `vercel.json` esté correctamente configurado. Todas las rutas deben redirigirse a `api/index.js`.

## 📚 Recursos Adicionales

- [Documentación de Express](https://expressjs.com/)
- [Documentación de JWT](https://jwt.io/)
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de pnpm](https://pnpm.io/)

## 🤝 Contribuciones

Las mejoras son bienvenidas:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

MIT License - Siéntete libre de usar este código en tus proyectos.

## 🎯 Próximos Pasos Recomendados

- [ ] Integrar servicio de email real (Resend, SendGrid, etc.)
- [ ] Agregar base de datos para almacenar usuarios (PostgreSQL, MongoDB)
- [ ] Implementar límite de intentos de login (rate limiting)
- [ ] Agregar refresh tokens para sesiones más largas
- [ ] Implementar 2FA opcional
- [ ] Agregar logs de auditoría de accesos
- [ ] Implementar CORS para APIs externas
- [ ] Agregar tests unitarios y de integración

---

**Hecho con ❤️ usando Node.js, Express, JWT y Vercel Serverless**
