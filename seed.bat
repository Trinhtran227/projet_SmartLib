@echo off
REM Library Management System - Seed Data Script for Windows
REM Création de données de test pour la base de données

echo.
echo ==========================================
echo 🌱 Library Management System - Seed Data
echo ==========================================
echo.

REM Check MongoDB connection
echo [INFO] Vérification de la connexion MongoDB...
mongosh --eval "db.runCommand('ping')" --quiet >nul 2>&1
if %errorlevel% neq 0 (
    mongo --eval "db.runCommand('ping')" --quiet >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Impossible de se connecter à MongoDB
        echo Veuillez vous assurer que MongoDB fonctionne:
        echo net start MongoDB
        pause
        exit /b 1
    )
)
echo [SUCCESS] MongoDB fonctionne

REM Check if backend directory exists
if not exist "backend" (
    echo [ERROR] Dossier backend introuvable
    pause
    exit /b 1
)

REM Check if backend has node_modules
if not exist "backend\node_modules" (
    echo [WARNING] Dépendances backend non installées
    echo Installation en cours...
    cd backend
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Erreur lors de l\'installation des dépendances backend
        pause
        exit /b 1
    )
    cd ..
    echo [SUCCESS] Dépendances backend installées
)

REM Check if .env exists
if not exist "backend\.env" (
    echo [WARNING] Fichier .env introuvable. Création à partir de env.example...
    cd backend
    copy env.example .env >nul
    cd ..
    echo [SUCCESS] Fichier .env créé
)

REM Show available seed scripts
echo.
echo 📊 Scripts de seeding disponibles:
echo 1. seed.js - Script de seeding principal (28 sách, 5 users, 3 loans)
echo 2. seed-optimized.js - Version optimisée
echo 3. seedLoanData.js - Création de données de prêt
echo 4. seedNotifications.js - Création de notifications modèles
echo 5. seedReviews.js - Création d\'évaluations modèles
echo 6. testNotifications.js - Test du système de notification
echo 7. testNewBookNotification.js - Test de notification de nouveau livre
echo.

REM Interactive seed selection
echo Choisissez le script à exécuter:
echo 1) seed.js (Recommandé)
echo 2) seed-optimized.js
echo 3) seedLoanData.js
echo 4) seedNotifications.js
echo 5) seedReviews.js
echo 6) testNotifications.js
echo 7) testNewBookNotification.js
echo 8) Tout exécuter (1, 3, 4, 5)
echo 0) Quitter
echo.

set /p choice="Entrez votre choix (0-8): "

if "%choice%"=="1" (
    echo [INFO] Exécution du script: seed.js
    cd backend
    node scripts\seed.js
    cd ..
    echo [SUCCESS] Script seed.js terminé
) else if "%choice%"=="2" (
    echo [INFO] Exécution du script: seed-optimized.js
    cd backend
    node scripts\seed-optimized.js
    cd ..
    echo [SUCCESS] Script seed-optimized.js terminé
) else if "%choice%"=="3" (
    echo [INFO] Exécution du script: seedLoanData.js
    cd backend
    node scripts\seedLoanData.js
    cd ..
    echo [SUCCESS] Script seedLoanData.js terminé
) else if "%choice%"=="4" (
    echo [INFO] Exécution du script: seedNotifications.js
    cd backend
    node scripts\seedNotifications.js
    cd ..
    echo [SUCCESS] Script seedNotifications.js terminé
) else if "%choice%"=="5" (
    echo [INFO] Exécution du script: seedReviews.js
    cd backend
    node scripts\seedReviews.js
    cd ..
    echo [SUCCESS] Script seedReviews.js terminé
) else if "%choice%"=="6" (
    echo [INFO] Exécution du script: testNotifications.js
    cd backend
    node scripts\testNotifications.js
    cd ..
    echo [SUCCESS] Script testNotifications.js terminé
) else if "%choice%"=="7" (
    echo [INFO] Exécution du script: testNewBookNotification.js
    cd backend
    node scripts\testNewBookNotification.js
    cd ..
    echo [SUCCESS] Script testNewBookNotification.js terminé
) else if "%choice%"=="8" (
    echo [INFO] Tout exécuter scripts...
    cd backend
    node scripts\seed.js
    node scripts\seedLoanData.js
    node scripts\seedNotifications.js
    node scripts\seedReviews.js
    cd ..
    echo [SUCCESS] Tous les scripts sont terminés
) else if "%choice%"=="0" (
    echo [INFO] Quitter
    exit /b 0
) else (
    echo [ERROR] Choix invalide
    pause
    exit /b 1
)

REM Show account information
echo.
echo ==========================================
echo [SUCCESS] Données de test créées!
echo ==========================================
echo.
echo 👥 Comptes de test:
echo    Admin:     admin@library.com / admin123
echo    Bibliothécaire:   librarian@library.com / librarian123
echo    Étudiant: student1@university.edu / student123
echo    Étudiant: student2@university.edu / student123
echo    Étudiant: student3@university.edu / student123
echo.
echo 📚 Données créées:
echo    - 28 livres avec de vraies couvertures
echo    - 12 catégories de livres
echo    - 12 éditeurs
echo    - 12 facultés et 14 départements
echo    - 3 prêts modèles
echo    - Notifications et évaluations modèles
echo.
echo 🌐 Accéder à l\'application:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
pause
