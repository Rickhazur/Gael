
$outputFile = "CODIGO_FUENTE_NOVA_SCHOLA.txt"
$extensions = @("*.ts", "*.tsx", "*.css", "*.sql")
$excludeFolders = @("node_modules", ".git", "dist", "build", "coverage", ".gemini", ".vscode")

Write-Host "Iniciando..." -ForegroundColor Cyan

if (Test-Path $outputFile) { Remove-Item $outputFile }

Add-Content $outputFile "PROYECTO: NOVA SCHOLA ELEMENTARY"
Add-Content $outputFile "FECHA: $(Get-Date)"
Add-Content $outputFile "==========================================="
Add-Content $outputFile ""

# Get all files recursively
$files = Get-ChildItem -Recurse -Include $extensions

foreach ($file in $files) {
    # Check if file is in an excluded folder
    $skip = $false
    foreach ($folder in $excludeFolders) {
        if ($file.FullName -match "\\$folder\\") {
            $skip = $true
            break
        }
    }

    if (-not $skip) {
        $relPath = $file.FullName.Replace((Get-Location).Path, "")
        Write-Host "Procesando: $relPath" -ForegroundColor Green
        
        Add-Content $outputFile "-------------------------------------------"
        Add-Content $outputFile "FILE: $relPath"
        Add-Content $outputFile "-------------------------------------------"
        
        try {
            $content = Get-Content $file.FullName -Raw
            Add-Content $outputFile $content
            Add-Content $outputFile ""
        } catch {
            Write-Host "Error reading $file" -ForegroundColor Red
        }
    }
}

Write-Host "Listo: $outputFile" -ForegroundColor Cyan
