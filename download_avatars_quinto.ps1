# Script para descargar avatares de quinto grado
# Ejecuta este script en PowerShell desde la carpeta del proyecto

$sourceFolder = Join-Path $PSScriptRoot "public\avatars"
$destFolder = Join-Path $env:USERPROFILE "Downloads\Nova_Avatares_Quinto"

# Crear carpeta de destino si no existe
if (-not (Test-Path $destFolder)) {
    New-Item -ItemType Directory -Path $destFolder -Force | Out-Null
    Write-Host "Carpeta creada: $destFolder" -ForegroundColor Green
}

# Lista de avatares de quinto grado
$avatars = @(
    "g5_boy_1.png",
    "g5_boy_2.png",
    "g5_boy_3.png",
    "g5_boy_4.png",
    "g5_girl_1_1769540901853.png",
    "g5_girl_2_1769540916141.png",
    "g5_girl_3_1769540930925.png"
)

Write-Host ""
Write-Host "Copiando avatares de quinto grado..." -ForegroundColor Cyan

$copied = 0
foreach ($avatar in $avatars) {
    $sourcePath = Join-Path $sourceFolder $avatar
    $destPath = Join-Path $destFolder $avatar
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "  OK: $avatar" -ForegroundColor Green
        $copied++
    } else {
        Write-Host "  ERROR: $avatar (no encontrado)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Listo! $copied archivos copiados a:" -ForegroundColor Green
Write-Host $destFolder -ForegroundColor Yellow
Write-Host ""
Write-Host "Abriendo carpeta..."
Start-Process explorer.exe -ArgumentList $destFolder
