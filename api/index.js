// Cargar variables de entorno desde .env
require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const { Resend } = require('resend');
const winston = require('winston');
require('winston-daily-rotate-file');

const app = express();

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

// Lista de emails autorizados (whitelist)
// Puede configurarse via variable de entorno ALLOWED_EMAILS (separados por comas)
// Ejemplo: ALLOWED_EMAILS=admin@unirioja.es,user@unirioja.es,otro@example.com
const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS
  ? process.env.ALLOWED_EMAILS.split(',').map(email => email.trim().toLowerCase())
  : [
    'admin@unirioja.es',
    'fran.barroso@unirioja.es',
    // Agrega más emails permitidos aquí
  ];

// Inicializar cliente de Resend (solo si hay API key configurada)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
    return res.redirect('/login.html');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded; // Guardamos la info del usuario en la request
    accessLogger.info('Acceso autorizado', {
      email: decoded.email,
      ruta: req.path,
      ip,
      userAgent
    });
    next();
  } catch (error) {
    // Intentar decodificar el token sin verificar para obtener el email
    let email = 'desconocido';
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.email) {
        email = decoded.email;
      }
    } catch (decodeError) {
      // Token completamente corrupto, dejar email como 'desconocido'
    }

    accessLogger.warn('Token inválido o expirado', {
      email,
      error: error.message,
      ruta: req.path,
      ip,
      userAgent
    });
    res.clearCookie('session_token');
    return res.redirect('/login.html');
  }
}

// ============================================
// RUTAS PÚBLICAS - AUTENTICACIÓN
// ============================================

// Endpoint para generar el Magic Link
app.post('/api/auth/magic-link', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({
      error: 'Email inválido'
    });
  }

  // Verificar que el email esté en la lista de permitidos
  const emailLowerCase = email.toLowerCase().trim();
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!ALLOWED_EMAILS.includes(emailLowerCase)) {
    accessLogger.warn('Intento de login denegado - Email no autorizado', {
      email: emailLowerCase,
      ip,
      userAgent,
      razon: 'No está en ALLOWED_EMAILS'
    });
    return res.status(403).json({
      error: 'Acceso no autorizado',
      mensaje: 'Access to the system is not available at this time. Please contact the administrator.'
    });
  }

  accessLogger.info('Magic link authorized', {
    email: emailLowerCase,
    ip,
    userAgent
  });

  // Generar JWT temporal (expira en 15 minutos)
  const magicToken = jwt.sign(
    { email, tipo: 'magic-link' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Construir URL de verificación
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = req.get('host');
  const enlaceVerificacion = `${protocol}://${host}/api/auth/verificar?token=${magicToken}`;

  // Verificar si Resend está configurado
  if (!resend) {
    // Modo desarrollo: mostrar en consola
    console.log('='.repeat(60));
    console.log('🔐 MAGIC LINK GENERADO (MODO DESARROLLO)');
    console.log('='.repeat(60));
    console.log('Email:', email);
    console.log('Enlace:', enlaceVerificacion);
    console.log('Válido por: 15 minutos');
    console.log('⚠️  RESEND_API_KEY no configurada - Email no enviado');
    console.log('='.repeat(60));

    return res.json({
      mensaje: '⚠️ Modo desarrollo: Enlace generado en consola (Resend no configurado)',
      desarrollo: enlaceVerificacion
    });
  }

  // Enviar email con Resend
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: '🔐 Access to unirioja workspace',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px;
                border-radius: 16px;
                text-align: center;
              }
              .content {
                background: white;
                padding: 40px 30px;
                border-radius: 12px;
                margin-top: 20px;
              }
              h1 {
                color: white;
                margin: 0 0 10px 0;
                font-size: 28px;
              }
              .subtitle {
                color: rgba(255, 255, 255, 0.9);
                margin: 0;
                font-size: 16px;
              }
              .button {
                display: inline-block;
                padding: 16px 40px;
                border: solid 2px #667eea;
                color: #101737;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 24px;
                margin: 20px 0;
              }
              .info {
                background: #f7fafc;
                padding: 20px;
                border-radius: 8px;
                margin-top: 20px;
                font-size: 14px;
                color: #718096;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🔐 Access to unirioja workspace</h1>
              <p class="subtitle">Your magic link is ready</p>
              
              <div class="content">
                <p style="font-size: 18px; color: #2d3748; margin-bottom: 10px;">
                  ¡Hola! 👋
                </p>
                <p style="color: #718096; margin-bottom: 30px;">
                  Click the button below to sign in to your account.
                  You don't need to remember any passwords.
                </p>
                
                <a href="${enlaceVerificacion}" class="button">
                  ✨ Sign in now
                </a>
                
                <div class="info">
                  <p style="margin: 0 0 10px 0;"><strong>⏱️ This link expires in 15 minutes</strong></p>
                  <p style="margin: 0; font-size: 13px;">
                    If you didn't request this link, you can safely ignore this email.
                  </p>
                </div>
                
                <p style="font-size: 12px; color: #a0aec0; margin-top: 30px; margin-bottom: 0;">
                  Does the button not work? Copy and paste this link into your browser:<br>
                  <span style="color: #667eea; word-break: break-all;">${enlaceVerificacion}</span>
                </p>
              </div>
              
              <div class="footer">
                <p>🔒 Secure authentication without passwords</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Error al enviar email con Resend:', error);
      return res.status(500).json({
        error: 'No se pudo enviar el email. Intenta de nuevo.',
        detalles: error.message
      });
    }

    console.log('✅ Magic Link enviado exitosamente');
    console.log('📧 Destinatario:', email);
    console.log('📨 ID del email:', data?.id);

    res.json({
      mensaje: `✅ Enlace mágico enviado a ${email}. Revisa tu bandeja de entrada.`,
      emailId: data?.id
    });

  } catch (error) {
    console.error('❌ Error inesperado al enviar email:', error);
    res.status(500).json({
      error: 'Error al procesar la solicitud',
      mensaje: 'No se pudo enviar el enlace. Por favor intenta nuevamente.'
    });
  }
});

