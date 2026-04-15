@echo off
REM Library Management System - Setup Script for Windows
REM Installation et configuration automatiques du projet

echo.
echo ==========================================
echo 🚀 Library Management System Setup
echo ==========================================
echo.

REM Check if Node.js is installed
echo [INFO] Vérification de Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js non installé. Veuillez installer Node.js 16.x ou une version supérieure.
    echo Télécharger sur: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js installé: %NODE_VERSION%

REM Check if MongoDB is installed
echo [INFO] Vérification de MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB non installé ou introuvable dans PATH.
    echo Veuillez installer MongoDB :
    echo - Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
    echo.
    set /p continue="Voulez-vous continuer? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
) else (
    echo [SUCCESS] MongoDB installé
)

REM Setup backend
echo [INFO] Installation des dépendances Backend...
cd backend
if not exist "package.json" (
    echo [ERROR] package.json introuvable dans le dossier backend
    pause
    exit /b 1
)

call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Erreur lors de l\'installation des dépendances backend
    pause
    exit /b 1
)
echo [SUCCESS] Dépendances backend installées

REM Setup environment file
if not exist ".env" (
    echo [INFO] Création du fichier .env à partir de env.example...
    copy env.example .env >nul
    echo [SUCCESS] Fichier .env créé
    echo [WARNING] Veuillez vérifier et mettre à jour les informations trong file .env
) else (
    echo [SUCCESS] Le fichier .env existe
)

cd ..

REM Setup frontend
echo [INFO] Installation des dépendances Frontend...
cd frontend
if not exist "package.json" (
    echo [ERROR] package.json introuvable dans le dossier frontend
    pause
    exit /b 1
)

call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Erreur lors de l\'installation des dépendances frontend
    pause
    exit /b 1
)
echo [SUCCESS] Frontend dependencies installé

cd ..

REM Create uploads directories
echo [INFO] Création du dossier uploads...
if not exist "backend\uploads\avatars" mkdir backend\uploads\avatars
if not exist "backend\uploads\books" mkdir backend\uploads\books
echo [SUCCESS] Dossier uploads créé

echo.
echo ==========================================
echo [SUCCESS] Configuration terminée !
echo ==========================================
echo.
echo 📋 Prochaines étapes:
echo 1. Démarrer MongoDB:
echo    net start MongoDB
echo.
echo 2. Lancer le projet:
echo    start.bat
echo.
echo 3. Ou lancer manuellement:
echo    Backend: cd backend ^&^& npm run dev
echo    Frontend: cd frontend ^&^& npm start
echo.
echo 4. Seed des données modèles (optionnel):
echo    cd backend ^&^& npm run seed
echo.
echo [SUCCESS] Bon codage! 🎉
pause
