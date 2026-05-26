# 📊 Arquitectura del Sistema

## 🏗️ Estructura de Archivos

```
ad-website/
│
├── 📁 api/
│   └── main.py                    # ⚙️ Backend FastAPI completo
│                                  #    - Endpoints de autenticación
│                                  #    - Middleware de protección
│                                  #    - Lógica JWT
│                                  #    - Integración con Resend
│
├── 📁 ad/                         # 🔒 Contenido protegido
│   ├── index.html                 #    Página principal protegida
│   ├── oc.html                    #    (tus páginas existentes)
│   ├── 📁 assets/
│   │   ├── board.json
│   │   ├── gitlab-issues.json
│   │   ├── 📁 css/
│   │   ├── 📁 images/
│   │   └── 📁 js/
│   └── 📁 kanban/
│
├── 📁 public/
│   └── login.html                 # 🔓 Página de login pública
│
├── 📄 vercel.json                 # ⚙️ Configuración de Vercel
├── 📄 requirements.txt            # 📦 Dependencias Python
├── 📄 .env.example                # 🔐 Variables de entorno de ejemplo
├── 📄 .gitignore                  # 🚫 Archivos ignorados por Git
│
├── 📖 README.md                   # 📚 Documentación principal
├── 📖 SETUP.md                    # ⚡ Guía rápida de configuración
├── 📖 EMAIL_CUSTOMIZATION.md      # 📧 Personalización de emails
├── 📖 ARCHITECTURE.md             # 📊 Este archivo
│
└── 🐍 local_dev.py                # 🛠️ Script de utilidades locales
```

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Intenta acceder a   │
                │     /ad/index.html    │
                └───────────┬───────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   Middleware de Protección (FastAPI)  │
        │   Verifica cookie de sesión           │
        └───────────┬──────────────┬────────────┘
                    │              │
            ¿Tiene sesión?         │
                    │              │
        ┌───────────┴──────┐       │
        │ SÍ               │ NO    │
        ▼                  ▼       │
    Servir                Redirigir a
    contenido             /public/login.html
    protegido                     │
        │                         ▼
        │              ┌──────────────────────┐
        │              │ Usuario ingresa email│
        │              └──────────┬───────────┘
        │                         │
        │                         ▼
        │              POST /api/request-login
        │                         │
        │              ┌──────────┴────────────┐
        │              │ Backend verifica si   │
        │              │ email está en whitelist│
        │              └──────────┬────────────┘
        │                         │
        │                    ¿Autorizado?
        │                         │
        │              ┌──────────┴──────────┐
        │              │ SÍ                  │ NO
        │              ▼                     ▼
        │    Genera magic token      Respuesta genérica
        │    Envía email vía Resend  (no revela si está o no)
        │              │
        │              ▼
        │    ┌──────────────────────┐
        │    │ Usuario recibe email │
        │    │ con magic link       │
        │    └──────────┬───────────┘
        │               │
        │               ▼
        │    GET /api/verify?token=XXX
        │               │
        │    ┌──────────┴──────────┐
        │    │ Backend valida JWT  │
        │    └──────────┬──────────┘
        │               │
        │          ¿Token válido?
        │               │
        │    ┌──────────┴──────────┐
        │    │ SÍ                  │ NO
        │    ▼                     ▼
        │  Crea cookie        Muestra error
        │  de sesión          "Token inválido"
        │  (7 días)
        │    │
        │    ▼
        │  Redirige a
        │  /ad/index.html
        │    │
        └────┴─────────────────────────────────┐
                                               │
                            ┌──────────────────┘
                            ▼
                ┌───────────────────────┐
                │   Usuario autenticado │
                │   Acceso completo a   │
                │      todo /ad/*       │
                └───────────────────────┘
```

## 🔐 Sistema de Tokens

### Token de Magic Link (Corta duración)

```
┌─────────────────────────────────────────┐
│           MAGIC TOKEN (JWT)             │
├─────────────────────────────────────────┤
│ Payload:                                │
│   - sub: email del usuario              │
│   - type: "magic"                       │
│   - exp: 15 minutos                     │
│                                         │
│ Firmado con: JWT_SECRET                 │
│ Algoritmo: HS256                        │
│                                         │
│ Uso: Una sola vez                       │
│ Transportado vía: URL query parameter   │
└─────────────────────────────────────────┘
```

### Token de Sesión (Larga duración)

```
┌─────────────────────────────────────────┐
│          SESSION TOKEN (JWT)            │
├─────────────────────────────────────────┤
│ Payload:                                │
│   - sub: email del usuario              │
│   - type: "session"                     │
│   - exp: 7 días                         │
│                                         │
│ Firmado con: JWT_SECRET                 │
│ Algoritmo: HS256                        │
│                                         │
│ Uso: Múltiples requests                 │
│ Transportado vía: Cookie httpOnly       │
│                                         │
│ Cookie config:                          │
│   - httpOnly: true                      │
│   - secure: true (HTTPS)                │
│   - sameSite: lax                       │
└─────────────────────────────────────────┘
```

## 🛡️ Capas de Seguridad

```
┌────────────────────────────────────────────────┐
│ Capa 1: Whitelist Hardcodeada                 │
│ - Lista de emails autorizados en backend      │
│ - No expuesta al cliente                      │
└────────────────────┬───────────────────────────┘
                     │
┌────────────────────▼───────────────────────────┐
│ Capa 2: JWT Firmado                           │
│ - Tokens firmados con secreto                 │
│ - No pueden falsificarse                      │
│ - Verificación en cada request                │
└────────────────────┬───────────────────────────┘
                     │
┌────────────────────▼───────────────────────────┐
│ Capa 3: Expiración de Tokens                  │
│ - Magic link: 15 minutos                      │
│ - Sesión: 7 días                              │
│ - Tokens expirados rechazados automáticamente │
└────────────────────┬───────────────────────────┘
                     │
┌────────────────────▼───────────────────────────┐
│ Capa 4: Cookies Seguras                       │
│ - httpOnly: No accesible vía JavaScript       │
│ - secure: Solo HTTPS en producción            │
│ - sameSite: Protección contra CSRF            │
└────────────────────┬───────────────────────────┘
                     │
┌────────────────────▼───────────────────────────┐
│ Capa 5: Middleware de Rutas                   │
│ - Protección automática de /ad/*              │
│ - Verificación antes de servir contenido      │
│ - Redirección a login si no autenticado       │
└────────────────────────────────────────────────┘
```

## 📡 API Endpoints

### 🔓 Públicos

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/public/login.html` | GET | Página de login |
| `/api/request-login` | POST | Solicitar magic link |
| `/api/verify?token=XXX` | GET | Verificar magic link |
| `/api/health` | GET | Health check |

### 🔒 Protegidos (requieren sesión)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/ad/*` | GET | Todo el contenido bajo /ad |
| `/api/check-auth` | GET | Verificar autenticación |
| `/api/logout` | GET | Cerrar sesión |

## 🗄️ Almacenamiento (Sin Base de Datos)

```
┌─────────────────────────────────────────────┐
│ ¿Dónde se almacena cada cosa?               │
├─────────────────────────────────────────────┤
│                                             │
│ Whitelist de emails                         │
│   └─> Hardcodeada en api/main.py           │
│                                             │
│ JWT Secret                                  │
│   └─> Variable de entorno (Vercel)         │
│                                             │
│ Sesión del usuario                          │
│   └─> Cookie en navegador (JWT)            │
│                                             │
│ Estado de autenticación                     │
│   └─> Validado en cada request vía JWT     │
│                                             │
│ NO hay base de datos                        │
│ NO hay Redis                                │
│ NO hay almacenamiento persistente           │
│                                             │
└─────────────────────────────────────────────┘
```

## 🚀 Despliegue en Vercel

```
┌────────────────────────────────────────────┐
│            VERCEL SERVERLESS               │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Function: api/main.py               │ │
│  │  Runtime: Python 3.9+                │ │
│  │  Tipo: Serverless Function           │ │
│  │  Cold Start: ~1-2s                   │ │
│  │  Max Duration: 10s (Hobby)           │ │
│  │                                      │ │
│  │  Handles:                            │ │
│  │    - /api/*                          │ │
│  │    - /ad/* (con middleware)          │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Static Files                        │ │
│  │    - /public/*                       │ │
│  │    - Servidos directamente por CDN   │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Environment Variables               │ │
│  │    - JWT_SECRET                      │ │
│  │    - RESEND_API_KEY                  │ │
│  │    - BASE_URL                        │ │
│  │    - FROM_EMAIL                      │ │
│  └──────────────────────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

## 📊 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                       NAVEGADOR                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ login.html   │  │ Session      │  │ /ad/index.html  │   │
│  │ (público)    │  │ Cookie       │  │ (protegido)     │   │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬───────┘   │
└─────────┼──────────────────┼────────────────────┼───────────┘
          │                  │                    │
          │ POST email       │ enviada en         │ GET request
          │                  │ cada request       │
          ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL / FASTAPI                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Middleware de Protección               │   │
│  │         Intercepta requests a /ad/*                 │   │
│  │         Verifica cookie de sesión                   │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│  ┌─────────────────────┴───────────────────────────────┐   │
│  │              Endpoints FastAPI                      │   │
│  │                                                     │   │
│  │  /api/request-login  →  Verifica whitelist         │   │
│  │                      →  Genera magic token         │   │
│  │                      →  Llama a Resend             │   │
│  │                                                     │   │
│  │  /api/verify        →  Valida magic token          │   │
│  │                     →  Crea session token          │   │
│  │                     →  Establece cookie            │   │
│  │                                                     │   │
│  │  /ad/*              →  Sirve archivos protegidos   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ API Call
                           ▼
                  ┌─────────────────┐
                  │     RESEND      │
                  │   Email API     │
                  │                 │
                  │  Envía magic    │
                  │  link por email │
                  └─────────────────┘
```

## 🔄 Estados de Usuario

```
┌──────────────┐
│  Anónimo     │
│              │
│ - Sin cookie │
│ - /ad/ → 302 │
└──────┬───────┘
       │
       │ Solicita login
       ▼
┌──────────────┐
│ Pendiente    │
│              │
│ - Email      │
│   enviado    │
│ - Esperando  │
│   clic       │
└──────┬───────┘
       │
       │ Clic en magic link
       ▼
┌──────────────┐
│ Autenticado  │
│              │
│ - Cookie     │
│   válida     │
│ - Acceso a   │
│   /ad/*      │
└──────┬───────┘
       │
       │ Después de 7 días o logout
       ▼
┌──────────────┐
│  Expirado    │
│              │
│ - Cookie     │
│   eliminada  │
│ - /ad/ → 302 │
└──────────────┘
```

## 💡 Características Clave

### ✅ Ventajas

- **Sin base de datos**: Simplicidad máxima
- **Serverless**: Escala automáticamente
- **Seguro**: JWT + cookies httpOnly
- **Simple**: Fácil de mantener y entender
- **Rápido**: Deploy en minutos
- **Económico**: Free tier de Vercel suficiente

### ⚠️ Limitaciones

- No hay registro de usuarios (whitelist manual)
- No hay persistencia de datos de usuario
- No hay roles/permisos granulares
- Cold start en Vercel (~1-2s primera request)
- Límite de duración de function (10s en Hobby tier)

### 🎯 Ideal Para

- ✅ Proteger contenido estático
- ✅ Equipos pequeños (< 100 usuarios)
- ✅ Acceso basado en email verificado
- ✅ Prototipado rápido
- ✅ Landing pages privadas
- ✅ Documentación interna

### ❌ No Recomendado Para

- ❌ Aplicaciones con miles de usuarios
- ❌ Necesidad de perfiles de usuario complejos
- ❌ Gestión de permisos granulares
- ❌ Datos de usuario persistentes
- ❌ Features sociales (comments, likes, etc.)

---

**Última actualización:** Mayo 2026
