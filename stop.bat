@echo off
REM Library Management System - Stop Script for Windows
REM Arrêt de tous les serveurs

echo.
echo ==========================================
echo 🛑 Arrêt du système de gestion de la bibliothèque
echo ==========================================
echo.

REM Kill processes by port
echo [INFO] Arrêt en cours de Backend sur le port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000"') do (
    taskkill /PID %%a /F >nul 2>&1
    if %errorlevel% equ 0 (
        echo [SUCCESS] Backend arrêté
    ) else (
        echo [INFO] Backend ne fonctionne pas sur le port 5000
    )
)

echo [INFO] Arrêt en cours de Frontend sur le port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    taskkill /PID %%a /F >nul 2>&1
    if %errorlevel% equ 0 (
        echo [SUCCESS] Frontend arrêté
    ) else (
        echo [INFO] Frontend ne fonctionne pas sur le port 3000
    )
)

REM Kill Node.js processes
echo [INFO] Nettoyage des processus Node.js restants...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.cmd >nul 2>&1

REM Clean up log files
if exist "logs" (
    echo [INFO] Nettoyage des fichiers journaux...
    del /Q logs\*.pid >nul 2>&1
    echo [SUCCESS] Log files nettoyés
)

echo.
echo ==========================================
echo [SUCCESS] Tous les serveurs arrêté!
echo ==========================================
echo.
echo 📝 Pour voir les journaux:
echo    Backend:  type logs\backend.log
echo    Frontend: type logs\frontend.log
echo.
echo 🚀 Pour redémarrer:
echo    start.bat
echo.
pause
