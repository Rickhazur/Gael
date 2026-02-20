# Script de PowerShell para integrar Demo Tour
# Ejecuta este script en PowerShell como Administrador

Write-Host "Integrando Demo Tour..." -ForegroundColor Cyan

$projectPath = "C:\Users\devel\OneDrive\Desktop\Nova-Schola-Elementary-main"

# CAMBIO #1: Agregar import en App.tsx
Write-Host "`nCambio #1: Agregando import en App.tsx..." -ForegroundColor Yellow
$appFile = Join-Path $projectPath "App.tsx"
$appContent = Get-Content $appFile -Raw -Encoding UTF8

# Agregar import después de AvatarProvider
$appContent = $appContent -replace "(import { AvatarProvider } from '@/context/AvatarContext';)", "`$1`r`nimport { DemoTourProvider } from '@/context/DemoTourContext';"

# Agregar DemoTourProvider en el return (después de QueryClientProvider)
$appContent = $appContent -replace "(<QueryClientProvider client={queryClient}>)", "`$1`r`n      <DemoTourProvider>"
$appContent = $appContent -replace "(</QueryClientProvider>)", "      </DemoTourProvider>`r`n    `$1"

Set-Content $appFile -Value $appContent -NoNewline -Encoding UTF8
Write-Host "App.tsx actualizado" -ForegroundColor Green

# CAMBIO #2: Agregar DemoTourButton en MainLayout.tsx
Write-Host "`nCambio #2: Agregando DemoTourButton en MainLayout.tsx..." -ForegroundColor Yellow
$mainLayoutFile = Join-Path $projectPath "components\MainLayout.tsx"
$mainLayoutContent = Get-Content $mainLayoutFile -Raw -Encoding UTF8

# Agregar import
$mainLayoutContent = $mainLayoutContent -replace "(import React)", "import { DemoTourButton } from './DemoTour/DemoTourButton';`r`nimport { useDemoTour } from '@/context/DemoTourContext';`r`nimport { useEffect } from 'react';`r`n`$1"

# Agregar DemoTourButton antes del cierre del div principal
$mainLayoutContent = $mainLayoutContent -replace "(</div>\s*\);\s*}", "      <DemoTourButton />`r`n    `$1"

Set-Content $mainLayoutFile -Value $mainLayoutContent -NoNewline -Encoding UTF8
Write-Host "MainLayout.tsx actualizado" -ForegroundColor Green

# CAMBIO #3: Modificar LoginPage.tsx para iniciar el tour
Write-Host "`nCambio #3: Modificando LoginPage.tsx..." -ForegroundColor Yellow
$loginFile = Join-Path $projectPath "components\LoginPage.tsx"
$loginContent = Get-Content $loginFile -Raw -Encoding UTF8

# Agregar import
if ($loginContent -notmatch "useDemoTour") {
    $loginContent = $loginContent -replace "(import React)", "import { useDemoTour } from '@/context/DemoTourContext';`r`n`$1"
}

# Agregar hook en el componente (después de useState)
$loginContent = $loginContent -replace "(const \[formData, setFormData\] = useState)", "const { startTour } = useDemoTour();`r`n  `$1"

# Modificar el onClick del botón demo
$loginContent = $loginContent -replace "(// Trigger login\s+onLogin\(\{ email: 'sofia\.demo@novaschola\.com', password: 'demo2024' \}, 'STUDENT'\);)", "`$1`r`n                    // Start demo tour after login`r`n                    setTimeout(() => {`r`n                        startTour();`r`n                    }, 1500);"

Set-Content $loginFile -Value $loginContent -NoNewline -Encoding UTF8
Write-Host "LoginPage.tsx actualizado" -ForegroundColor Green

Write-Host "`nCambios aplicados exitosamente!" -ForegroundColor Green
Write-Host "`nProximos pasos:" -ForegroundColor Cyan
Write-Host "1. Recarga la app en el navegador (F5)"
Write-Host "2. Haz clic en VER DEMO INTERACTIVA"
Write-Host "3. Deberia aparecer el boton flotante del tour"
Write-Host "`nListo!" -ForegroundColor Magenta