// Endpoint para verificar el Magic Link
app.get('/api/auth/verificar', (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Token no proporcionado');
  }

  try {
    // Verificar el token del Magic Link
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.tipo !== 'magic-link') {
      return res.status(400).send('Token inválido');
    }

    // Generar token de sesión (válido por 1 día)
    const sessionToken = jwt.sign(
      { email: decoded.email, tipo: 'sesion' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Establecer cookie segura
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 día en milisegundos
    });

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    accessLogger.info('Login exitoso - Magic Link verificado', {
      email: decoded.email,
      ip,
      userAgent
    });

    // Redirigir al inicio
    res.redirect('/app/index.html');

  } catch (error) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    accessLogger.error('Error al verificar Magic Link', {
      error: error.message,
      ip,
      userAgent,
      token: token ? 'presente' : 'ausente'
    });
    res.status(401).send(`
      <html>
        <head>
          <title>Enlace Inválido</title>
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
            <h1>⚠️ Enlace Inválido o Expirado</h1>
            <p>Este enlace mágico ya no es válido. Los enlaces expiran después de 15 minutos por seguridad.</p>
            <a href="/login.html">← Solicitar Nuevo Enlace</a>
          </div>
        </body>
      </html>
    `);
  }
});

// Endpoint para cerrar sesión
app.get('/api/auth/logout', (req, res) => {
  const token = req.cookies.session_token;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  let email = 'desconocido';
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      email = decoded.email;
    } catch (error) {
      // Token inválido, pero igual registramos el logout
    }
  }

  accessLogger.info('Logout', {
    email,
    ip,
    userAgent
  });

  res.clearCookie('session_token');
  res.redirect('/login.html');
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
      return res.redirect('/dashboard');
    } catch (error) {
      res.clearCookie('session_token');
    }
  }

  res.redirect('/login.html');
});

// ============================================
// ENDPOINT DE ESTADO (para debugging)
// ============================================
app.get('/api/status', verificarSesion, (req, res) => {
  res.json({
    estado: 'autenticado',
    usuario: req.usuario.email,
    timestamp: new Date().toISOString()
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
          <a href="/">← Volver al Inicio</a>
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
  app.listen(PORT, () => {
    console.log('');
    console.log('🚀 Servidor Express iniciado');
    console.log('📍 URL:', `http://localhost:${PORT}`);
    console.log('🔐 Modo:', 'Desarrollo');
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
