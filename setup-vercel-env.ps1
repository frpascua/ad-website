# Script para configurar variables de entorno en Vercel
# Ejecuta: .\setup-vercel-env.ps1

Write-Host "🚀 Configurando variables de entorno en Vercel..." -ForegroundColor Cyan

# Agregar variables de entorno
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production
vercel env add JWT_SECRET production
vercel env add NODE_ENV production

Write-Host "`n✅ Variables configuradas. Ejecuta 'vercel --prod' para redesplegar" -ForegroundColor Green
