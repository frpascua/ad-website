# Script de análisis de logs
# Uso: .\analyze-logs.ps1 [fecha]
# Ejemplo: .\analyze-logs.ps1 2026-05-27

param(
    [string]$fecha = (Get-Date -Format "yyyy-MM-dd")
)

$logFile = "logs\access-$fecha.log"

if (-not (Test-Path $logFile)) {
    Write-Host "❌ No se encontró el archivo de log: $logFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Archivos disponibles:" -ForegroundColor Cyan
    Get-ChildItem logs\*.log | ForEach-Object { Write-Host "  - $($_.Name)" }
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   REPORTE DE ACCESO - $fecha" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Logins exitosos
$logins = @(Select-String -Path $logFile -Pattern "Login exitoso")
Write-Host "✅ Logins exitosos: $($logins.Count)" -ForegroundColor Green
if ($logins.Count -gt 0) {
    Write-Host "   Usuarios:" -ForegroundColor Gray
    $logins | ForEach-Object {
        if ($_.Line -match '"email":"([^"]+)"') {
            Write-Host "   - $($matches[1])" -ForegroundColor Gray
        }
    }
}
Write-Host ""

# Solicitudes de Magic Link autorizadas
$magicLinks = @(Select-String -Path $logFile -Pattern "Solicitud de Magic Link autorizada")
Write-Host "📧 Magic Links enviados: $($magicLinks.Count)" -ForegroundColor Blue
Write-Host ""

# Intentos denegados
$denegados = @(Select-String -Path $logFile -Pattern "denegado")
Write-Host "⛔ Intentos denegados: $($denegados.Count)" -ForegroundColor Red
if ($denegados.Count -gt 0) {
    Write-Host "   Emails rechazados:" -ForegroundColor Gray
    $denegados | ForEach-Object {
        if ($_.Line -match '"email":"([^"]+)"') {
            Write-Host "   - $($matches[1])" -ForegroundColor Gray
        }
    }
}
Write-Host ""

# Accesos sin token
$sinToken = @(Select-String -Path $logFile -Pattern "sin token")
Write-Host "⚠️  Accesos sin token: $($sinToken.Count)" -ForegroundColor Yellow
Write-Host ""

# Tokens inválidos o expirados
$tokensInvalidos = @(Select-String -Path $logFile -Pattern "Token inválido|expirado")
Write-Host "🔒 Tokens inválidos/expirados: $($tokensInvalidos.Count)" -ForegroundColor Magenta
Write-Host ""

# Logouts
$logouts = @(Select-String -Path $logFile -Pattern "Logout")
Write-Host "👋 Logouts: $($logouts.Count)" -ForegroundColor White
Write-Host ""

# Accesos totales autorizados
$accesos = @(Select-String -Path $logFile -Pattern "Acceso autorizado")
Write-Host "📊 Total accesos autorizados: $($accesos.Count)" -ForegroundColor Cyan
Write-Host ""

# IPs únicas
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   IPs ÚNICAS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$allLines = Get-Content $logFile
$ips = @{}
foreach ($line in $allLines) {
    if ($line -match '"ip":"([^"]+)"') {
        $ip = $matches[1]
        if ($ips.ContainsKey($ip)) {
            $ips[$ip]++
        } else {
            $ips[$ip] = 1
        }
    }
}

$ips.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
    Write-Host "  $($_.Key): $($_.Value) peticiones" -ForegroundColor Gray
}
Write-Host ""

# Horario de mayor actividad
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ACTIVIDAD POR HORA" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$horas = @{}
foreach ($line in $allLines) {
    if ($line -match '(\d{4}-\d{2}-\d{2} \d{2}):') {
        $hora = $matches[1].Split(' ')[1]
        if ($horas.ContainsKey($hora)) {
            $horas[$hora]++
        } else {
            $horas[$hora] = 1
        }
    }
}

$horas.GetEnumerator() | Sort-Object Name | ForEach-Object {
    $barLength = [Math]::Min($_.Value, 50)
    $bar = "█" * $barLength
    Write-Host "  $($_.Key):00 - $bar $($_.Value)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Archivo analizado: $logFile" -ForegroundColor Gray
Write-Host "Líneas totales: $($allLines.Count)" -ForegroundColor Gray
Write-Host ""
