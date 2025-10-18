# Script PowerShell pour démarrer l'application QRPRO
Write-Host "🚀 Démarrage de l'application QRPRO..." -ForegroundColor Green

# Aller dans le répertoire de l'application
Set-Location -Path $PSScriptRoot

# Vérifier que nous sommes dans le bon répertoire
if (Test-Path "package.json") {
    Write-Host "✅ Répertoire correct trouvé" -ForegroundColor Green
    
    # Démarrer l'application
    Write-Host "🔄 Démarrage de npm run dev..." -ForegroundColor Yellow
    npm run dev
} else {
    Write-Host "❌ Erreur: package.json non trouvé dans le répertoire actuel" -ForegroundColor Red
    Write-Host "Répertoire actuel: $PWD" -ForegroundColor Red
    Write-Host "Contenu du répertoire:" -ForegroundColor Red
    Get-ChildItem | Select-Object Name
}

