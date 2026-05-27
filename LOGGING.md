# 📊 Sistema de Logging y Auditoría

La aplicación implementa un sistema completo de logging para registrar todos los intentos de acceso y eventos de autenticación.

---

## 🎯 ¿Qué se Registra?

El sistema registra automáticamente:

### ✅ Eventos Exitosos
- **Solicitud de Magic Link autorizada** - Email está en whitelist
- **Login exitoso** - Magic Link verificado correctamente
- **Acceso autorizado** - Usuario accede a página protegida
- **Logout** - Usuario cierra sesión

### ⚠️ Eventos Fallidos
- **Intento de login denegado** - Email no autorizado
- **Intento de acceso sin token** - Usuario sin sesión válida
- **Token inválido o expirado** - Sesión caducada o token corrupto
- **Error al verificar Magic Link** - Token inválido o expirado

---

## 📝 Formato de Logs

Cada entrada de log incluye:

```
2026-05-27 14:32:15 [INFO] Login exitoso - Magic Link verificado {
  "email": "admin@unirioja.es",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
}
```

**Campos registrados:**
- `timestamp` - Fecha y hora exacta del evento
- `level` - Nivel de log (INFO, WARN, ERROR)
- `message` - Descripción del evento
- `email` - Email del usuario (cuando aplica)
- `ip` - Dirección IP del cliente
- `userAgent` - Navegador y sistema operativo
- `ruta` - URL solicitada
- `razon` - Motivo de rechazo (en accesos denegados)

---

## 📁 Ubicación de Archivos de Log

```
logs/
├── access-2026-05-27.log
├── access-2026-05-26.log
├── access-2026-05-25.log
└── ...
```

**Características:**
- ✅ **Rotación diaria automática** - Nuevo archivo cada día
- ✅ **Retención de 30 días** - Logs antiguos se eliminan automáticamente
- ✅ **Tamaño máximo: 20 MB** - Si un log supera este tamaño, rota automáticamente
- ✅ **Formato: YYYY-MM-DD** - Fácil de localizar por fecha

---

## 🔍 Ejemplos de Logs

### Login Exitoso

```log
2026-05-27 10:30:45 [INFO] Solicitud de Magic Link autorizada {
  "email": "admin@unirioja.es",
  "ip": "203.0.113.42",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"
}

2026-05-27 10:31:12 [INFO] Login exitoso - Magic Link verificado {
  "email": "admin@unirioja.es",
  "ip": "203.0.113.42",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"
}

2026-05-27 10:31:15 [INFO] Acceso autorizado {
  "email": "admin@unirioja.es",
  "ruta": "/dashboard",
  "ip": "203.0.113.42",
  "userAgent": "Mozilla/5.0..."
}
```

### Login Denegado (Email No Autorizado)

```log
2026-05-27 11:15:22 [WARN] Intento de login denegado - Email no autorizado {
  "email": "hacker@spam.com",
  "ip": "198.51.100.99",
  "userAgent": "curl/7.68.0",
  "razon": "No está en ALLOWED_EMAILS"
}
```

### Token Expirado

```log
2026-05-27 15:42:30 [WARN] Token inválido o expirado {
  "error": "jwt expired",
  "ruta": "/dashboard",
  "ip": "203.0.113.42",
  "userAgent": "Mozilla/5.0..."
}
```

### Intento de Acceso Sin Autenticación

```log
2026-05-27 16:20:18 [WARN] Intento de acceso sin token {
  "ruta": "/perfil",
  "ip": "198.51.100.123",
  "userAgent": "wget/1.20.3"
}
```

### Logout

```log
2026-05-27 17:00:05 [INFO] Logout {
  "email": "admin@unirioja.es",
  "ip": "203.0.113.42",
  "userAgent": "Mozilla/5.0..."
}
```

---

## 🔧 Configuración

El sistema de logging está configurado automáticamente en `api/index.js`:

```javascript
const accessLogTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d', // Mantener logs de 30 días
});
```

