# 📧 Guía de Configuración de Resend

Esta guía te ayudará a configurar **Resend** para enviar emails de Magic Link en tu aplicación.

---

## 🎯 ¿Qué es Resend?

[Resend](https://resend.com) es un servicio moderno de envío de emails diseñado específicamente para desarrolladores. Ofrece:

- ✅ **100 emails gratis al día** (3,000/mes)
- ✅ API simple y moderna
- ✅ Excelente documentación
- ✅ Verificación de dominio gratuita
- ✅ Sin tarjeta de crédito para el plan gratuito
- ✅ Perfecto para Vercel y Next.js

---

## 🚀 Configuración Rápida (5 minutos)

### Paso 1: Crear Cuenta en Resend

1. Ve a [resend.com](https://resend.com)
2. Haz clic en **"Sign Up"**
3. Regístrate con tu email o GitHub

### Paso 2: Obtener API Key

1. Una vez dentro, ve a [API Keys](https://resend.com/api-keys)
2. Haz clic en **"Create API Key"**
3. Dale un nombre (ej: `magic-link-production`)
4. Selecciona permisos: **"Sending access"**
5. Haz clic en **"Add"**
6. **¡IMPORTANTE!** Copia la API Key que comienza con `re_...`
   - Solo se mostrará una vez
   - Guárdala en un lugar seguro

### Paso 3: Configurar en Desarrollo Local

#### Opción A: Usando archivo .env (Recomendado)

```powershell
# Copiar el archivo de ejemplo
copy .env.example .env
```

Edita `.env` y pega tu API Key:

```env
RESEND_API_KEY=re_tu_api_key_aqui_pegada
RESEND_FROM_EMAIL=onboarding@resend.dev
JWT_SECRET=tu-secreto-local-123
```

#### Opción B: Variables de entorno de PowerShell

```powershell
# Establecer variables temporales (solo para la sesión actual)
$env:RESEND_API_KEY="re_tu_api_key_aqui"
$env:RESEND_FROM_EMAIL="onboarding@resend.dev"

# Iniciar servidor
pnpm dev
```

### Paso 4: Probar el Envío

1. Inicia el servidor:
   ```powershell
   pnpm dev
   ```

2. Abre `http://localhost:3000`

3. Ingresa **tu email real** en el formulario

4. Haz clic en **"Enviar Enlace Mágico"**

5. **Revisa tu bandeja de entrada** (o spam)

6. Deberías recibir un email profesional con un botón para iniciar sesión

---

## 🌐 Configuración en Producción (Vercel)

### Paso 1: Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **Settings** → **Environment Variables**
3. Agrega las siguientes variables:

| Name | Value | Environment |
|------|-------|-------------|
| `RESEND_API_KEY` | `re_tu_api_key` | Production, Preview, Development |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` | Production, Preview, Development |
| `JWT_SECRET` | (cadena aleatoria larga) | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

4. Haz clic en **"Save"**

### Paso 2: Redesplegar

```powershell
# Hacer un nuevo deploy
git add .
git commit -m "Configurar Resend"
git push

# O usar Vercel CLI
vercel --prod
```

---

## 🏢 Usar Dominio Propio (Opcional pero Recomendado)

Para mejor deliverability y profesionalismo:

### Paso 1: Agregar Dominio en Resend

1. Ve a [Domains](https://resend.com/domains) en Resend
2. Haz clic en **"Add Domain"**
3. Ingresa tu dominio (ej: `tudominio.com`)
4. Resend te mostrará los registros DNS que debes agregar

### Paso 2: Configurar DNS

Resend te pedirá agregar estos registros en tu proveedor de DNS:

#### SPF Record (TXT)
```
Name: @
Type: TXT
Value: v=spf1 include:resend.com ~all
```

#### DKIM Records (CNAME)
```
Name: resend._domainkey
Type: CNAME
Value: [valor proporcionado por Resend]

Name: resend2._domainkey
Type: CNAME
Value: [valor proporcionado por Resend]
```

#### DMARC Record (TXT) - Opcional
```
Name: _dmarc
Type: TXT
Value: v=DMARC1; p=none
```

### Paso 3: Verificar Dominio

1. Después de agregar los registros DNS (puede tomar hasta 48h)
2. Vuelve a Resend y haz clic en **"Verify Domain"**
3. Si está correcto, verás un ✅ verde

### Paso 4: Actualizar Email de Envío

Cambia la variable de entorno:

```env
# Antes
RESEND_FROM_EMAIL=onboarding@resend.dev

# Después (con tu dominio verificado)
RESEND_FROM_EMAIL=noreply@tudominio.com
# o
RESEND_FROM_EMAIL=magic-link@tudominio.com
```

---

## 🧪 Probar el Email Localmente

### Ver el Email Sin Enviarlo (Testing)

Para desarrollo, puedes ver cómo se ve el email sin enviarlo:

1. Instala una herramienta de email local como [MailHog](https://github.com/mailhog/MailHog) o [Ethereal](https://ethereal.email/)

2. O simplemente usa `console.log()` para ver el HTML:

```javascript
// En api/index.js (temporal para debugging)
console.log('HTML del email:', htmlDelEmail);
```

---

## 📊 Monitorear Emails Enviados

### En Resend Dashboard

1. Ve a [Emails](https://resend.com/emails) en Resend
2. Verás una lista de todos los emails enviados
3. Puedes ver:
   - ✅ Estado (Delivered, Bounced, etc.)
   - 📧 Destinatario
   - ⏰ Timestamp
   - 🔍 Detalles completos del email

---

## 🐛 Solución de Problemas

### Error: "Missing API key"

**Causa:** `RESEND_API_KEY` no está configurada

**Solución:**
```powershell
# Verifica que el archivo .env existe
cat .env

# O establece la variable manualmente
$env:RESEND_API_KEY="re_tu_api_key"
```

### Error: "Invalid API key"

**Causa:** API Key incorrecta o expirada

**Solución:**
1. Ve a [resend.com/api-keys](https://resend.com/api-keys)
2. Verifica que la key está activa
3. Si es necesario, crea una nueva

### Error: "Domain not verified"

**Causa:** Intentas enviar desde un dominio no verificado

**Solución:**
- Para desarrollo: usa `onboarding@resend.dev`
- Para producción: verifica tu dominio en Resend

### Email va a Spam

**Causa:** Dominio no verificado o sin registros SPF/DKIM

**Solución:**
1. Verifica tu dominio en Resend
2. Agrega todos los registros DNS (SPF, DKIM, DMARC)
3. Espera 24-48 horas para propagación DNS
4. Usa [mail-tester.com](https://www.mail-tester.com/) para verificar

### Email no llega

**Checklist:**
- [ ] ¿`RESEND_API_KEY` está configurada?
- [ ] ¿El email del destinatario es válido?
- [ ] ¿Revisaste la carpeta de spam?
- [ ] ¿El dominio está verificado?
- [ ] ¿Hay errores en la consola del servidor?
- [ ] ¿Alcanzaste el límite de emails diarios? (100/día gratis)

---

## 💰 Planes de Resend

### Plan Gratuito (Hobby)
- ✅ 100 emails/día
- ✅ 3,000 emails/mes
- ✅ 1 dominio verificado
- ✅ Sin tarjeta de crédito
- ❌ Sin soporte prioritario

### Plan Pro ($20/mes)
- ✅ 50,000 emails/mes
- ✅ Dominios ilimitados
- ✅ Soporte prioritario
- ✅ Webhooks
- ✅ Analytics avanzados

**Para la mayoría de proyectos, el plan gratuito es suficiente.**

---

## 🔗 Recursos Útiles

- [Documentación de Resend](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Ejemplos de Código](https://resend.com/docs/send-with-nodejs)
- [Resend Status](https://status.resend.com/)
- [Comunidad de Resend](https://resend.com/community)

---

## 🎓 Mejores Prácticas

### 1. Usa Variables de Entorno
```javascript
// ✅ Correcto
const apiKey = process.env.RESEND_API_KEY;

// ❌ Incorrecto - Nunca hardcodees la API key
const apiKey = 're_abc123...';
```

### 2. Maneja Errores Apropiadamente
```javascript
try {
  const { data, error } = await resend.emails.send({...});
  if (error) {
    console.error('Error al enviar:', error);
    // Manejar el error
  }
} catch (error) {
  console.error('Error inesperado:', error);
}
```

### 3. Valida Emails Antes de Enviar
```javascript
if (!email || !email.includes('@')) {
  return res.status(400).json({ error: 'Email inválido' });
}
```

### 4. Implementa Rate Limiting
```javascript
// Prevenir spam - limitar a 3 emails/hora por usuario
// Usa express-rate-limit o similar
```

### 5. Monitorea los Webhooks
```javascript
// Configura webhooks en Resend para saber cuándo:
// - El email fue entregado
// - El email rebotó
// - El usuario hizo clic en un link
```

---

✨ **¡Configuración completa!** Ahora tu aplicación puede enviar Magic Links profesionales por email.
