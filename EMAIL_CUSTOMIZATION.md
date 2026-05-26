# 📧 Personalización del Email Magic Link

Este documento explica cómo personalizar el email que reciben los usuarios con el magic link.

## 📍 Ubicación del Código

El HTML del email se encuentra en `api/main.py`, dentro del endpoint `request_login`, aproximadamente en la línea 170.

## 🎨 Email Actual (Template Base)

```python
"html": f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
            }}
            .button {{
                display: inline-block;
                padding: 14px 28px;
                background-color: #0070f3;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>🔐 Tu enlace de acceso</h2>
            <p>Has solicitado acceso al área privada.</p>
            <a href="{magic_link}" class="button">Acceder ahora</a>
            <p>O copia este enlace: {magic_link}</p>
            <p><strong>⚠️ Expira en {MAGIC_LINK_EXPIRE_MINUTES} minutos</strong></p>
        </div>
    </body>
    </html>
"""
```

## ✨ Ejemplos de Personalización

### 1. Email Corporativo/Formal

```python
"html": f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: 'Georgia', serif;
                line-height: 1.8;
                color: #1a1a1a;
                max-width: 600px;
                margin: 0 auto;
                background-color: #f5f5f5;
                padding: 20px;
            }}
            .email-wrapper {{
                background-color: white;
                border: 1px solid #ddd;
            }}
            .header {{
                background-color: #2c3e50;
                color: white;
                padding: 30px;
                text-align: center;
            }}
            .content {{
                padding: 40px 30px;
            }}
            .button {{
                display: inline-block;
                padding: 16px 32px;
                background-color: #2c3e50;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 600;
                margin: 20px 0;
            }}
            .footer {{
                background-color: #f9f9f9;
                padding: 20px 30px;
                border-top: 1px solid #eee;
                font-size: 13px;
                color: #666;
            }}
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
                <h1>Universidad de La Rioja</h1>
                <p>Administración Digital</p>
            </div>
            <div class="content">
                <h2>Acceso Autorizado</h2>
                <p>Estimado usuario,</p>
                <p>Ha solicitado acceso al área privada de Administración Digital. 
                   Para completar su autenticación, haga clic en el siguiente botón:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{magic_link}" class="button">Acceder a la Plataforma</a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    Si el botón no funciona, copie y pegue este enlace en su navegador:<br>
                    <span style="color: #2c3e50; word-break: break-all;">{magic_link}</span>
                </p>
            </div>
            <div class="footer">
                <p><strong>⚠️ Importante:</strong> Este enlace expirará en {MAGIC_LINK_EXPIRE_MINUTES} minutos por seguridad.</p>
                <p>Si no solicitó este acceso, ignore este mensaje.</p>
                <p>© 2026 Universidad de La Rioja - Todos los derechos reservados</p>
            </div>
        </div>
    </body>
    </html>
"""
```

### 2. Email Moderno/Minimalista

```python
"html": f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.6;
                color: #2d3748;
                max-width: 500px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f7fafc;
            }}
            .card {{
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.07);
                overflow: hidden;
            }}
            .hero {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }}
            .content {{
                padding: 30px;
            }}
            .button {{
                display: block;
                text-align: center;
                padding: 14px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 25px 0;
                transition: transform 0.2s;
            }}
            .badge {{
                display: inline-block;
                background: #edf2f7;
                color: #4a5568;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 13px;
                margin-top: 15px;
            }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="hero">
                <h1 style="margin: 0; font-size: 28px;">🔐</h1>
                <h2 style="margin: 10px 0 0 0;">Tu acceso está listo</h2>
            </div>
            <div class="content">
                <p>Hola 👋</p>
                <p>Has solicitado acceso al área privada. Haz clic en el botón para entrar:</p>
                <a href="{magic_link}" class="button">Entrar ahora →</a>
                <div class="badge">
                    ⏱️ Válido por {MAGIC_LINK_EXPIRE_MINUTES} minutos
                </div>
                <p style="margin-top: 25px; font-size: 13px; color: #718096;">
                    <strong>Tip:</strong> Guarda este sitio en favoritos para acceder más fácilmente.
                </p>
            </div>
        </div>
        <p style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 20px;">
            ¿No solicitaste esto? Puedes ignorar este email.
        </p>
    </body>
    </html>
"""
```

