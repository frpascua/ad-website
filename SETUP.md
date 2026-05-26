# ⚡ Guía Rápida de Configuración

## 1️⃣ Configurar Emails Autorizados

Edita `api/main.py` línea ~35:

```python
ALLOWED_EMAILS = [
    "usuario1@correo.com",
    "usuario2@correo.com",
    "admin@example.com",
]
```

## 2️⃣ Variables de Entorno en Vercel

**IMPORTANTE:** Las variables se configuran en el **Dashboard de Vercel**, NO en archivos del proyecto.

**Dashboard de Vercel** → Tu Proyecto → Settings → Environment Variables

### Agregar estas 4 variables:

```env
JWT_SECRET=tu-clave-secreta-muy-larga-y-aleatoria
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
BASE_URL=https://tu-dominio.vercel.app
FROM_EMAIL=login@tudominio.com
```

### Generar JWT_SECRET seguro:

**En Python:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**En Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Online:**
https://generate-secret.vercel.app/32

## 3️⃣ Obtener RESEND_API_KEY

1. Ir a https://resend.com/api-keys
2. Click en "Create API Key"
3. Copiar la key (empieza con `re_`)
4. Pegarla en Vercel

## 4️⃣ Configurar FROM_EMAIL en Resend

### Opción A: Dominio Propio (Recomendado para producción)

1. Ir a https://resend.com/domains
2. Add Domain → Ingresar tu dominio
3. Configurar DNS según instrucciones
4. Esperar verificación (~24-48h)
5. Usar: `login@tudominio.com`

### Opción B: Dominio de Prueba (Para testing)

Usar directamente:
```
FROM_EMAIL=onboarding@resend.dev
```

**Limitación:** Solo puedes enviar a tu propio email registrado en Resend.

## 5️⃣ Desplegar

```bash
# Opción 1: CLI
npm i -g vercel
vercel --prod

# Opción 2: Git Push (si está conectado)
git add .
git commit -m "Configurar autenticación"
git push origin main
```

## 6️⃣ Probar

1. Visitar: `https://tu-dominio.vercel.app`
2. Ingresar email autorizado
3. Revisar bandeja de entrada
4. Click en el magic link
5. ¡Listo! Acceso a `/ad/`

## 🔍 Verificar Logs en Vercel

```bash
# Ver logs en tiempo real
vercel logs --follow

# Ver logs de una función específica
vercel logs api/main.py
```

## 🐛 Problemas Comunes

### No llega el email
- ✅ Verificar `RESEND_API_KEY` en Vercel
- ✅ Verificar que `FROM_EMAIL` esté verificado
- ✅ Revisar spam/correo no deseado
- ✅ Ver logs: `vercel logs`

### "Token inválido"
- ✅ El magic link expira en 15 minutos
- ✅ Solicitar un nuevo link
- ✅ Verificar que `JWT_SECRET` esté configurado

### Redirección a login
- ✅ Verificar cookies en DevTools
- ✅ Asegurar que estás usando HTTPS
- ✅ Revisar que el email esté en `ALLOWED_EMAILS`

## 📝 Checklist de Despliegue

- [ ] Configurar `ALLOWED_EMAILS` en `api/main.py`
- [ ] Generar `JWT_SECRET` aleatorio
- [ ] Obtener `RESEND_API_KEY`
- [ ] Configurar dominio en Resend (o usar `onboarding@resend.dev`)
- [ ] Agregar las 4 variables en Vercel
- [ ] Desplegar con `vercel --prod`
- [ ] Probar login con email autorizado
- [ ] Verificar acceso a `/ad/`
- [ ] Probar logout

## 🎉 ¡Listo!

Tu sitio ahora está protegido con autenticación por magic link.
