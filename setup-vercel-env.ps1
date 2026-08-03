# Script para configurar variables de entorno en Vercel
# Ejecuta: .\setup-vercel-env.ps1

Write-Host "🚀 Configurando variables de entorno en Vercel..." -ForegroundColor Cyan

# Agregar variables de entorno
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production
vercel env add JWT_SECRET production
vercel env add NODE_ENV production

# OAuth 2.0 contra el CAS de la UR (https://sso.unirioja.es/dorus)
vercel env add CAS_BASE_URL production
vercel env add OAUTH_CLIENT_ID production
vercel env add OAUTH_CLIENT_SECRET production
vercel env add OAUTH_REDIRECT_URI production

# Whitelist por uid (separados por comas) y dirección de auditoría
vercel env add ALLOWED_UIDS production
vercel env add AUDIT_EMAIL production

Write-Host "`n✅ Variables configuradas. Ejecuta 'vercel --prod' para redesplegar" -ForegroundColor Green
