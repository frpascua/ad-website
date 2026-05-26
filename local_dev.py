"""
Script de utilidad para desarrollo local
Ejecutar con: python local_dev.py
"""

import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

def check_env_vars():
    """Verifica que todas las variables de entorno estén configuradas"""
    required_vars = {
        'JWT_SECRET': 'Clave secreta para JWT',
        'RESEND_API_KEY': 'API Key de Resend',
        'BASE_URL': 'URL base de la aplicación',
        'FROM_EMAIL': 'Email remitente verificado'
    }
    
    print("🔍 Verificando variables de entorno...\n")
    all_ok = True
    
    for var, description in required_vars.items():
        value = os.getenv(var)
        if value:
            # Ocultar parcialmente valores sensibles
            if var in ['JWT_SECRET', 'RESEND_API_KEY']:
                display_value = f"{value[:8]}..." if len(value) > 8 else "***"
            else:
                display_value = value
            print(f"✅ {var}: {display_value}")
        else:
            print(f"❌ {var}: NO CONFIGURADO - {description}")
            all_ok = False
    
    if not all_ok:
        print("\n⚠️  Algunas variables no están configuradas.")
        print("Copia .env.example a .env y completa los valores.\n")
        return False
    
    print("\n✅ Todas las variables están configuradas correctamente!\n")
    return True

def generate_jwt_secret():
    """Genera una clave JWT segura"""
    import secrets
    secret = secrets.token_urlsafe(32)
    print("🔑 Nueva clave JWT generada:")
    print(f"\nJWT_SECRET={secret}\n")
    print("Copia esta línea a tu archivo .env\n")

def test_resend_connection():
    """Prueba la conexión con Resend"""
    import resend
    
    api_key = os.getenv('RESEND_API_KEY')
    if not api_key:
        print("❌ RESEND_API_KEY no está configurado")
        return False
    
    resend.api_key = api_key
    
    print("🔌 Probando conexión con Resend...")
    try:
        # Intentar obtener información de la cuenta
        # Nota: Resend no tiene un endpoint de "ping" directo,
        # así que verificamos que la key tenga el formato correcto
        if api_key.startswith('re_'):
            print("✅ API Key tiene formato válido")
            print("\nPara probar completamente, ejecuta el servidor y envía un email de prueba.\n")
            return True
        else:
            print("❌ API Key no tiene el formato esperado (debe empezar con 're_')")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def show_allowed_emails():
    """Muestra los emails autorizados configurados en el código"""
    print("📧 Emails autorizados actualmente:\n")
    
    # Leer el archivo main.py y extraer ALLOWED_EMAILS
    try:
        with open('api/main.py', 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Buscar la lista ALLOWED_EMAILS
        start = content.find('ALLOWED_EMAILS = [')
        if start == -1:
            print("❌ No se pudo encontrar ALLOWED_EMAILS en api/main.py")
            return
        
        end = content.find(']', start)
        allowed_section = content[start:end+1]
        
        # Extraer emails (simple parsing)
        import re
        emails = re.findall(r'"([^"]+@[^"]+)"', allowed_section)
        
        for email in emails:
            print(f"  • {email}")
        
        print(f"\nTotal: {len(emails)} email(s) autorizado(s)")
        print("\nPara agregar más, edita api/main.py línea ~35\n")
        
    except Exception as e:
        print(f"❌ Error leyendo api/main.py: {str(e)}")

def start_server():
    """Inicia el servidor de desarrollo"""
    import subprocess
    import sys
    
    print("🚀 Iniciando servidor de desarrollo...\n")
    print("Servidor disponible en: http://localhost:8000")
    print("Login: http://localhost:8000/public/login.html")
    print("Área protegida: http://localhost:8000/ad/")
    print("\nPresiona Ctrl+C para detener\n")
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "api.main:app",
            "--reload",
            "--host", "0.0.0.0",
            "--port", "8000"
        ])
    except KeyboardInterrupt:
        print("\n\n👋 Servidor detenido")

def main():
    """Menú principal"""
    import sys
    
    print("=" * 50)
    print("🔐 Magic Link Auth - Utilidades de Desarrollo")
    print("=" * 50)
    print()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "check":
            check_env_vars()
        elif command == "generate-secret":
            generate_jwt_secret()
        elif command == "test-resend":
            if check_env_vars():
                test_resend_connection()
        elif command == "emails":
            show_allowed_emails()
        elif command == "run":
            if check_env_vars():
                start_server()
        else:
            print(f"❌ Comando desconocido: {command}\n")
            show_help()
    else:
        show_help()

def show_help():
    """Muestra la ayuda de comandos"""
    print("Comandos disponibles:\n")
    print("  python local_dev.py check              - Verificar configuración")
    print("  python local_dev.py generate-secret    - Generar JWT_SECRET")
    print("  python local_dev.py test-resend        - Probar conexión Resend")
    print("  python local_dev.py emails             - Ver emails autorizados")
    print("  python local_dev.py run                - Iniciar servidor de desarrollo")
    print()
    print("Ejemplo:")
    print("  python local_dev.py check")
    print()

if __name__ == "__main__":
    main()
