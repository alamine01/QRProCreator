@echo off
echo ========================================
echo    DEMARRAGE APPLICATION QRPRO
echo ========================================
echo.

REM Aller dans le bon répertoire
cd /d "%~dp0"
echo Repertoire actuel: %CD%
echo.

REM Vérifier que package.json existe
if not exist "package.json" (
    echo ERREUR: package.json non trouve dans le repertoire actuel
    echo Contenu du repertoire:
    dir
    pause
    exit /b 1
)

echo package.json trouve - OK
echo.

REM Installer les dépendances si nécessaire
if not exist "node_modules" (
    echo Installation des dependances...
    npm install
    echo.
)

REM Démarrer l'application
echo Demarrage de l'application...
echo URL: http://localhost:3000
echo.
npm run dev

pause

