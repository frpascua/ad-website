# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar tu sitio web con autenticación segura en Vercel usando middleware para proteger el contenido.

## 📋 Requisitos Previos

1. ✅ Una cuenta en [Vercel](https://vercel.com)
2. ✅ Un proyecto en [Supabase](https://supabase.com)
3. ✅ [Node.js](https://nodejs.org) instalado (v18 o superior)
4. ✅ Git instalado
5. ⭐ (Opcional) [Vercel CLI](https://vercel.com/docs/cli) instalado globalmente

## 🔧 Configuración Local

### 1. Instalar Dependencias

```bash
npm install
```

Esto instalará:
- `@supabase/supabase-js` - Cliente de Supabase
- `vercel` - CLI de Vercel para desarrollo local

### 2. Configurar Variables de Entorno

Ya existe un archivo `.env` con tus credenciales. Verifica que sean correctas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kdxfalfojxitoolfhrpr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_W38mKc7B8cOES2pNtz29bQ_Nc0Bq-vx
```

### 3. Probar Localmente con Vercel Dev

```bash
npm run dev
```

Esto iniciará un servidor local en `http://localhost:3000` que simula el entorno de Vercel, incluyendo:
- ✅ Middleware ejecutándose en el edge
- ✅ Variables de entorno
- ✅ Funciones serverless
- ✅ Rewrites y headers

**Prueba:**
1. Abre `http://localhost:3000`
2. Intenta acceder a `http://localhost:3000/dashboard.html` (deberías ser redirigido)
3. Inicia sesión con Magic Link
4. Ahora deberías poder acceder al dashboard

## 🌐 Despliegue en Vercel

### Opción A: Desde la Interfaz Web de Vercel (Recomendado)

#### Paso 1: Preparar el Repositorio Git

```bash
# Inicializar git si no lo has hecho
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit: Supabase auth with Magic Link"

# Conectar con GitHub (crea el repositorio en GitHub primero)
git remote add origin https://github.com/tu-usuario/ad-website.git

# Subir código
git push -u origin main
```

#### Paso 2: Conectar con Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Haz clic en **"Import Git Repository"**
3. Selecciona tu repositorio de GitHub
4. Vercel detectará automáticamente la configuración

#### Paso 3: Configurar Variables de Entorno

En la pantalla de configuración antes del deploy:

1. Expande **"Environment Variables"**
2. Agrega las siguientes variables:

   ```
   Nombre: NEXT_PUBLIC_SUPABASE_URL
   Valor: https://kdxfalfojxitoolfhrpr.supabase.co
   
   Nombre: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Valor: sb_publishable_W38mKc7B8cOES2pNtz29bQ_Nc0Bq-vx
   ```

3. Asegúrate de marcar todas las opciones: **Production**, **Preview**, y **Development**

#### Paso 4: Desplegar

1. Haz clic en **"Deploy"**
2. Espera a que termine el despliegue (1-2 minutos)
3. Obtendrás un URL como: `https://tu-proyecto.vercel.app`

### Opción B: Desde la CLI de Vercel

```bash
# Instalar Vercel CLI globalmente (si no lo tienes)
npm i -g vercel

# Login en Vercel
vercel login

# Desplegar
npm run deploy
```

Durante el despliegue:
- Te preguntará el nombre del proyecto
- Configurará las variables de entorno
- Desplegará automáticamente

## 🔒 Configurar Supabase para Producción

### 1. Agregar el Dominio de Vercel a las Redirect URLs

Una vez desplegado en Vercel, necesitas configurar Supabase:

1. Ve a tu proyecto en Supabase
2. **Authentication** → **URL Configuration**
3. En **Redirect URLs**, agrega:
   ```
   https://tu-proyecto.vercel.app/dashboard.html
   https://tu-proyecto.vercel.app/dashboard
   ```

4. Si usas un dominio personalizado, también agrégalo:
   ```
   https://tudominio.com/dashboard.html
   ```

5. En **Site URL**, configura:
   ```
   https://tu-proyecto.vercel.app
   ```

### 2. Configurar Email Templates

1. Ve a **Authentication** → **Email Templates**
2. Selecciona **Magic Link**
3. Asegúrate de que el enlace apunte a tu dominio de Vercel
4. Personaliza el diseño si lo deseas

### 3. Configurar CORS (Opcional)

Si usas APIs personalizadas:
1. **Settings** → **API** → **CORS**
2. Agrega: `https://tu-proyecto.vercel.app`

## ✅ Verificación de Seguridad

Verifica que el middleware está protegiendo correctamente:

### Test 1: Sin Autenticación
```bash
curl -I https://tu-proyecto.vercel.app/dashboard.html
```
Debería devolver un `302` redirect a `/index.html`

### Test 2: Con Autenticación
1. Abre tu sitio en el navegador
2. Inicia sesión con Magic Link
3. Accede a `/dashboard.html`
4. Deberías ver el contenido protegido

### Test 3: Verificar DevTools
1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Intenta acceder al dashboard sin autenticación
4. Verás que el servidor responde con un redirect ANTES de enviar el HTML

## 🔄 Actualizaciones Automáticas

Con Vercel conectado a Git:

- ✅ Cada `git push` a `main` → deploy automático a producción
- ✅ Cada Pull Request → preview deployment automático
- ✅ Puedes revertir a versiones anteriores desde el dashboard

```bash
# Hacer cambios
git add .
git commit -m "Update: mensaje descriptivo"
git push

# Vercel desplegará automáticamente en ~1 minuto
```

## 🛠️ Comandos Útiles

```bash
# Desarrollo local (simula Vercel)
npm run dev

# Desplegar a producción
npm run deploy

# Ver logs en tiempo real
vercel logs --follow

# Listar todos los despliegues
vercel ls

# Ver detalles del último despliegue
vercel inspect

# Abrir proyecto en el navegador
vercel open

# Ver información del proyecto
vercel project ls
```

## 📊 Monitoreo y Analytics

En el dashboard de Vercel puedes ver:

1. **Analytics** (Analytics tab)
   - Visitas en tiempo real
   - Tiempo de carga
   - Geolocalización de usuarios

2. **Logs** (Deployments → Logs)
   - Logs del middleware
   - Errores en tiempo real
   - Requests HTTP

3. **Deployments** (Deployments tab)
   - Historial completo de deploys
   - Comparar versiones
   - Rollback a versiones anteriores

## 🐛 Solución de Problemas

### Error: "Middleware not executing"

**Síntomas:** Puedes acceder a `/dashboard.html` sin autenticación

**Soluciones:**
1. Verifica que `middleware.js` esté en la raíz del proyecto
2. Revisa que `vercel.json` esté configurado correctamente
3. Consulta los logs: `vercel logs --follow`
4. Asegúrate de que estés en un plan que soporte Edge Middleware

### Error: "CORS policy"

**Síntomas:** Errores de CORS en la consola del navegador

**Soluciones:**
1. Agrega tu dominio de Vercel a las URLs permitidas en Supabase
2. Verifica **Authentication** → **URL Configuration**
3. Limpia la caché del navegador

### Error: "Environment variables not found"

**Síntomas:** `process.env.NEXT_PUBLIC_SUPABASE_URL is undefined`

**Soluciones:**
1. En Vercel dashboard: **Settings** → **Environment Variables**
2. Asegúrate de que empiecen con `NEXT_PUBLIC_`
3. Verifica que estén marcadas para Production, Preview y Development
4. Redespliega después de agregar variables: `vercel --prod`

### Error: "Invalid token" en producción pero funciona local

**Síntomas:** Middleware rechaza tokens válidos

**Soluciones:**
1. Verifica que las URLs de redirect en Supabase incluyan tu dominio de Vercel
2. Limpia las cookies del navegador
3. Verifica que las variables de entorno sean las correctas

### El dashboard se muestra sin autenticación

**Síntomas:** El contenido HTML es visible antes de verificar auth

**Soluciones:**
1. Verifica que el middleware esté configurado correctamente
2. Revisa los logs de Vercel para ver si hay errores
3. Asegúrate de que el `matcher` en `middleware.js` incluya `/dashboard.html`
4. El CSS en `dashboard.html` debe ocultar el contenido durante la verificación

## 🔐 Mejores Prácticas de Seguridad

1. ✅ **Variables de Entorno**
   - NUNCA commitees `.env` con credenciales reales
   - Usa `.env.example` para documentar variables necesarias
   - Rota las claves periódicamente

2. ✅ **Row Level Security (RLS)**
   - Habilita RLS en todas las tablas de Supabase
   - Crea políticas específicas por usuario
   - Nunca confíes solo en la autenticación del frontend

3. ✅ **URLs de Redirección**
   - Limita las URLs permitidas en Supabase
   - No uses wildcards en producción
   - Valida cada dominio individualmente

4. ✅ **Monitoreo**
   - Revisa los logs regularmente
   - Configura alertas para errores críticos
   - Monitorea intentos de acceso no autorizados

5. ✅ **2FA**
   - Habilita 2FA en tu cuenta de Vercel
   - Habilita 2FA en tu cuenta de Supabase
   - Habilita 2FA en tu cuenta de GitHub

## 📱 Dominio Personalizado

Para usar tu propio dominio:

1. **En Vercel:**
   - **Settings** → **Domains**
   - Haz clic en **"Add"**
   - Ingresa tu dominio (ej: `auth.tudominio.com`)
   - Sigue las instrucciones para configurar DNS

2. **Configurar DNS:**
   - Tipo: `CNAME`
   - Nombre: `auth` (o `@` para root)
   - Valor: `cname.vercel-dns.com`

3. **En Supabase:**
   - Actualiza las Redirect URLs con tu nuevo dominio
   - Actualiza la Site URL

## 🎯 Próximos Pasos

- [ ] Configurar dominio personalizado
- [ ] Habilitar Vercel Analytics
- [ ] Configurar alertas de monitoreo
- [ ] Implementar rate limiting en API
- [ ] Agregar tests automatizados
- [ ] Configurar CI/CD pipeline
- [ ] Implementar logging estructurado

## 📚 Recursos Adicionales

- [Documentación de Vercel Middleware](https://vercel.com/docs/concepts/functions/edge-middleware)
- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## 💡 Tips Avanzados

### Cache y Performance

```javascript
// En middleware.js, agregar caching para mejorar performance
const CACHE_TTL = 60; // segundos
// Implementar cache de validación de tokens
```

### Rate Limiting

```javascript
// Agregar rate limiting para prevenir abusos
import { Ratelimit } from "@upstash/ratelimit";
```

### Logging Estructurado

```javascript
// Usar logging estructurado para mejor debugging
console.log(JSON.stringify({
  level: 'info',
  message: 'User authenticated',
  userId: user.id,
  timestamp: new Date().toISOString()
}));
```

---

**¿Necesitas ayuda?** 
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Soporte de Vercel](https://vercel.com/support)

¡Buena suerte con tu despliegue! 🚀
