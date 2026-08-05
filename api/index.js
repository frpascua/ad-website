// Cargar variables de entorno desde .env
require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Resend } = require('resend');
const winston = require('winston');
require('winston-daily-rotate-file');

const app = express();

// Prefijo base de la aplicación (solo en desarrollo; en producción Vercel monta en raíz)
const BASE_PATH = process.env.NODE_ENV !== 'production' ? (process.env.BASE_PATH || '') : '';

// ============================================
// CONFIGURACIÓN DE LOGGING
// ============================================

// Detectar si estamos en Vercel (producción)
const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';

// Configurar transports según el entorno
const logTransports = [];

// En desarrollo: logs a archivo con rotación diaria
if (!isProduction) {
  const logDir = path.join(__dirname, '..', 'logs');

  // Crear directorio de logs si no existe
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  logTransports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: false,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...metadata }) => {
          let msg = `${timestamp} [${level.toUpperCase()}] ${message}`;
          if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
          }
          return msg;
        })
      )
    })
  );
}

// Siempre mostrar en consola (formato diferente según entorno)
if (!isProduction) {
  // Desarrollo: con colores
  logTransports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...metadata }) => {
          let msg = `${timestamp} ${level}: ${message}`;
          if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
          }
          return msg;
        })
      )
    })
  );
} else {
  // Producción: sin colores, formato limpio para Vercel
  logTransports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...metadata }) => {
          let msg = `${timestamp} [${level.toUpperCase()}] ${message}`;
          if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
          }
          return msg;
        })
      )
    })
  );
}

// Logger para eventos de acceso y autenticación
const accessLogger = winston.createLogger({
  level: 'info',
  transports: logTransports,
  exitOnError: false,
  handleExceptions: true,
  handleRejections: true
});

// IMPORTANTE: Cambia esta clave secreta en producción usando variables de entorno en Vercel
const JWT_SECRET = process.env.JWT_SECRET || 'tu-super-secreto-cambiar-en-produccion-123456';

// Lista de uid autorizados (whitelist)
// Puede configurarse via variable de entorno ALLOWED_UIDS (separados por comas)
// Ejemplo: ALLOWED_UIDS=jperez,mgomez,fbarroso
const ALLOWED_UIDS = process.env.ALLOWED_UIDS
  ? process.env.ALLOWED_UIDS.split(',').map(uid => uid.trim().toLowerCase())
  : [
    'admin',
    'fran.barroso',
    '72789486',
    // Agrega más uid permitidos aquí
  ];

// ============================================
// CONFIGURACIÓN OAUTH 2.0 (Apereo CAS - sso.unirioja.es/dorus)
// ============================================
// Base del servidor CAS con el módulo OAuth 2.0 activo
const CAS_BASE_URL = (process.env.CAS_BASE_URL || 'https://sso.unirioja.es/dorus').replace(/\/$/, '');
const OAUTH_AUTHORIZE_URL = `${CAS_BASE_URL}/oauth2.0/authorize`;
const OAUTH_TOKEN_URL = `${CAS_BASE_URL}/oauth2.0/accessToken`;
const OAUTH_PROFILE_URL = `${CAS_BASE_URL}/oauth2.0/profile`;
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
// redirect_uri fija (debe coincidir EXACTAMENTE con la registrada en el CAS)
const OAUTH_REDIRECT_URI = process.env.OAUTH_REDIRECT_URI;
const OAUTH_SCOPE = process.env.OAUTH_SCOPE || '';

// Dirección fija para avisos de auditoría de acceso
const AUDIT_EMAIL = process.env.AUDIT_EMAIL || 'franpas@gmail.com';

