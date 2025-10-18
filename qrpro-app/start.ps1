# Script PowerShell pour démarrer QRPRO
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    DEMARRAGE APPLICATION QRPRO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Aller dans le répertoire du script
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location -Path $ScriptPath

Write-Host "Répertoire actuel: $PWD" -ForegroundColor Green
Write-Host ""

# Vérifier que package.json existe
if (-not (Test-Path "package.json")) {
    Write-Host "ERREUR: package.json non trouvé dans le répertoire actuel" -ForegroundColor Red
    Write-Host "Contenu du répertoire:" -ForegroundColor Red
    Get-ChildItem | Select-Object Name, Mode
    Read-Host "Appuyez sur Entrée pour continuer"
    exit 1
}

Write-Host "package.json trouvé - OK" -ForegroundColor Green
Write-Host ""

# Installer les dépendances si nécessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dépendances..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Démarrer l'application
Write-Host "Démarrage de l'application..." -ForegroundColor Yellow
Write-Host "URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

try {
    npm run dev
} catch {
    Write-Host "Erreur lors du démarrage: $_" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer"
}