### Cambiar Retención de Logs

Para mantener logs por más o menos días, edita `api/index.js`:

```javascript
maxFiles: '90d', // Mantener 90 días
maxFiles: '7d',  // Mantener solo 7 días
```

### Cambiar Tamaño Máximo de Archivo

```javascript
maxSize: '50m',  // 50 megabytes
maxSize: '100m', // 100 megabytes
```

---

## 📊 Análisis de Logs

### Ver Logs del Día Actual

```powershell
# PowerShell
Get-Content logs/access-$(Get-Date -Format "yyyy-MM-dd").log -Tail 50

# Ver en tiempo real (seguir)
Get-Content logs/access-$(Get-Date -Format "yyyy-MM-dd").log -Wait
```

### Buscar Intentos de Acceso Denegados

```powershell
# Buscar todos los intentos denegados
Select-String -Path "logs/*.log" -Pattern "denegado"

# Buscar intentos de un email específico
Select-String -Path "logs/*.log" -Pattern "hacker@spam.com"
```

### Contar Logins Exitosos del Día

```powershell
(Select-String -Path "logs/access-$(Get-Date -Format "yyyy-MM-dd").log" -Pattern "Login exitoso").Count
```

### Ver Todos los Logins de un Usuario

```powershell
Select-String -Path "logs/*.log" -Pattern "admin@unirioja.es"
```

### Identificar IPs Sospechosas

```powershell
# Ver intentos fallidos agrupados por IP
Select-String -Path "logs/*.log" -Pattern "denegado|sin token" | 
  ForEach-Object { $_.Line } | 
  Select-String -Pattern '"ip":"([^"]+)"' | 
  Group-Object -Property Matches -NoElement | 
  Sort-Object Count -Descending
```

---

## 🛡️ Seguridad y Privacidad

### Buenas Prácticas

- ✅ **Los logs NO se suben a Git** - `.gitignore` los excluye automáticamente
- ✅ **Contienen datos sensibles** - IPs, emails, user agents
- ✅ **Solo accesibles por administradores** - Protege la carpeta `logs/`
- ✅ **Rotación automática** - No consumen espacio infinito
- ⚠️ **Cumplimiento GDPR** - Considera la retención de datos personales

### Proteger Logs en Producción (Vercel)

**Importante:** La aplicación detecta automáticamente si está corriendo en Vercel y ajusta el sistema de logging:

- **Desarrollo Local** → Logs a archivos con rotación diaria en `logs/`
- **Producción (Vercel)** → Logs a consola, visibles en Vercel Logs Dashboard

#### Ver Logs en Vercel

Los logs están disponibles en tiempo real en el Dashboard de Vercel con **metadatos completos** en formato limpio:

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Functions"** o **"Logs"**
3. Verás todos los eventos de acceso en tiempo real con detalles completos

**Formato en Vercel (sin códigos de color ANSI):**
```
14:32:15 [INFO] Login exitoso - Magic Link verificado {"email":"admin@unirioja.es","ip":"203.0.113.42","userAgent":"Mozilla/5.0..."}
14:32:20 [WARN] Intento de acceso sin token {"ruta":"/dashboard","ip":"198.51.100.99","userAgent":"curl/7.68.0"}
14:35:10 [WARN] Token inválido o expirado {"email":"test@example.com","error":"jwt expired","ruta":"/perfil","ip":"203.0.113.42","userAgent":"Mozilla/5.0..."}
```

**Importante:** 
- ✅ Los logs en producción **NO usan colorización ANSI** para evitar interferencias con el visor de logs de Vercel
- ✅ Todos los metadatos (email, IP, userAgent, ruta, error) están siempre presentes
- ✅ Nunca se omite información de contexto crítica para auditoría y seguridad
- ✅ El formato es `HH:mm:ss [LEVEL] mensaje {metadatos JSON}`

#### Retención de Logs en Vercel

