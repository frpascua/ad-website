# Sitio Web con Autenticación Supabase

Este es un sitio web estático con autenticación mediante **Magic Link** (enlace mágico) usando Supabase Auth. Sin contraseñas, más seguro y fácil de usar.

## ✨ ¿Qué es Magic Link?

Magic Link es un método de autenticación sin contraseña donde:
1. El usuario ingresa su email
2. Supabase envía un enlace único al email
3. El usuario hace clic en el enlace
4. Queda autenticado automáticamente

**Ventajas:**
- ✅ Sin contraseñas que recordar
- ✅ Más seguro (el enlace expira)
- ✅ Funciona tanto para registro como login
- ✅ Mejor experiencia de usuario

## 🚀 Características

- ✅ Autenticación con Magic Link (enlace mágico por email)
- ✅ Autenticación con Google (OAuth)
- ✅ Dashboard protegido para usuarios autenticados
- ✅ Cierre de sesión
- ✅ Diseño responsive y moderno
- ✅ Sin contraseñas - más seguro y fácil
- ✅ Mensajes de error y éxito

## 📋 Requisitos Previos

1. Una cuenta en [Supabase](https://supabase.com)
2. Un proyecto creado en Supabase
3. Un navegador web moderno

## 🔧 Configuración

### Paso 1: Crear un Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. Espera a que el proyecto se inicialice (puede tomar unos minutos)

### Paso 2: Obtener las Credenciales

1. En tu proyecto de Supabase, ve a **Settings** (Configuración) → **API**
2. Copia los siguientes valores:
   - **Project URL** (URL del proyecto)
   - **Publishable key** (Clave pública)

### Paso 3: Configurar el Archivo auth.js

1. Abre el archivo `auth.js`
2. Busca estas líneas al inicio del archivo:
   ```javascript
   const SUPABASE_URL = 'TU_SUPABASE_URL';
   const SUPABASE_PUBLISHABLE_KEY = 'TU_SUPABASE_PUBLISHABLE_KEY';
   ```
3. Reemplaza `TU_SUPABASE_URL` con tu Project URL
4. Reemplaza `TU_SUPABASE_PUBLISHABLE_KEY` con tu Publishable key

### Paso 4: Configurar la Autenticación en Supabase

1. En tu proyecto de Supabase, ve a **Authentication** → **Providers**
2. Asegúrate de que **Email** esté habilitado
3. **IMPORTANTE:** Configura las URLs de redirección:
   - Ve a **Authentication** → **URL Configuration**
   - Agrega tu URL local a **Redirect URLs**: `http://localhost:8000/dashboard.html` (ajusta el puerto según tu servidor)
   - Para producción, agrega también tu dominio: `https://tudominio.com/dashboard.html`
4. En **Authentication** → **Email Templates**, personaliza la plantilla "Magic Link" si lo deseas
5. (Opcional) Para habilitar Google OAuth:
   - Habilita el proveedor **Google**
   - Sigue las instrucciones para configurar OAuth con Google
   - Agrega tu URL de redirección autorizada

## 🎯 Uso

### Abrir el Sitio Web

Puedes abrir el sitio de varias formas:

1. **Directamente en el navegador:**
   - Abre `index.html` en tu navegador favorito

2. **Con un servidor local (recomendado):**
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js (npx)
   npx http-server
   
   # Con VS Code Live Server
   # Instala la extensión "Live Server" y haz clic derecho en index.html
   ```

### Iniciar Sesión con Magic Link

1. Abre `index.html` en tu navegador
2. Ingresa tu email
3. Haz clic en **"Enviar enlace mágico"**
4. Revisa tu email y haz clic en el enlace recibido
5. Serás redirigido automáticamente al dashboard

**Ventajas del Magic Link:**
- No necesitas recordar contraseñas
- Más seguro (el enlace expira)
- Funciona tanto para registro como para login

### Iniciar Sesión con Google

1. Haz clic en el botón **"Continuar con Google"**
2. Selecciona tu cuenta de Google
3. Serás redirigido al dashboard

## 📁 Estructura del Proyecto

```
ad-website/
├── index.html          # Página principal (Magic Link)
├── dashboard.html      # Página protegida (dashboard)
├── styles.css          # Estilos CSS
├── auth.js            # Lógica de autenticación con Magic Link
├── middleware.js       # Middleware de Vercel para proteger rutas
├── vercel.json        # Configuración de Vercel
├── package.json       # Dependencias del proyecto
├── .env               # Variables de entorno (no commitear)
├── .env.example       # Ejemplo de variables de entorno
├── .gitignore         # Archivos ignorados por Git
├── README.md          # Guía general
└── DEPLOYMENT.md      # Guía de despliegue en Vercel
```

## 🔒 Seguridad

### Políticas de Row Level Security (RLS)

Si planeas almacenar datos de usuarios en tablas personalizadas:

1. Ve a **Database** → **Tables**
2. Selecciona tu tabla
3. Habilita **Row Level Security (RLS)**
4. Crea políticas para proteger los datos:

```sql
-- Ejemplo: Los usuarios solo pueden ver sus propios datos
CREATE POLICY "Users can view own data" 
ON your_table
FOR SELECT 
USING (auth.uid() = user_id);

-- Ejemplo: Los usuarios solo pueden insertar sus propios datos
CREATE POLICY "Users can insert own data" 
ON your_table
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

## 🎨 Personalización

### Cambiar el tiempo de expiración del Magic Link

En Supabase:
1. Ve a **Authentication** → **Email Templates**
2. Selecciona **Magic Link**
3. Ajusta el tiempo de expiración del enlace (por defecto 1 hora)

### Cambiar Colores

Edita las variables CSS en `styles.css`:

```css
:root {
    --primary-color: #3b82f6;      /* Color principal */
    --primary-hover: #2563eb;      /* Color hover */
Con Magic Link, puedes agregar metadata adicional:

1. Modifica el formulario en `index.html` para incluir más campos
2. Actualiza la función `handleMagicLink()` en `auth.js`:

```javascript
const { data, error } = await window.supabase.auth.signInWithOtp({
    email: email,
    options: {
        emailRedirectTo: `${window.location.origin}/dashboard.html`,a función `handleRegister()` en `auth.js`
3. Usa `metadata` para campos adicionales:

```javascript
const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
        data: {
            nombre: nombre,
            apellido: apellido
        }
    }
});
```

## 🐛 Solución de Problemas

### "Invalid API Key" o "Invalid Project URL"

- Verifica que hayas copiado correctamente las credenciales de Supabase
- Asegúrate de no tener espacios al inicio o final de las credenciales

### "Email not confirmed"

- Con Magic Link no necesitas confirmación manual
- El enlace mágico autentica automáticamente al usuario
- Si tienes problemas, verifica que el proveedor Email esté habilitado en Supabase

### OAuth de Google no funciona

- Verifica que hayas configurado correctamente las credenciales de Google
- Asegúrate de que la URL de redirección esté autorizada
- Usa un servidor local (no `file://`)

### CORS Errors

- Usa un servidor local en lugar de abrir archivos directamente
- Verifica la configuración de CORS en Supabase si usas dominios personalizados

## 📚 Recursos Adicionales

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signup)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)

## 🤝 Contribuciones

Este es un proyecto de ejemplo. Siéntete libre de modificarlo y mejorarlo según tus necesidades.

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso libre.

## 🚀 Despliegue en Vercel

Para desplegar este proyecto en Vercel con protección de rutas en el servidor:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Probar localmente:**
   ```bash
   npm run dev
   ```

3. **Desplegar:**
   - Lee la [Guía de Despliegue Completa](DEPLOYMENT.md)
   - Sigue los pasos para configurar Vercel
   - Configura las variables de entorno
   - El middleware protegerá el dashboard automáticamente

### 🔒 Seguridad

Este proyecto incluye múltiples capas de seguridad:

1. **Middleware de Vercel (Edge)**: Verifica autenticación ANTES de servir el HTML
2. **Verificación Cliente-Side**: JavaScript oculta contenido hasta verificar sesión
3. **Row Level Security**: Configurable en Supabase para proteger datos
4. **Headers de Seguridad**: Configurados en `vercel.json`

---

¡Desarrollado con ❤️ usando Supabase y Vercel!