// Inicializar cliente de Resend (solo si hay API key configurada)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// ============================================
// AVISO DE AUDITORÍA DE ACCESO POR EMAIL
// ============================================
// Envía un correo a AUDIT_EMAIL cada vez que alguien entra (o intenta entrar).
// Nunca bloquea el flujo de autenticación: los errores se registran y se ignoran.
async function enviarAvisoAcceso({ uid, ip, userAgent, resultado }) {
  const concedido = resultado === 'concedido';
  const fecha = new Date().toISOString();

  if (!resend) {
    accessLogger.warn('Aviso de acceso no enviado (Resend no configurado)', {
      uid, ip, userAgent, resultado
    });
    return;
  }

  try {
    const color = concedido ? '#2f855a' : '#c53030';
    const titulo = concedido ? '✅ Acceso concedido' : '⛔ Intento de acceso denegado';
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: AUDIT_EMAIL,
      subject: `${concedido ? '✅' : '⛔'} Acceso al workspace unirioja — ${uid}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;color:#2d3748;">
          <h2 style="color:${color};margin-bottom:16px;">${titulo}</h2>
          <table style="border-collapse:collapse;width:100%;font-size:14px;">
            <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Usuario (uid)</td><td style="padding:8px;border:1px solid #e2e8f0;">${uid}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Resultado</td><td style="padding:8px;border:1px solid #e2e8f0;">${resultado}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Fecha (UTC)</td><td style="padding:8px;border:1px solid #e2e8f0;">${fecha}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">IP</td><td style="padding:8px;border:1px solid #e2e8f0;">${ip || 'desconocida'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">User-Agent</td><td style="padding:8px;border:1px solid #e2e8f0;">${userAgent || 'desconocido'}</td></tr>
          </table>
        </div>
      `
    });
  } catch (error) {
    accessLogger.error('Error al enviar aviso de acceso por email', {
      uid, ip, resultado, error: error.message
    });
  }
}

// Configuración de middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ============================================
// MIDDLEWARE DE VERIFICACIÓN DE SESIÓN
// ============================================
function verificarSesion(req, res, next) {
  const token = req.cookies.session_token;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!token) {
    accessLogger.warn('Intento de acceso sin token', {
      ruta: req.path,
      ip,
      userAgent
    });
    return res.redirect(`${BASE_PATH}/login.html`);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded; // Guardamos la info del usuario en la request
    accessLogger.info('Acceso autorizado', {
      uid: decoded.uid,
      ruta: req.path,
      ip,
      userAgent
    });
    next();
  } catch (error) {
    // Intentar decodificar el token sin verificar para obtener el uid
    let uid = 'desconocido';
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.uid) {
        uid = decoded.uid;
      }
    } catch (decodeError) {
      // Token completamente corrupto, dejar uid como 'desconocido'
    }

    accessLogger.warn('Token inválido o expirado', {
      uid,
      error: error.message,
      ruta: req.path,
      ip,
      userAgent
    });
    res.clearCookie('session_token');
    return res.redirect(`${BASE_PATH}/login.html`);
  }
}

// ============================================
// RUTAS PÚBLICAS - AUTENTICACIÓN
// ============================================

// Página HTML de error reutilizable para el flujo de autenticación
function paginaError(titulo, mensaje) {
  return `
    <html>
      <head>
        <title>${titulo}</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 3rem;
            border-radius: 1rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
          }
          h1 { color: #e53e3e; margin: 0 0 1rem 0; }
          p { color: #4a5568; margin-bottom: 2rem; }
          a {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 0.75rem 2rem;
            text-decoration: none;
            border-radius: 0.5rem;
            font-weight: 600;
          }
          a:hover { background: #5a67d8; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ ${titulo}</h1>
          <p>${mensaje}</p>
          <a href="${BASE_PATH}/login.html">← Volver al inicio de sesión</a>
        </div>
      </body>
    </html>
  `;
}

// Extrae el access_token de la respuesta del endpoint de token del CAS,
// que puede devolver JSON o formato x-www-form-urlencoded (CAS clásico).
async function extraerAccessToken(resp) {
  const texto = await resp.text();
  if (!texto) return null;
  try {
    const json = JSON.parse(texto);
    return json.access_token || null;
  } catch (e) {
    const params = new URLSearchParams(texto);
    return params.get('access_token');
  }
}

