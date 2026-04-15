@echo off
REM Library Management System - Start Script for Windows
REM Démarrage du backend et du frontend

echo.
echo ==========================================
echo 🚀 Library Management System
echo ==========================================
echo.

REM Create logs directory
if not exist "logs" mkdir logs

REM Check MongoDB connection
echo [INFO] Vérification de la connexion MongoDB...
mongosh --eval "db.runCommand('ping')" --quiet >nul 2>&1
if %errorlevel% neq 0 (
    mongo --eval "db.runCommand('ping')" --quiet >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARNING] Impossible de se connecter à MongoDB
        echo Veuillez vous assurer que MongoDB fonctionne:
        echo net start MongoDB
        echo.
        set /p continue="Voulez-vous continuer? (y/n): "
        if /i not "%continue%"=="y" exit /b 1
    )
)
echo [SUCCESS] MongoDB fonctionne

REM Check if backend port is in use
echo [INFO] Vérification du port 5000...
netstat -an | findstr ":5000" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 5000 en cours d\'utilisation. Arrêt du processus en cours...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000"') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 >nul
)

REM Start backend
echo [INFO] Démarrage du serveur Backend...
cd backend

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] Fichier .env introuvable. Création à partir de env.example...
    copy env.example .env >nul
)

REM Start backend in background
start /b "Backend Server" cmd /c "npm run dev > ..\logs\backend.log 2>&1"
echo %date% %time% > ..\logs\backend.pid

REM Wait a moment for backend to start
timeout /t 3 >nul

REM Check if backend started successfully
netstat -an | findstr ":5000" >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Backend en cours d\'exécution sur http://localhost:5000
) else (
    echo [ERROR] Échec du démarrage du backend. Vérifier les journaux\backend.log
    pause
    exit /b 1
)

cd ..

REM Check if frontend port is in use
echo [INFO] Vérification du port 3000...
netstat -an | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 3000 en cours d\'utilisation. Arrêt du processus en cours...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 >nul
)

REM Start frontend
echo [INFO] Démarrage du serveur Frontend...
cd frontend

REM Start frontend in background
start /b "Frontend Server" cmd /c "npm start > ..\logs\frontend.log 2>&1"
echo %date% %time% > ..\logs\frontend.pid

REM Wait a moment for frontend to start
timeout /t 5 >nul

REM Check if frontend started successfully
netstat -an | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Frontend en cours d\'exécution sur http://localhost:3000
) else (
    echo [ERROR] Échec du démarrage du frontend. Vérifier les journaux\frontend.log
    pause
    exit /b 1
)

cd ..

echo.
echo ==========================================
echo [SUCCESS] Tous les serveurs ont démarré!
echo ==========================================
echo.
echo 🌐 URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo    API Health: http://localhost:5000/api/health
echo.
echo 📋 Comptes de test:
echo    Admin: admin@library.com / admin123
echo    Bibliothécaire: librarian@library.com / librarian123
echo    Étudiant: student1@university.edu / student123
echo.
echo 📊 Seed des données modèles:
echo    cd backend ^&^& npm run seed
echo.
echo 📝 Logs:
echo    Backend:  logs\backend.log
echo    Frontend: logs\frontend.log
echo.
echo 🛑 Appuyez sur Ctrl+C pour arrêter tous les serveurs
echo.

REM Keep script running
:loop
timeout /t 1 >nul
goto loop
