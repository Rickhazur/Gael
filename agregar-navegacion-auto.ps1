# Script de PowerShell para agregar navegacion automatica al Demo Tour
# Ejecuta este script en PowerShell como Administrador

Write-Host "Agregando navegacion automatica al Demo Tour..." -ForegroundColor Cyan

$projectPath = "C:\Users\devel\OneDrive\Desktop\Nova-Schola-Elementary-main"

# Agregar navegacion automatica en MainLayout.tsx
Write-Host "`nAgregando logica de navegacion..." -ForegroundColor Yellow
$mainLayoutFile = Join-Path $projectPath "components\MainLayout.tsx"
$content = Get-Content $mainLayoutFile -Raw -Encoding UTF8

# Buscar la linea donde agregar el codigo
# Despues de: const effectiveLanguage = language === 'bilingual' ? 'es' : language;
$searchPattern = "const effectiveLanguage = language === 'bilingual' \? 'es' : language;"

$newCode = @"
const effectiveLanguage = language === 'bilingual' ? 'es' : language;

    // Demo Tour: Auto-navigate when step changes
    const { tourState, getCurrentStepData } = useDemoTour();
    
    useEffect(() => {
        if (tourState.isActive) {
            const currentStep = getCurrentStepData();
            if (currentStep && currentStep.view) {
                setCurrentView(currentStep.view);
            }
        }
    }, [tourState.currentStep, tourState.isActive]);
"@

$content = $content -replace $searchPattern, $newCode

Set-Content $mainLayoutFile -Value $content -NoNewline -Encoding UTF8
Write-Host "Navegacion automatica agregada" -ForegroundColor Green

Write-Host "`nCambios aplicados exitosamente!" -ForegroundColor Green
Write-Host "`nProximos pasos:" -ForegroundColor Cyan
Write-Host "1. Recarga la app en el navegador (F5)"
Write-Host "2. Haz clic en VER DEMO INTERACTIVA"
Write-Host "3. Haz clic en Siguiente"
Write-Host "4. AHORA SI deberia navegar automaticamente"
Write-Host "`nListo!" -ForegroundColor Magenta
