import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, Request, Response, HTTPException, Cookie
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
import resend

# ========================================
# CONFIGURACIÓN
# ========================================

app = FastAPI()

# Variables de entorno
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
FROM_EMAIL = os.getenv("FROM_EMAIL", "login@tudominio.com")

# Configurar Resend
resend.api_key = RESEND_API_KEY

# Whitelist de emails autorizados
ALLOWED_EMAILS = [
    "franpas@gmail.com",
        # Agrega aquí los emails autorizados
]

# Configuración de tokens
MAGIC_LINK_EXPIRE_MINUTES = 15
SESSION_EXPIRE_DAYS = 7
ALGORITHM = "HS256"

# ========================================
# MODELOS
# ========================================

class EmailRequest(BaseModel):
    email: EmailStr

# ========================================
# UTILIDADES JWT
# ========================================

def create_magic_token(email: str) -> str:
    """Crea un JWT para el magic link con expiración corta"""
    expire = datetime.utcnow() + timedelta(minutes=MAGIC_LINK_EXPIRE_MINUTES)
    to_encode = {
        "sub": email,
        "exp": expire,
        "type": "magic"
    }
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def create_session_token(email: str) -> str:
    """Crea un JWT para la sesión con expiración larga"""
    expire = datetime.utcnow() + timedelta(days=SESSION_EXPIRE_DAYS)
    to_encode = {
        "sub": email,
        "exp": expire,
        "type": "session"
    }
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def verify_token(token: str, token_type: str = "session") -> Optional[str]:
    """Verifica y decodifica un JWT, retorna el email si es válido"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type_check: str = payload.get("type")
        
        if email is None or token_type_check != token_type:
            return None
        
        return email
    except JWTError:
        return None

# ========================================
# MIDDLEWARE DE PROTECCIÓN
# ========================================

@app.middleware("http")
async def protect_ad_routes(request: Request, call_next):
    """Middleware que protege todas las rutas bajo /ad/"""
    
    # Si la ruta comienza con /ad
    if request.url.path.startswith("/ad"):
        # Obtener token de sesión de la cookie
        session_token = request.cookies.get("session_token")
        
        if not session_token:
            # No hay token, redirigir a login
            return RedirectResponse(url="/public/login.html", status_code=302)
        
        # Verificar el token
        email = verify_token(session_token, token_type="session")
        
        if not email:
            # Token inválido o expirado
            response = RedirectResponse(url="/public/login.html", status_code=302)
            response.delete_cookie("session_token")
            return response
        
        # Token válido, permitir acceso
        # Agregar el email al request state para uso posterior si es necesario
        request.state.user_email = email
    
    response = await call_next(request)
    return response

# ========================================
# ENDPOINTS DE AUTENTICACIÓN
# ========================================

@app.post("/api/request-login")
async def request_login(email_data: EmailRequest):
    """
    Endpoint para solicitar magic link
    - Valida si el email está en la whitelist
    - Genera token temporal
    - Envía email con Resend
    """
    email = email_data.email.lower()
    
    # Verificar si el email está autorizado
    if email not in ALLOWED_EMAILS:
        # Por seguridad, no revelar si el email está o no en la whitelist
        return JSONResponse(
            content={"message": "Si tu email está autorizado, recibirás un enlace de acceso."},
            status_code=200
        )
    
    # Generar magic token
    magic_token = create_magic_token(email)
    
    # Crear magic link
    magic_link = f"{BASE_URL}/api/verify?token={magic_token}"
    
    # Preparar y enviar email
    try:
        params = {
            "from": FROM_EMAIL,
            "to": [email],
            "subject": "Tu acceso - Magic Link",
            "html": f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body {{
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }}
                        .container {{
                            background-color: #f9f9f9;
                            border-radius: 8px;
                            padding: 30px;
                            margin: 20px 0;
                        }}
                        .button {{
                            display: inline-block;
                            padding: 14px 28px;
                            background-color: #0070f3;
                            color: white;
                            text-decoration: none;
                            border-radius: 6px;
                            font-weight: 600;
                            margin: 20px 0;
                        }}
                        .footer {{
                            color: #666;
                            font-size: 14px;
                            margin-top: 30px;
                        }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>🔐 Tu enlace de acceso</h2>
                        <p>Has solicitado acceso al área privada. Haz clic en el botón de abajo para iniciar sesión:</p>
                        <a href="{magic_link}" class="button">Acceder ahora</a>
                        <p>O copia y pega este enlace en tu navegador:</p>
                        <p style="word-break: break-all; color: #0070f3;">{magic_link}</p>
                        <div class="footer">
                            <p><strong>⚠️ Este enlace expira en {MAGIC_LINK_EXPIRE_MINUTES} minutos</strong></p>
                            <p>Si no solicitaste este acceso, puedes ignorar este email.</p>
                        </div>
                    </div>
                </body>
                </html>
            """
        }
        
        resend.Emails.send(params)
        
        return JSONResponse(
            content={"message": "Si tu email está autorizado, recibirás un enlace de acceso."},
            status_code=200
        )
        
    except Exception as e:
        print(f"Error enviando email: {str(e)}")
        # No revelar detalles del error al cliente
        return JSONResponse(
            content={"message": "Hubo un problema. Por favor, intenta de nuevo más tarde."},
            status_code=500
        )