// Endpoint para iniciar el flujo OAuth 2.0 (redirige al CAS de la UR)
app.get('/api/auth/login', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  // EN DESARROLLO: Mostrar página de selección de usuario mock
  if (!isProduction) {
    accessLogger.info('Login en modo desarrollo - mostrando selección de usuario mock', { ip, userAgent });
    return res.send(`
      <html>
        <head>
          <title>Login de Desarrollo</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            h1 { color: #2d3748; margin: 0 0 0.5rem 0; }
            .dev-badge {
              display: inline-block;
              background: #f59e0b;
              color: white;
              padding: 0.25rem 0.75rem;
              border-radius: 0.25rem;
              font-size: 0.875rem;
              font-weight: 600;
              margin-bottom: 1.5rem;
            }
            p { color: #4a5568; margin-bottom: 2rem; }
            .user-list {
              display: flex;
              flex-direction: column;
              gap: 0.75rem;
              margin-bottom: 2rem;
            }
            .user-btn {
              display: block;
              background: #667eea;
              color: white;
              padding: 1rem;
              text-decoration: none;
              border-radius: 0.5rem;
              font-weight: 600;
              border: none;
              cursor: pointer;
              transition: all 0.2s;
            }
            .user-btn:hover {
              background: #5a67d8;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            .note {
              font-size: 0.875rem;
              color: #718096;
              margin-top: 1.5rem;
              padding-top: 1.5rem;
              border-top: 1px solid #e2e8f0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔧 Modo Desarrollo</h1>
            <div class="dev-badge">AUTENTICACIÓN MOCK</div>
            <p>Selecciona un usuario para iniciar sesión sin conectar al CAS SSO:</p>
            <div class="user-list">
              ${ALLOWED_UIDS.map(uid => `
                <a href="${BASE_PATH}/api/auth/dev-login?uid=${encodeURIComponent(uid)}" class="user-btn">
                  👤 ${uid}
                </a>
              `).join('')}
            </div>
            <div class="note">
              ℹ️ En producción se usará autenticación real con SSO Unirioja
            </div>
          </div>
        </body>
      </html>
    `);
  }

  // EN PRODUCCIÓN: Flujo OAuth real
  if (!OAUTH_CLIENT_ID || !OAUTH_REDIRECT_URI) {
    accessLogger.error('OAuth mal configurado', {
      falta: {
        OAUTH_CLIENT_ID: !OAUTH_CLIENT_ID,
        OAUTH_REDIRECT_URI: !OAUTH_REDIRECT_URI
      }
    });
    return res.status(500).send(paginaError('Autenticación no configurada', 'El inicio de sesión no está disponible en este momento. Contacta con el administrador.'));
  }

  // Generar 'state' (CSRF) y guardarlo firmado en una cookie httpOnly de corta duración
  const state = crypto.randomBytes(16).toString('hex');
  const stateToken = jwt.sign({ state, tipo: 'oauth-state' }, JWT_SECRET, { expiresIn: '10m' });
  res.cookie('oauth_state', stateToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: OAUTH_REDIRECT_URI,
    state
  });
  if (OAUTH_SCOPE) {
    params.set('scope', OAUTH_SCOPE);
  }

  accessLogger.info('Inicio de flujo OAuth', { ip, userAgent });
  res.redirect(`${OAUTH_AUTHORIZE_URL}?${params.toString()}`);
});

// Endpoint de login mock para desarrollo (sin autenticación real)
app.get('/api/auth/dev-login', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  // Solo permitir en desarrollo
  if (isProduction) {
    accessLogger.warn('Intento de acceso a dev-login en producción', { ip, userAgent });
    return res.status(403).send(paginaError('No disponible', 'Este endpoint solo está disponible en modo desarrollo.'));
  }

  const { uid } = req.query;

  if (!uid) {
    accessLogger.warn('Dev-login sin uid', { ip, userAgent });
    return res.status(400).send(paginaError('Falta usuario', 'Debes proporcionar un uid para el login de desarrollo.'));
  }

  const uidNormalizado = uid.toLowerCase().trim();

  // Validar contra la whitelist
  const uidAutorizado = ALLOWED_UIDS.includes(uidNormalizado);
  
  if (!uidAutorizado) {
    accessLogger.warn('Dev-login con uid no autorizado', {
      uid: uidNormalizado,
      ip,
      userAgent
    });
    return res.status(403).send(paginaError('Usuario no autorizado', `El usuario "${uidNormalizado}" no está en la lista de permitidos.`));
  }

  // Crear sesión mock (cookie JWT httpOnly, válida 1 día)
  const sessionToken = jwt.sign(
    { uid: uidNormalizado, tipo: 'sesion' },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  res.cookie('session_token', sessionToken, {
    httpOnly: true,
    secure: false, // En desarrollo no usamos HTTPS
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });

  accessLogger.info('Login mock exitoso (desarrollo)', { 
    uid: uidNormalizado, 
    ip, 
    userAgent,
    modo: 'desarrollo-mock'
  });

  // NO enviar aviso de acceso en modo desarrollo mock para no saturar el email
  res.redirect(`${BASE_PATH}/app/index.html`);
});