### 3. Email con Logo Personalizado

```python
"html": f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                text-align: center;
                padding: 20px;
                border-bottom: 3px solid #0070f3;
            }}
            .logo {{
                max-width: 200px;
                height: auto;
            }}
            .content {{
                padding: 30px 20px;
            }}
            .button {{
                display: inline-block;
                padding: 14px 28px;
                background-color: #0070f3;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <img src="https://www.unirioja.es/wp-content/uploads/2021/04/Trazado-520.svg" 
                 alt="Logo Universidad" class="logo">
        </div>
        <div class="content">
            <h2>Acceso a Administración Digital</h2>
            <p>Has solicitado acceso al área privada.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{magic_link}" class="button">Acceder ahora</a>
            </div>
            <p style="font-size: 14px; color: #666;">
                Este enlace es válido por {MAGIC_LINK_EXPIRE_MINUTES} minutos.
            </p>
        </div>
    </body>
    </html>
"""
```

## 🎯 Variables Disponibles

Puedes usar estas variables en tu template:

- `{magic_link}` - El enlace mágico completo
- `{MAGIC_LINK_EXPIRE_MINUTES}` - Minutos de expiración (por defecto: 15)
- `{email}` - El email del usuario (variable `email` del código)
- `{BASE_URL}` - La URL base de tu aplicación

## 📝 Consejos de Diseño

### ✅ Buenas Prácticas

1. **Ancho máximo 600px** - Compatible con la mayoría de clientes de email
2. **CSS inline o en `<style>`** - No todos los clientes soportan CSS externo
3. **Colores en hexadecimal** - Mejor compatibilidad
4. **Botones como `<a>`** - Mejor que `<button>` para emails
5. **Texto alternativo** - Siempre incluye el link como texto también
6. **Responsive** - Usa `max-width` en lugar de `width` fijo

### ❌ Evitar

1. JavaScript - No funciona en emails
2. Formularios - No son interactivos en la mayoría de clientes
3. Fuentes externas complejas - Pueden no cargar
4. Layouts complejos con CSS Grid/Flexbox - Usar tablas HTML si es necesario
5. Imágenes sin alternativa de texto

## 🧪 Testing de Emails

### Online Tools

- [Litmus](https://litmus.com/) - Prueba en múltiples clientes
- [Email on Acid](https://www.emailonacid.com/) - Testing exhaustivo
- [Mail Tester](https://www.mail-tester.com/) - Verifica spam score

### Testing Local

1. Envía un email de prueba a tu propio correo
2. Verifica en diferentes clientes:
   - Gmail (web y app)
   - Outlook
   - Apple Mail
   - Yahoo Mail

## 📋 Checklist de Personalización

- [ ] Cambiar colores a los de tu marca
- [ ] Agregar logo de tu organización
- [ ] Personalizar el asunto del email (en `params["subject"]`)
- [ ] Ajustar el tono del mensaje (formal/informal)
- [ ] Agregar información de contacto/soporte
- [ ] Probar en diferentes clientes de email
- [ ] Verificar que los links funcionen
- [ ] Comprobar la apariencia en móvil

## 🎨 Paletas de Colores Sugeridas

### Profesional
```css
Primary: #2c3e50
Secondary: #34495e
Accent: #3498db
```

### Moderno
```css
Primary: #667eea
Secondary: #764ba2
Accent: #f093fb
```

### Corporativo
```css
Primary: #1e3a8a
Secondary: #3b82f6
Accent: #60a5fa
```

---

¡Personaliza tu email para que refleje la identidad de tu organización! 🎨
