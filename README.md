# Sitio Web Estático con Autenticación Clerk

Este es un sitio web estático de ejemplo que implementa autenticación por email usando [Clerk](https://clerk.com/). Incluye middleware de protección de rutas para páginas que requieren autenticación.

## 📋 Características

- ✅ Autenticación por email con Clerk
- ✅ Middleware de protección de rutas
- ✅ Dashboard protegido para usuarios autenticados
- ✅ Diseño responsive y moderno
- ✅ HTML, CSS y JavaScript puros (sin frameworks)

## 🚀 Configuración Inicial

### 1. Crear una cuenta en Clerk

1. Ve a [https://clerk.com](https://clerk.com) y crea una cuenta gratuita
2. Crea una nueva aplicación en el dashboard de Clerk
3. Selecciona "Email" como método de autenticación

### 2. Obtener las credenciales de Clerk

En el dashboard de Clerk:

1. Ve a la sección **API Keys**
2. Copia tu **Publishable Key** (clave pública)
3. Copia tu **Frontend API** URL

### 3. Configurar el sitio web

#### Opción A: Editar directamente los archivos HTML

Abre `index.html` y busca la línea:

```html
<script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="YOUR_CLERK_PUBLISHABLE_KEY"
    src="https://[your-clerk-frontend-api].clerk.accounts.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
    type="text/javascript"
></script>
```

Reemplaza:
- `YOUR_CLERK_PUBLISHABLE_KEY` con tu Publishable Key
- `[your-clerk-frontend-api]` con tu Frontend API (ejemplo: `clerk.amazing-app-12.lcl.dev`)

Haz lo mismo en `dashboard.html`.

#### Opción B: Usar variables de entorno (recomendado para desarrollo local)

Si usas un servidor local con soporte para variables de entorno, puedes crear un archivo `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_FRONTEND_API=clerk.your-app.lcl.dev
```

## 📂 Estructura del Proyecto

```
ad-website/
├── index.html          # Página principal con login
├── dashboard.html      # Página protegida (requiere autenticación)
├── styles.css          # Estilos CSS
├── auth.js             # Lógica de autenticación para index.html
├── middleware.js       # Middleware de protección para páginas protegidas
└── README.md           # Este archivo
```

## 🔧 Cómo Funciona

### Autenticación (auth.js)

El archivo `auth.js` maneja la autenticación en la página principal:

1. **Inicialización**: Carga el SDK de Clerk cuando la página se carga
2. **Verificación**: Comprueba si el usuario ya está autenticado
3. **UI Dinámica**: Muestra el formulario de login o la información del usuario
4. **Listeners**: Escucha cambios en el estado de autenticación

### Middleware (middleware.js)

El archivo `middleware.js` protege las páginas que requieren autenticación:

1. **Verificación**: Comprueba si el usuario está autenticado al cargar la página
2. **Redirección**: Redirige a usuarios no autenticados a la página principal
3. **Protección**: Oculta el contenido protegido hasta verificar la autenticación
4. **Listeners**: Detecta si el usuario cierra sesión y redirige automáticamente

### Flujo de Usuario

```
1. Usuario visita index.html
   ↓
2. Si NO está autenticado → Muestra formulario de login
   ↓
3. Usuario ingresa email y contraseña
   ↓
4. Clerk autentica al usuario
   ↓
5. Usuario puede acceder a dashboard.html
   ↓
6. Middleware verifica autenticación
   ↓
7. Si está autenticado → Muestra contenido protegido
   Si NO está autenticado → Redirige a index.html
```

## 🌐 Ejecutar el Sitio

### Opción 1: Servidor Local Simple (Python)

```bash
# Python 3
python -m http.server 8000

# O Python 2
python -m SimpleHTTPServer 8000
```

Luego abre: `http://localhost:8000`

### Opción 2: Live Server (VS Code)

1. Instala la extensión "Live Server" en VS Code
2. Haz clic derecho en `index.html`
3. Selecciona "Open with Live Server"

### Opción 3: Node.js (http-server)

```bash
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar servidor
http-server -p 8000
```

### Opción 4: Cualquier servidor web

Puedes usar cualquier servidor web que sirva archivos estáticos:
- Apache
- Nginx
- Caddy
- Netlify
- Vercel
- GitHub Pages

## 🎨 Personalización

### Cambiar Colores

Edita las variables CSS en `styles.css`:

```css
:root {
    --primary-color: #6366f1;      /* Color principal */
    --secondary-color: #8b5cf6;    /* Color secundario */
    --accent-color: #ec4899;       /* Color de acento */
    /* ... más colores */
}
```

### Personalizar Clerk UI

En `auth.js`, puedes personalizar la apariencia del componente de login:

```javascript
Clerk.mountSignIn(signInDiv, {
    appearance: {
        elements: {
            rootBox: 'clerk-root-box',
            card: 'clerk-card',
        },
        variables: {
            colorPrimary: '#6366f1',
            // Añade más variables de personalización
        }
    }
});
```

### Añadir Más Páginas Protegidas

Para crear una nueva página protegida:

1. Crea un nuevo archivo HTML (ejemplo: `profile.html`)
2. Incluye el SDK de Clerk y `middleware.js`:

```html
<script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="YOUR_CLERK_PUBLISHABLE_KEY"
    src="https://[your-clerk-frontend-api].clerk.accounts.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
    type="text/javascript"
></script>
<script src="middleware.js"></script>
```

3. Añade los elementos necesarios:

```html
<div id="loading" class="loading">
    <p>Verificando autenticación...</p>
</div>

<div id="protected-content" style="display: none;">
    <!-- Tu contenido protegido aquí -->
</div>

<div id="unauthorized" style="display: none;">
    <h2>Acceso No Autorizado</h2>
    <a href="index.html">Volver al Inicio</a>
</div>
```

## 🔐 Características Avanzadas

### Control de Acceso Basado en Roles

El middleware incluye funciones para verificar roles:

```javascript
// En middleware.js
if (ClerkMiddleware.hasRole('admin')) {
    // Mostrar contenido solo para administradores
}
```

Para configurar roles en Clerk:
1. Ve al dashboard de Clerk
2. Selecciona un usuario
3. En "Public Metadata", añade:

```json
{
  "roles": ["admin", "user"]
}
```

### Permisos Personalizados

```javascript
if (ClerkMiddleware.hasAccess('view_analytics')) {
    // Mostrar analytics
}
```

Configura permisos en el Public Metadata del usuario:

```json
{
  "permissions": ["view_analytics", "edit_content"]
}
```

## 🐛 Solución de Problemas

### Error: "Clerk is not defined"

**Causa**: El SDK de Clerk no se ha cargado completamente.

**Solución**: Asegúrate de que la URL del script de Clerk sea correcta y que tenga el atributo `async`.

### El formulario de login no aparece

**Causa**: La clave pública de Clerk es incorrecta o no está configurada.

**Solución**: Verifica que `data-clerk-publishable-key` tenga el valor correcto.

### Redirigido inmediatamente desde el dashboard

**Causa**: El usuario no está autenticado o la sesión expiró.

**Solución**: Vuelve a iniciar sesión en `index.html`.

### CORS errors

**Causa**: Estás abriendo el archivo HTML directamente (`file://`) en lugar de usar un servidor.

**Solución**: Usa uno de los métodos de servidor local mencionados arriba.

## 📚 Recursos Adicionales

- [Documentación de Clerk](https://clerk.com/docs)
- [Clerk JavaScript SDK](https://clerk.com/docs/references/javascript/overview)
- [Ejemplos de Clerk](https://github.com/clerk/clerk-docs)

## 📝 Notas de Seguridad

- ✅ **Nunca** incluyas tu Secret Key en código del lado del cliente
- ✅ La Publishable Key es segura para usar en el frontend
- ✅ Todas las verificaciones de autenticación del lado del servidor deben hacerse en Clerk
- ✅ Para aplicaciones en producción, considera implementar un backend

## 🚀 Deploy

### Netlify

1. Sube tu proyecto a GitHub
2. Conecta tu repositorio en Netlify
3. En "Build settings", deja todo vacío (es un sitio estático)
4. Añade las variables de entorno si es necesario
5. Deploy!

### Vercel

```bash
npm install -g vercel
vercel
```

### GitHub Pages

1. Sube el proyecto a un repositorio de GitHub
2. Ve a Settings → Pages
3. Selecciona la rama `main` y carpeta `/root`
4. Tu sitio estará en `https://tu-usuario.github.io/tu-repo`

## 📄 Licencia

Este proyecto es un ejemplo de código abierto. Puedes usarlo libremente para tus propios proyectos.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

---

**¡Disfruta construyendo con Clerk! 🎉**
