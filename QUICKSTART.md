# 🚀 Inicio Rápido

## ✅ Lo que se ha implementado

### Archivos Creados:

1. ✅ **[middleware.js](middleware.js)** - Protege rutas en el edge de Vercel
2. ✅ **[package.json](package.json)** - Dependencias del proyecto
3. ✅ **[vercel.json](vercel.json)** - Configuración de Vercel (rewrites y headers de seguridad)
4. ✅ **[.env](.env)** - Variables de entorno (ya con tus credenciales)
5. ✅ **[.env.example](.env.example)** - Plantilla de variables de entorno
6. ✅ **[.gitignore](.gitignore)** - Archivos ignorados por Git
7. ✅ **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía completa de despliegue

### Archivos Modificados:

1. ✅ **[dashboard.html](dashboard.html)** - Ahora oculta contenido hasta verificar autenticación
2. ✅ **[README.md](README.md)** - Actualizado con información de seguridad

## 🔒 Capas de Seguridad Implementadas

### 1. Middleware de Vercel (Edge) - Nivel Servidor
- Se ejecuta ANTES de servir cualquier HTML
- Verifica token de autenticación en cookies
- Redirige a login si no hay token válido
- **El HTML nunca se envía al cliente sin autenticación**

### 2. Verificación Client-Side
- JavaScript oculta contenido mientras verifica sesión
- Muestra mensaje de carga durante verificación
- Redirige si la sesión no es válida
- Doble capa de protección

### 3. Headers de Seguridad
- `Cache-Control: no-store` - Evita caché del dashboard
- `X-Content-Type-Options: nosniff` - Previene MIME sniffing
- `X-Frame-Options: DENY` - Previene clickjacking
- `X-XSS-Protection` - Protección contra XSS

## 🧪 Probar Localmente

### 1. Las dependencias ya están instaladas ✅

### 2. Elegir Modo de Desarrollo

Tienes dos opciones:

#### A) Desarrollo Rápido (sin middleware)
Para desarrollo frontend rápido sin probar el middleware:
```bash
npm run start
```
- Servidor en `http://localhost:8000`
- Sin protección de middleware (dashboard visible sin auth)
- Bueno para desarrollo rápido de UI

#### B) Desarrollo Completo (con middleware)
Para probar la seguridad completa como en producción:
```bash
npx vercel dev
```
- Servidor en `http://localhost:3000`
- Middleware funcionando (dashboard protegido)
- Simula exactamente el entorno de Vercel
- Primera vez te pedirá login y configuración

### 2. Iniciar servidor de desarrollo:

**Opción A: Servidor Simple (Desarrollo rápido)**
```bash
npm run start
```
Inicia en `http://localhost:8000` - El middleware NO funciona, solo frontend.

**Opción B: Con Vercel (Probar middleware)**
```bash
npx vercel dev
```
Inicia en `http://localhost:3000` - Simula Vercel completo con middleware.

### 3. Probar la seguridad:

**Test 1: Sin autenticación**
- Abre `http://localhost:3000/dashboard.html`
- Deberías ser redirigido automáticamente a `/index.html`

**Test 2: Con autenticación**
- Inicia sesión con Magic Link desde `http://localhost:3000`
- Revisa tu email y haz clic en el enlace
- Deberías poder acceder al dashboard
- El contenido se mostrará después de verificar la sesión

**Test 3: DevTools**
- Abre DevTools (F12) → Network
- Intenta acceder a `/dashboard.html` sin sesión
- Verás un `302 Redirect` ANTES de que el HTML se envíe

## 🌐 Desplegar en Vercel

### Opción 1: CLI (Más Rápido)

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login
vercel login

# Desplegar
npm run deploy
```

Durante el despliegue:
- Confirma el nombre del proyecto
- Las variables de entorno se configurarán automáticamente desde `.env`

### Opción 2: Interfaz Web

1. Sube tu código a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Add Vercel security with middleware"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/ad-website.git
   git push -u origin main
   ```

2. Ve a [vercel.com/new](https://vercel.com/new)
3. Importa tu repositorio
4. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Despliega

## ⚙️ Configurar Supabase Después del Despliegue

**IMPORTANTE:** Una vez desplegado en Vercel:

1. Ve a Supabase → **Authentication** → **URL Configuration**
2. Agrega a **Redirect URLs**:
   ```
   https://tu-proyecto.vercel.app/dashboard.html
   https://tu-proyecto.vercel.app/dashboard
   http://localhost:3000/dashboard.html  (para desarrollo)
   ```

3. Configura **Site URL**:
   ```
   https://tu-proyecto.vercel.app
   ```

## 📊 Verificar que Funciona

### Verificación de Seguridad:

1. **Intentar acceso sin auth:**
   ```bash
   curl -I https://tu-proyecto.vercel.app/dashboard.html
   ```
   Debería devolver: `HTTP/2 302` (redirect)

2. **Con sesión válida:**
   - Inicia sesión normalmente
   - Accede al dashboard
   - Deberías ver el contenido

3. **Verificar en DevTools:**
   - Sin sesión → Redirect inmediato
   - Con sesión → Contenido visible después de verificación

## 🐛 Solución Rápida de Problemas

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install
```

### Error: "Environment variables not found"
Verifica que `.env` existe y tiene:
```env
NEXT_PUBLIC_SUPABASE_URL=https://kdxfalfojxitoolfhrpr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_W38mKc7B8cOES2pNtz29bQ_Nc0Bq-vx
```

### Error: "Middleware not working"
- Verifica que `middleware.js` esté en la raíz (no en subcarpetas)
- Revisa los logs: `vercel logs --follow`

### Error: "No Output Directory found"

**Síntomas:** Error durante deploy en Vercel

**Soluciones:**
1. Verifica que `vercel.json` incluya: `"outputDirectory": "."`
2. El script build en `package.json` debe ser `":"`
3. Redespliega con: `vercel --prod`

### Puedo ver el dashboard sin autenticación
- Verifica que estés usando `npx vercel dev` (no un servidor HTTP simple)
- El middleware solo funciona en Vercel/Vercel Dev
- Si usas `npm run start`, el middleware NO funcionará (solo para desarrollo frontend)

## 📚 Documentación

- **[README.md](README.md)** - Guía general del proyecto
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía completa de despliegue (MUY DETALLADA)

## 🎯 Próximos Pasos

1. ✅ Probar localmente con `npm run dev`
2. ✅ Verificar que el middleware funciona
3. ✅ Desplegar en Vercel
4. ✅ Configurar URLs en Supabase
5. ✅ Probar en producción

## 💡 Comandos Útiles

```bash simple (sin middleware)
npm run start

# Desarrollo local con Vercel (con middleware)
npx vercelrollo local
npm run dev

# Desplegar a producción
npm run deploy

# Ver logs
vercel logs --follow

# Abrir proyecto en Vercel
vercel open
```

---

**¡Todo listo!** Tu aplicación ahora tiene seguridad de nivel servidor con Vercel Middleware 🔒