@app.get("/api/verify")
async def verify_magic_link(token: str):
    """
    Endpoint para verificar el magic link
    - Valida el token del magic link
    - Crea cookie de sesión
    - Redirige a /ad/index.html
    """
    # Verificar el magic token
    email = verify_token(token, token_type="magic")
    
    if not email:
        # Token inválido o expirado
        return HTMLResponse(
            content="""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Enlace inválido</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            background-color: #f5f5f5;
                        }
                        .message {
                            text-align: center;
                            padding: 40px;
                            background: white;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        a {
                            color: #0070f3;
                            text-decoration: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="message">
                        <h1>❌ Enlace inválido o expirado</h1>
                        <p>Este enlace ya no es válido. Por favor, solicita uno nuevo.</p>
                        <p><a href="/public/login.html">Volver al login</a></p>
                    </div>
                </body>
                </html>
            """,
            status_code=401
        )
    
    # Crear token de sesión
    session_token = create_session_token(email)
    
    # Crear respuesta con redirección
    response = RedirectResponse(url="/ad/index.html", status_code=302)
    
    # Establecer cookie de sesión segura
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,  # Solo HTTPS en producción
        samesite="lax",
        max_age=SESSION_EXPIRE_DAYS * 24 * 60 * 60  # 7 días en segundos
    )
    
    return response

@app.get("/api/logout")
async def logout():
    """Cierra la sesión eliminando la cookie"""
    response = RedirectResponse(url="/public/login.html", status_code=302)
    response.delete_cookie("session_token")
    return response

@app.get("/api/check-auth")
async def check_auth(session_token: Optional[str] = Cookie(None)):
    """Endpoint opcional para verificar si el usuario está autenticado"""
    if not session_token:
        return JSONResponse(content={"authenticated": False}, status_code=401)
    
    email = verify_token(session_token, token_type="session")
    
    if not email:
        return JSONResponse(content={"authenticated": False}, status_code=401)
    
    return JSONResponse(content={"authenticated": True, "email": email}, status_code=200)

# ========================================
# SERVIR ARCHIVOS ESTÁTICOS DE /ad
# ========================================

@app.get("/ad/{file_path:path}")
async def serve_ad_files(file_path: str, request: Request):
    """Sirve archivos estáticos de la carpeta /ad (ya protegidos por middleware)"""
    from pathlib import Path
    import mimetypes
    
    # El middleware ya verificó la autenticación
    # Ahora solo servimos el archivo
    
    if not file_path or file_path == "":
        file_path = "index.html"
    
    # Construir ruta al archivo
    base_dir = Path(__file__).parent.parent  # Directorio raíz del proyecto
    file_full_path = base_dir / "ad" / file_path
    
    # Verificar que el archivo existe y está dentro de /ad
    if not file_full_path.exists() or not file_full_path.is_file():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    # Leer el archivo
    with open(file_full_path, "rb") as f:
        content = f.read()
    
    # Determinar tipo MIME
    content_type, _ = mimetypes.guess_type(str(file_full_path))
    if content_type is None:
        content_type = "application/octet-stream"
    
    return Response(content=content, media_type=content_type)

# ========================================
# HEALTH CHECK
# ========================================

@app.get("/api/health")
async def health_check():
    """Endpoint de salud para verificar que la API está funcionando"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# ========================================
# HANDLER PARA VERCEL
# ========================================

# Vercel busca una variable llamada 'app' o 'handler'
handler = app
