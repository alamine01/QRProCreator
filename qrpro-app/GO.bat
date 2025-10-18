@echo off
title QRPRO - Demarrage
color 0A

echo.
echo  ██████╗ ██████╗ ██████╗ ██████╗ ██████╗ 
echo ██╔═══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗
echo ██║   ██║██████╔╝██████╔╝██████╔╝██████╔╝
echo ██║   ██║██╔══██╗██╔═══╝ ██╔═══╝ ██╔══██╗
echo ╚██████╔╝██║  ██║██║     ██║     ██║  ██║
echo  ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝     ╚═╝  ╚═╝
echo.
echo    APPLICATION QRPRO - DEMARRAGE
echo ========================================
echo.

REM Aller dans le répertoire du script
cd /d "%~dp0"

echo Repertoire: %CD%
echo.

REM Vérifier package.json
if not exist "package.json" (
    echo [ERREUR] package.json manquant!
    echo.
    echo Contenu du repertoire:
    dir
    echo.
    pause
    exit /b 1
)

echo [OK] package.json trouve
echo.

REM Installer si nécessaire
if not exist "node_modules" (
    echo [INFO] Installation des dependances...
    npm install
    echo.
)

REM Démarrer
echo [INFO] Demarrage de l'application...
echo [INFO] URL: http://localhost:3000
echo [INFO] Admin: http://localhost:3000/admin
echo.
echo Appuyez sur Ctrl+C pour arreter
echo.

npm run dev

echo.
echo Application arretee.
pause

