# ✅ Checklist Pre-Deployment

Usa esta lista para verificar que todo está configurado correctamente antes de desplegar a producción.

## 📋 Configuración Básica

### Backend (api/main.py)

- [ ] **Whitelist de emails configurada**
  ```python
  ALLOWED_EMAILS = [
      "email1@ejemplo.com",
      "email2@ejemplo.com",
  ]
  ```
  📍 Línea ~35 en `api/main.py`

- [ ] **Tiempo de expiración ajustado** (opcional)
  ```python
  MAGIC_LINK_EXPIRE_MINUTES = 15  # Duración del magic link
  SESSION_EXPIRE_DAYS = 7         # Duración de la sesión
  ```
  📍 Línea ~30 en `api/main.py`

### Variables de Entorno

- [ ] **JWT_SECRET generado**
  ```bash
  # Generar con:
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
  ⚠️ IMPORTANTE: Debe ser aleatorio y seguro

- [ ] **RESEND_API_KEY obtenido**
  - [ ] Cuenta creada en https://resend.com
  - [ ] API Key generada (empieza con `re_`)
  - [ ] API Key copiada de forma segura

- [ ] **BASE_URL configurado**
  - Desarrollo: `http://localhost:8000`
  - Producción: `https://tu-dominio.vercel.app`

- [ ] **FROM_EMAIL configurado**
  - [ ] Dominio verificado en Resend
  - [ ] O usando dominio de prueba: `onboarding@resend.dev`

## 🔧 Vercel Configuration

### Dashboard de Vercel

- [ ] **Proyecto creado en Vercel**
- [ ] **Repositorio conectado** (si usas Git deployment)
- [ ] **Variables de entorno agregadas**:
  - [ ] `JWT_SECRET`
  - [ ] `RESEND_API_KEY`
  - [ ] `BASE_URL`
  - [ ] `FROM_EMAIL`

### vercel.json

- [ ] **Archivo vercel.json presente en la raíz**
- [ ] **Rutas configuradas correctamente**
  ```json
  {
    "routes": [
      {"src": "/api/(.*)", "dest": "api/main.py"},
      {"src": "/ad/(.*)", "dest": "api/main.py"},
      ...
    ]
  }
  ```

## 📧 Resend Configuration

- [ ] **Cuenta de Resend activa**
- [ ] **Email verificado** (para recibir notificaciones)

### Dominio (si usas dominio personalizado)

- [ ] **Dominio agregado en Resend**
- [ ] **Registros DNS configurados**:
  - [ ] MX record
  - [ ] TXT record (SPF)
  - [ ] CNAME record (DKIM)
- [ ] **Dominio verificado** (checkmark verde en Resend)

⏱️ La verificación puede tardar hasta 48 horas

## 📁 Archivos del Proyecto

- [ ] **Estructura de archivos correcta**:
  ```
  ├── api/main.py
  ├── public/login.html
  ├── ad/index.html (y otros archivos)
  ├── vercel.json
  ├── requirements.txt
  └── .env.example
  ```

- [ ] **requirements.txt completo**:
  ```
  fastapi==0.109.0
  python-jose[cryptography]==3.3.0
  resend==0.8.0
  python-multipart==0.0.6
  uvicorn==0.27.0
  python-dotenv==1.0.0
  ```

- [ ] **.gitignore configurado** (no subir .env a Git)
  ```
  .env
  .env.local
  __pycache__/
  .vercel
  ```

## 🎨 Personalización (Opcional)

- [ ] **Email HTML personalizado** (en `api/main.py`)
  - [ ] Logo agregado
  - [ ] Colores de marca aplicados
  - [ ] Texto adaptado a tu organización

- [ ] **Página de login personalizada** (`public/login.html`)
  - [ ] Título y descripción actualizados
  - [ ] Colores/estilos ajustados
  - [ ] Logo agregado (si aplica)

## 🧪 Testing Local (Antes de Deploy)

- [ ] **Entorno virtual creado**
  ```bash
  python -m venv venv
  source venv/bin/activate  # Windows: venv\Scripts\activate
  ```

- [ ] **Dependencias instaladas**
  ```bash
  pip install -r requirements.txt
  ```

- [ ] **Archivo .env creado** (copiar de .env.example)
  ```bash
  cp .env.example .env
  ```

- [ ] **Variables en .env configuradas**

- [ ] **Servidor local funciona**
  ```bash
  uvicorn api.main:app --reload --port 8000
  ```

- [ ] **Login local funciona**
  - [ ] Visitar `http://localhost:8000/public/login.html`
  - [ ] Ingresar email de la whitelist
  - [ ] Recibir email con magic link
  - [ ] Clic en link funciona
  - [ ] Redirección a `/ad/` exitosa

- [ ] **Protección de rutas funciona**
  - [ ] `/ad/` sin login → redirige a login ✅
  - [ ] `/ad/` con sesión → muestra contenido ✅
  - [ ] Logout funciona → vuelve a login ✅