// Endpoint de retorno del CAS: intercambia el código por token, obtiene el
// perfil, valida el uid contra la whitelist y crea la sesión local.
app.get('/api/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  // Validar 'state' (protección CSRF)
  const stateCookie = req.cookies.oauth_state;
  res.clearCookie('oauth_state');
  let stateValido = false;
  if (state && stateCookie) {
    try {
      const decoded = jwt.verify(stateCookie, JWT_SECRET);
      stateValido = decoded.tipo === 'oauth-state' && decoded.state === state;
    } catch (error) {
      stateValido = false;
    }
  }
  if (!stateValido) {
    accessLogger.warn('OAuth callback con state inválido', { ip, userAgent });
    return res.status(400).send(paginaError('Sesión de inicio no válida', 'La petición de inicio de sesión no es válida o ha caducado. Inténtalo de nuevo.'));
  }

  if (!code) {
    accessLogger.warn('OAuth callback sin código', { ip, userAgent });
    return res.status(400).send(paginaError('Falta el código de autorización', 'No se recibió el código de autorización del servidor SSO.'));
  }

  try {
    // 1) Intercambiar el código por un access_token
    const tokenResp = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: OAUTH_REDIRECT_URI,
        client_id: OAUTH_CLIENT_ID,
        client_secret: OAUTH_CLIENT_SECRET
      }).toString()
    });

    const accessToken = await extraerAccessToken(tokenResp);
    if (!accessToken) {
      accessLogger.error('OAuth: no se pudo obtener access_token', { ip, userAgent, status: tokenResp.status });
      return res.status(502).send(paginaError('Error de autenticación', 'No se pudo completar el inicio de sesión con el SSO. Inténtalo de nuevo.'));
    }

    // 2) Obtener el perfil del usuario
    const profileResp = await fetch(`${OAUTH_PROFILE_URL}?access_token=${encodeURIComponent(accessToken)}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!profileResp.ok) {
      accessLogger.error('OAuth: error al obtener el perfil', { ip, userAgent, status: profileResp.status });
      return res.status(502).send(paginaError('Error de autenticación', 'No se pudo obtener la información del usuario desde el SSO.'));
    }

    const profile = await profileResp.json();
    const uid = String(profile.id || (profile.attributes && profile.attributes.uid) || '').toLowerCase().trim();

    if (!uid) {
      accessLogger.error('OAuth: perfil sin uid', { ip, userAgent });
      return res.status(502).send(paginaError('Error de autenticación', 'El SSO no devolvió un identificador de usuario válido.'));
    }

    // 3) Comprobar whitelist por uid
    const uidAutorizado = uid.startsWith('cn=')
      ? ALLOWED_UIDS.some(allowed => uid === allowed || uid.includes(allowed))
      : ALLOWED_UIDS.includes(uid);
    if (!uidAutorizado) {
      accessLogger.warn('Intento de login denegado - uid no autorizado', {
        uid,
        ip,
        userAgent,
        razon: 'No está en ALLOWED_UIDS'
      });
      await enviarAvisoAcceso({ uid, ip, userAgent, resultado: 'denegado' });
      return res.status(403).send(paginaError('Acceso no autorizado', 'Tu usuario no tiene acceso a esta aplicación. Contacta con el administrador.'));
    }

    // 4) Crear sesión propia (cookie JWT httpOnly, válida 1 día)
    const sessionToken = jwt.sign(
      { uid, tipo: 'sesion' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    accessLogger.info('Login exitoso - OAuth verificado', { uid, ip, userAgent });
    await enviarAvisoAcceso({ uid, ip, userAgent, resultado: 'concedido' });

    res.redirect(`${BASE_PATH}/app/index.html`);
  } catch (error) {
    accessLogger.error('Error en el callback OAuth', { error: error.message, ip, userAgent });
    res.status(500).send(paginaError('Error de autenticación', 'Se produjo un error al procesar el inicio de sesión. Inténtalo de nuevo.'));
  }
});

// Endpoint para cerrar sesión
app.get('/api/auth/logout', (req, res) => {
  const token = req.cookies.session_token;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  let uid = 'desconocido';
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      uid = decoded.uid;
    } catch (error) {
      // Token inválido, pero igual registramos el logout
    }
  }

  accessLogger.info('Logout', {
    uid,
    ip,
    userAgent
  });

  res.clearCookie('session_token');
  res.redirect(`${BASE_PATH}/login.html`);
});

// ============================================
// SERVIR ARCHIVOS PÚBLICOS (sin autenticación)
// ============================================
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// Servir assets directamente (sin prefijo /public)
app.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets')));
app.use('/css', express.static(path.join(__dirname, '..', 'public', 'css')));

// Rutas para login (con y sin .html para compatibilidad)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// ============================================
// RUTAS PROTEGIDAS - VISTAS PRIVADAS
// ============================================

// Redirect a app/index.html
app.get('/unirioja', verificarSesion, (req, res) => {
  res.redirect('/app/index.html');
});

app.get('/dashboard', verificarSesion, (req, res) => {
  res.redirect('/app/index.html');
});


// Ruta para perfil
app.get('/profile', verificarSesion, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'perfil.html'));
});

// Ruta dinámica para cualquier archivo en /views
// IMPORTANTE: Esta ruta captura cualquier intento de acceder a /views/* directamente
app.get('/views/*', verificarSesion, (req, res) => {
  const rutaRelativa = req.params[0]; // Captura todo después de /views/

  // Prevenir path traversal attacks (pero permitir subdirectorios normales)
  if (rutaRelativa.includes('..')) {
    return res.status(403).send('Acceso denegado');
  }

  res.sendFile(path.join(__dirname, '..', 'views', rutaRelativa));
});

// Ruta alternativa con prefijo /app
app.get('/app/*', verificarSesion, (req, res) => {
  const rutaRelativa = req.params[0]; // Captura todo después de /app/

  if (rutaRelativa.includes('..')) {
    return res.status(403).send('Acceso denegado');
  }

  res.sendFile(path.join(__dirname, '..', 'views', rutaRelativa));
});

// ============================================
// RUTA RAÍZ - Redireccionar según estado de sesión
// ============================================
app.get('/', (req, res) => {
  const token = req.cookies.session_token;

  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect(`${BASE_PATH}/dashboard`);
    } catch (error) {
      res.clearCookie('session_token');
    }
  }

  res.redirect(`${BASE_PATH}/login.html`);
});

// ============================================
// ENDPOINT DE ESTADO (para debugging)
// ============================================
app.get('/api/status', verificarSesion, (req, res) => {
  res.json({
    estado: 'autenticado',
    usuario: req.usuario.uid,
    timestamp: new Date().toISOString()
  });
});

// Devuelve la información del usuario actualmente autenticado
app.get('/api/me', verificarSesion, (req, res) => {
  res.json({
    uid: req.usuario.uid,
    autenticado: true,
    sesionExpira: new Date(req.usuario.exp * 1000).toISOString()
  });
});

// ============================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ============================================
app.use((req, res) => {
  res.status(404).send(`
    <html>
      <head>
        <title>404 - No Encontrado</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 3rem;
            border-radius: 1rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
          }
          h1 { color: #2d3748; margin: 0 0 1rem 0; }
          a {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 0.75rem 2rem;
            text-decoration: none;
            border-radius: 0.5rem;
            margin-top: 1.5rem;
            font-weight: 600;
          }
          a:hover { background: #5a67d8; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>404 - Página No Encontrada</h1>
          <p>La página que buscas no existe.</p>
          <a href="${BASE_PATH}/">← Volver al Inicio</a>
        </div>
      </body>
    </html>
  `);
});

// ============================================
// SERVIDOR LOCAL (Solo para desarrollo)
// ============================================
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  const rootApp = express();
  rootApp.use(BASE_PATH, app);
  // Fallback: servir estáticos también en rutas absolutas (para HTML que usa /public, /assets, /css sin prefijo)
  rootApp.use('/public', express.static(path.join(__dirname, '..', 'public')));
  rootApp.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets')));
  rootApp.use('/css', express.static(path.join(__dirname, '..', 'public', 'css')));
  // Redirigir /api/* → /berkana/api/* (para HTML que usa rutas absolutas sin prefijo)
  rootApp.use('/api', (req, res) => {
    res.redirect(307, `${BASE_PATH}/api${req.url}`);
  });
  // Redirigir /views/* → /berkana/views/* (para assets referenciados con ruta absoluta)
  rootApp.use('/views', (req, res) => {
    res.redirect(307, `${BASE_PATH}/views${req.url}`);
  });
  rootApp.listen(PORT, () => {
    console.log('');
    console.log('🚀 Servidor Express iniciado');
    console.log('📍 URL:', `http://localhost:${PORT}${BASE_PATH}`);
    console.log('🔐 Modo:', 'Desarrollo');
    console.log('');
    console.log('🔑 OAuth config:');
    console.log('   CLIENT_ID    :', OAUTH_CLIENT_ID || '⚠️  NO CONFIGURADO');
    console.log('   REDIRECT_URI :', OAUTH_REDIRECT_URI || '⚠️  NO CONFIGURADO');
    console.log('   CALLBACK esperado:', `http://localhost:${PORT}/api/auth/callback`);
    console.log('');

    // Escribir log de inicio
    accessLogger.info('Servidor iniciado', {
      puerto: PORT,
      modo: 'Desarrollo',
      fecha: new Date().toISOString()
    });
  });
}

// Exportar para Vercel Serverless
module.exports = app;