| Plan | Retención | Búsqueda |
|------|-----------|----------|
| **Hobby (Gratuito)** | 1 hora | Limitada |
| **Pro** | 7 días | Completa |
| **Enterprise** | 30 días+ | Avanzada |

#### Soluciones para Retención Extendida

Si necesitas mantener logs por más tiempo, usa servicios externos:

##### Opción 1: Vercel Log Drains (Recomendado)

Envía logs automáticamente a servicios externos:

1. Vercel Dashboard → Settings → **Log Drains**
2. Conecta con:
   - **Datadog** - Análisis avanzado
   - **Logtail** - Gratuito hasta 1 GB/mes
   - **Papertrail** - Gratuito hasta 50 MB/mes
   - **Better Stack** - UI moderna
   - Cualquier endpoint HTTPS personalizado

##### Opción 2: Logging Service con Winston Transport

**Configuración con Logtail:**

```javascript
// Instalar: pnpm add @logtail/node @logtail/winston
const { Logtail } = require("@logtail/node");
const { LogtailTransport } = require("@logtail/winston");

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);

const accessLogger = winston.createLogger({
  transports: [
    new LogtailTransport(logtail),
    // ... otros transportes
  ]
});
```

#### Opción 2: Base de Datos

Guarda logs en PostgreSQL, MongoDB, o Supabase:

```javascript
// Ejemplo con Supabase
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function logAccess(event, data) {
  await supabase.from('access_logs').insert({
    event,
    email: data.email,
    ip: data.ip,
    user_agent: data.userAgent,
    timestamp: new Date()
  });
}
```

#### Opción 3: Vercel Log Drains

Configura Vercel para enviar logs a un servicio externo:

1. Vercel Dashboard → Settings → Log Drains
2. Agrega un endpoint HTTPS que reciba los logs
3. Los logs se enviarán automáticamente

---

## 📈 Métricas Útiles

### Dashboard de Métricas (Ejemplo)

```powershell
# Script para generar reporte diario
$fecha = Get-Date -Format "yyyy-MM-dd"
$logFile = "logs/access-$fecha.log"

Write-Host "=== REPORTE DE ACCESO - $fecha ===" -ForegroundColor Cyan

# Logins exitosos
$logins = (Select-String -Path $logFile -Pattern "Login exitoso").Count
Write-Host "✅ Logins exitosos: $logins" -ForegroundColor Green

# Intentos denegados
$denegados = (Select-String -Path $logFile -Pattern "denegado").Count
Write-Host "⛔ Intentos denegados: $denegados" -ForegroundColor Red

# Accesos sin token
$sinToken = (Select-String -Path $logFile -Pattern "sin token").Count
Write-Host "⚠️  Accesos sin token: $sinToken" -ForegroundColor Yellow

# Logouts
$logouts = (Select-String -Path $logFile -Pattern "Logout").Count
Write-Host "👋 Logouts: $logouts" -ForegroundColor White
```

---

## 🔍 Auditoría y Compliance

El sistema de logging cumple con requisitos de:

- ✅ **Trazabilidad completa** - Todos los accesos registrados
- ✅ **Identificación de usuarios** - Email en cada evento
- ✅ **Timestamp preciso** - Fecha y hora de cada acción
- ✅ **Información de contexto** - IP, user agent, ruta
- ✅ **Separación de niveles** - INFO, WARN, ERROR
- ✅ **Retención configurable** - Ajustable según normativa

---

## 📚 Archivos Relacionados

- `api/index.js` - Configuración de winston y logging
- `.gitignore` - Excluye carpeta `logs/` de Git
- `logs/` - Directorio con archivos de log (auto-creado)

---

## 🔧 Solución de Problemas

### Los archivos de log se crean pero están vacíos

**Síntoma:** El archivo `logs/access-YYYY-MM-DD.log` existe pero tiene 0 bytes.

**Causa:** Winston DailyRotateFile necesita que el directorio de logs exista **antes** de iniciar el logger.

**Solución:** El código en `api/index.js` ahora crea el directorio automáticamente:

```javascript
const fs = require('fs'); // ← Asegúrate de importar fs

const logDir = path.join(__dirname, '..', 'logs');

// Crear directorio si no existe
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
```

**Verificación:**

1. Detén el servidor
2. Elimina los logs vacíos: `Remove-Item logs/*.log`
3. Reinicia el servidor: `node api/index.js`
4. Verifica el log: `Get-Content logs/access-$(Get-Date -Format "yyyy-MM-dd").log`

Deberías ver al menos la entrada de inicio del servidor:

```log
2026-05-27 17:30:34 [INFO] Servidor iniciado {"puerto":"3000","modo":"Desarrollo",...}
```

### No se registra ninguna actividad

**Verificación:**

1. Confirma que el logger está configurado:
   ```javascript
   const accessLogger = winston.createLogger({
     level: 'info',
     transports: logTransports,
     exitOnError: false,
     handleExceptions: true,
     handleRejections: true
   });
   ```

2. Verifica que estás llamando al logger en las rutas:
   ```javascript
   accessLogger.info('Evento', { datos: 'ejemplo' });
   ```

3. En desarrollo, verifica que `isProduction` sea `false`:
   ```javascript
   console.log('isProduction:', isProduction); // debe ser false
   ```

### Los logs no aparecen en la consola

**Causa:** El transport de Console puede estar desactivado.

**Solución:** Verifica que el Console transport esté agregado:

```javascript
logTransports.push(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} ${level}: ${message}`;
      })
    )
  })
);
```

### En producción (Vercel) no veo los metadatos JSON

**Síntoma:** En Vercel solo ves el mensaje pero no el JSON con email, IP, etc.

**Causa:** Los códigos ANSI de color (`winston.format.colorize()`) pueden interferir con el parseado de logs en Vercel.

**Solución:** El código usa formatos diferentes según el entorno:

- **Desarrollo:** Con colores ANSI para mejor legibilidad en terminal local
- **Producción:** Sin colores, formato limpio `HH:mm:ss [LEVEL] mensaje {json}`

El sistema detecta automáticamente si está en Vercel (`process.env.VERCEL`) y ajusta el formato.

**Verificación en Vercel:**

Los logs deben verse así (sin códigos de color):
```
14:32:15 [INFO] Login exitoso {"email":"admin@unirioja.es","ip":"203.0.113.42",...}
14:35:20 [WARN] Token inválido o expirado {"email":"user@example.com","error":"jwt expired",...}
```

Si ves solo el mensaje sin los metadatos, verifica que el código tenga:
```javascript
if (Object.keys(metadata).length > 0) {
  msg += ` ${JSON.stringify(metadata)}`; // ← Sin condición isProduction
}
```

### Permisos denegados al crear logs

**En Windows:**

```powershell
# Verifica permisos de la carpeta
icacls logs
```

**En Linux/Mac:**

```bash
# Dar permisos de escritura
chmod 755 logs/
```

---

## ❓ Preguntas Frecuentes

### ¿Los logs se guardan en Vercel?

No. Vercel Serverless no persiste archivos. Para producción usa un servicio externo (Logtail, Papertrail, etc.) o base de datos.

### ¿Cómo elimino logs antiguos manualmente?

```powershell
# Eliminar logs de hace más de 30 días
Get-ChildItem logs/*.log | 
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | 
  Remove-Item
```

### ¿Puedo ver los logs en tiempo real?

Sí, en desarrollo local:
```powershell
Get-Content logs/access-$(Get-Date -Format "yyyy-MM-dd").log -Wait
```

### ¿Los logs afectan el rendimiento?

Mínimamente. Winston es asíncrono y muy eficiente. El impacto es < 1ms por petición.

### ¿Cómo exporto logs a CSV para análisis?

```powershell
# Crear script de exportación
# (Requiere parsear JSON de cada línea)
```

---

✨ **Sistema de logging configurado**. Todos los accesos quedan registrados para auditoría y análisis.
