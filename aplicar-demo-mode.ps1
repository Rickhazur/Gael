# Script de PowerShell para aplicar cambios de demo mode
# Ejecuta este script en PowerShell como Administrador

Write-Host "Aplicando cambios para Modo Demo..." -ForegroundColor Cyan

# Ruta base del proyecto
$projectPath = "C:\Users\devel\OneDrive\Desktop\Nova-Schola-Elementary-main"

# CAMBIO #1: Centro de Investigacion
Write-Host "`nCambio #1: Centro de Investigacion..." -ForegroundColor Yellow
$file1 = Join-Path $projectPath "components\ResearchCenter\ResearchCenter.tsx"
$content1 = Get-Content $file1 -Raw -Encoding UTF8
$content1 = $content1 -replace "const \[searchQuery, setSearchQuery\] = useState\(''\);", "// Pre-fill with demo query ONLY in demo mode`r`n  const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';`r`n  const [searchQuery, setSearchQuery] = useState(isDemoMode ? 'El Ciclo del Agua' : '');"
Set-Content $file1 -Value $content1 -NoNewline -Encoding UTF8
Write-Host "Centro de Investigacion actualizado" -ForegroundColor Green

# CAMBIO #2: Centro de Misiones
Write-Host "`nCambio #2: Centro de Misiones..." -ForegroundColor Yellow
$file2 = Join-Path $projectPath "components\Missions\TaskControlCenter.tsx"
$content2 = Get-Content $file2 -Raw -Encoding UTF8
$content2 = $content2 -replace 'console\.error\("Error loading missions:", err\);\s+toast\.error\("Error cargando misiones\."\);', "console.error(`"Error loading missions:`", err);`r`n            // Only show error if NOT in demo mode`r`n            const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';`r`n            if (!isDemoMode) {`r`n                toast.error(`"Error cargando misiones.`");`r`n            }"
Set-Content $file2 -Value $content2 -NoNewline -Encoding UTF8
Write-Host "Centro de Misiones actualizado" -ForegroundColor Green

# CAMBIO #3: Tarjetas Magicas
Write-Host "`nCambio #3: Tarjetas Magicas..." -ForegroundColor Yellow
$file3 = Join-Path $projectPath "components\Flashcards.tsx"
$content3 = Get-Content $file3 -Raw -Encoding UTF8
$pattern3 = "const \[topicInput, setTopicInput\] = useState\(''\);"
if ($content3 -match $pattern3) {
    $content3 = $content3 -replace $pattern3, "// Pre-fill with demo topic ONLY in demo mode`r`n  const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';`r`n  const [topicInput, setTopicInput] = useState(isDemoMode ? 'Fracciones y Decimales' : '');"
    Set-Content $file3 -Value $content3 -NoNewline -Encoding UTF8
    Write-Host "Tarjetas Magicas actualizado" -ForegroundColor Green
} else {
    Write-Host "No se encontro la linea en Flashcards.tsx - hazlo manualmente" -ForegroundColor Red
}

Write-Host "`nCambios aplicados exitosamente!" -ForegroundColor Green
Write-Host "`nProximos pasos:" -ForegroundColor Cyan
Write-Host "1. Recarga la app en el navegador (F5)"
Write-Host "2. Prueba el demo haciendo clic en VER DEMO INTERACTIVA"
Write-Host "3. Verifica que los campos esten pre-llenos"
Write-Host "`nListo para presentar!" -ForegroundColor Magenta