## 🚀 Deployment

- [ ] **Push a repositorio Git** (si usas Git deployment)
  ```bash
  git add .
  git commit -m "Setup magic link authentication"
  git push origin main
  ```

- [ ] **O deploy directo**
  ```bash
  vercel --prod
  ```

- [ ] **Deployment exitoso**
  - [ ] Sin errores de build
  - [ ] URL de producción generada
  - [ ] Functions deployed correctamente

## ✅ Verificación Post-Deployment

### Tests Funcionales

- [ ] **Health check funciona**
  - Visitar: `https://tu-dominio.vercel.app/api/health`
  - Debe retornar: `{"status": "healthy", ...}`

- [ ] **Login page carga**
  - Visitar: `https://tu-dominio.vercel.app/`
  - Debe mostrar página de login

- [ ] **Protección funciona**
  - Visitar: `https://tu-dominio.vercel.app/ad/`
  - Debe redirigir a login si no hay sesión

- [ ] **Flow completo funciona**:
  1. [ ] Ingresar email autorizado
  2. [ ] Recibir email
  3. [ ] Clic en magic link
  4. [ ] Redirección a `/ad/`
  5. [ ] Contenido se muestra correctamente
  6. [ ] Email del usuario visible en header
  7. [ ] Logout funciona

### Tests de Seguridad

- [ ] **No se puede acceder a /ad sin sesión**
  - Abrir ventana incógnito
  - Intentar `https://tu-dominio.vercel.app/ad/`
  - Debe redirigir a login

- [ ] **Email no autorizado no recibe link**
  - Probar con email que NO está en whitelist
  - Debe mostrar mensaje genérico
  - NO debe recibir email

- [ ] **Token expirado no funciona**
  - Esperar 15+ minutos después de recibir email
  - Clic en magic link viejo
  - Debe mostrar "Token inválido o expirado"

- [ ] **Cookie es httpOnly**
  - Abrir DevTools → Application/Storage → Cookies
  - Verificar que `session_token` tiene flag `HttpOnly`

### Tests de Email

- [ ] **Email llega correctamente**
- [ ] **Email no está en spam**
- [ ] **Email se ve bien en diferentes clientes**:
  - [ ] Gmail (web)
  - [ ] Outlook/Hotmail
  - [ ] Apple Mail (si usas Mac/iPhone)
- [ ] **Magic link es clickeable**
- [ ] **Email tiene formato correcto** (no texto plano roto)

### Tests de Performance

- [ ] **Primera carga aceptable** (cold start ~1-3s)
- [ ] **Cargas subsecuentes rápidas** (<500ms)
- [ ] **Archivos estáticos se sirven rápido**

## 📊 Monitoring

- [ ] **Logs de Vercel revisados**
  ```bash
  vercel logs --follow
  ```

- [ ] **No hay errores en logs**
- [ ] **Resend dashboard muestra emails enviados**

## 🔐 Security Checklist

- [ ] **JWT_SECRET es fuerte** (mínimo 32 caracteres aleatorios)
- [ ] **JWT_SECRET NO está en código** (solo en variables de entorno)
- [ ] **Cookies usan flags de seguridad**:
  - [ ] `httpOnly=true`
  - [ ] `secure=true`
  - [ ] `sameSite='lax'`
- [ ] **HTTPS habilitado** (automático en Vercel)
- [ ] **.env NO está en Git** (verificar .gitignore)
- [ ] **No hay API keys en código**

## 📚 Documentation

- [ ] **README.md actualizado con tu dominio**
- [ ] **SETUP.md revisado**
- [ ] **Equipo/stakeholders notificados**
- [ ] **Emails autorizados documentados** (fuera de Git si es sensible)

## 🎉 Launch Checklist

- [ ] **Notificar a usuarios autorizados**
- [ ] **Enviar instrucciones de uso**
- [ ] **Tener soporte disponible** (para dudas iniciales)
- [ ] **Monitorear logs primeras horas**

---

## 🆘 Troubleshooting Rápido

### "No llega el email"
1. Verificar RESEND_API_KEY en Vercel
2. Revisar logs de Vercel: `vercel logs`
3. Verificar dominio en Resend
4. Revisar carpeta de spam

### "Token inválido"
1. Verificar JWT_SECRET en Vercel
2. Generar nuevo magic link
3. Verificar que no pasaron 15 minutos

### "Redirección infinita"
1. Verificar que cookies se están estableciendo
2. Abrir DevTools → Application → Cookies
3. Verificar flag `secure` (debe ser `true` en HTTPS)

### "500 Internal Server Error"
1. Ver logs: `vercel logs`
2. Verificar todas las env vars están configuradas
3. Verificar sintaxis de Python en `main.py`

---

## ✨ ¡Todo listo!

Si todas las casillas están marcadas, tu sistema está listo para producción.

**Última revisión:** Mayo 2026
