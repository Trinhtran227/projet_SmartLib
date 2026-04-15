#!/bin/bash

# Library Management System - Seed Data Script
# Création de données de test pour la base de données

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if MongoDB is running
check_mongodb() {
    print_status "Vérification de la connexion MongoDB..."
    
    if command -v mongosh &> /dev/null; then
        if mongosh --eval "db.runCommand('ping')" --quiet >/dev/null 2>&1; then
            print_success "MongoDB fonctionne"
            return 0
        fi
    elif command -v mongo &> /dev/null; then
        if mongo --eval "db.runCommand('ping')" --quiet >/dev/null 2>&1; then
            print_success "MongoDB fonctionne"
            return 0
        fi
    fi
    
    print_error "Impossible de se connecter à MongoDB"
    echo "Veuillez vous assurer que MongoDB fonctionne:"
    echo "- Windows: net start MongoDB"
    echo "- macOS: brew services start mongodb-community"
    echo "- Linux: sudo systemctl start mongod"
    exit 1
}

# Show available seed scripts
show_scripts() {
    echo ""
    echo "📊 Scripts de seeding disponibles:"
    echo "1. seed.js - Script de seeding principal (28 sách, 5 users, 3 loans)"
    echo "2. seed-optimized.js - Version optimisée"
    echo "3. seedLoanData.js - Création de données de prêt"
    echo "4. seedNotifications.js - Création de notifications modèles"
    echo "5. seedReviews.js - Création d\'évaluations modèles"
    echo "6. testNotifications.js - Test du système de notification"
    echo "7. testNewBookNotification.js - Test de notification de nouveau livre"
    echo ""
}

# Run seed script
run_seed() {
    local script_name=$1
    local script_path="backend/scripts/$script_name"
    
    if [ ! -f "$script_path" ]; then
        print_error "Không tìm thấy script: $script_path"
        exit 1
    fi
    
    print_status "Exécution du script: $script_name"
    cd backend
    node "scripts/$script_name"
    cd ..
    print_success "Script $script_name terminé"
}

# Interactive seed selection
interactive_seed() {
    show_scripts
    
    echo "Choisissez le script à exécuter:"
    echo "1) seed.js (Recommandé)"
    echo "2) seed-optimized.js"
    echo "3) seedLoanData.js"
    echo "4) seedNotifications.js"
    echo "5) seedReviews.js"
    echo "6) testNotifications.js"
    echo "7) testNewBookNotification.js"
    echo "8) Tout exécuter (1, 3, 4, 5)"
    echo "0) Quitter"
    echo ""
    
    read -p "Entrez votre choix (0-8): " choice
    
    case $choice in
        1)
            run_seed "seed.js"
            ;;
        2)
            run_seed "seed-optimized.js"
            ;;
        3)
            run_seed "seedLoanData.js"
            ;;
        4)
            run_seed "seedNotifications.js"
            ;;
        5)
            run_seed "seedReviews.js"
            ;;
        6)
            run_seed "testNotifications.js"
            ;;
        7)
            run_seed "testNewBookNotification.js"
            ;;
        8)
            print_status "Tout exécuter scripts..."
            run_seed "seed.js"
            run_seed "seedLoanData.js"
            run_seed "seedNotifications.js"
            run_seed "seedReviews.js"
            print_success "Tous les scripts sont terminés"
            ;;
        0)
            print_status "Quitter"
            exit 0
            ;;
        *)
            print_error "Choix invalide"
            exit 1
            ;;
    esac
}

# Show account information
show_accounts() {
    echo ""
    echo "=========================================="
    print_success "Données de test créées!"
    echo "=========================================="
    echo ""
    echo "👥 Comptes de test:"
    echo "   Admin:     admin@library.com / admin123"
    echo "   Bibliothécaire:   librarian@library.com / librarian123"
    echo "   Étudiant: student1@university.edu / student123"
    echo "   Étudiant: student2@university.edu / student123"
    echo "   Étudiant: student3@university.edu / student123"
    echo ""
    echo "📚 Données créées:"
    echo "   - 28 livres avec de vraies couvertures"
    echo "   - 12 catégories de livres"
    echo "   - 12 éditeurs"
    echo "   - 12 facultés et 14 départements"
    echo "   - 3 prêts modèles"
    echo "   - Notifications et évaluations modèles"
    echo ""
    echo "🌐 Accéder à l\'application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:5000"
    echo ""
}

# Main function
main() {
    echo "=========================================="
    echo "🌱 Library Management System - Seed Data"
    echo "=========================================="
    
    # Check MongoDB
    check_mongodb
    
    # Check if backend directory exists
    if [ ! -d "backend" ]; then
        print_error "Dossier backend introuvable"
        exit 1
    fi
    
    # Check if backend has node_modules
    if [ ! -d "backend/node_modules" ]; then
        print_warning "Dépendances backend non installées"
        echo "Installation en cours..."
        cd backend
        npm install
        cd ..
        print_success "Dépendances backend installées"
    fi
    
    # Check if .env exists
    if [ ! -f "backend/.env" ]; then
        print_warning "Fichier .env introuvable. Création à partir de env.example..."
        cd backend
        cp env.example .env
        cd ..
        print_success "Fichier .env créé"
    fi
    
    # Run interactive seed
    interactive_seed
    
    # Show account information
    show_accounts
}

# Handle command line arguments
if [ $# -eq 0 ]; then
    # No arguments, run interactive mode
    main
else
    # Arguments provided, run specific script
    case $1 in
        "seed"|"main")
            check_mongodb
            run_seed "seed.js"
            show_accounts
            ;;
        "optimized")
            check_mongodb
            run_seed "seed-optimized.js"
            show_accounts
            ;;
        "loans")
            check_mongodb
            run_seed "seedLoanData.js"
            ;;
        "notifications")
            check_mongodb
            run_seed "seedNotifications.js"
            ;;
        "reviews")
            check_mongodb
            run_seed "seedReviews.js"
            ;;
        "test-notifications")
            check_mongodb
            run_seed "testNotifications.js"
            ;;
        "test-new-book")
            check_mongodb
            run_seed "testNewBookNotification.js"
            ;;
        "all")
            check_mongodb
            run_seed "seed.js"
            run_seed "seedLoanData.js"
            run_seed "seedNotifications.js"
            run_seed "seedReviews.js"
            show_accounts
            ;;
        *)
            echo "Cách sử dụng: $0 [script_name]"
            echo ""
            echo "Scripts có sẵn:"
            echo "  seed, main     - Lancer seed.js (khuyến nghị)"
            echo "  optimized      - Lancer seed-optimized.js"
            echo "  loans          - Lancer seedLoanData.js"
            echo "  notifications  - Lancer seedNotifications.js"
            echo "  reviews        - Lancer seedReviews.js"
            echo "  test-notifications - Lancer testNotifications.js"
            echo "  test-new-book  - Lancer testNewBookNotification.js"
            echo "  all            - Tout exécuter scripts"
            echo ""
            echo "Hoặc chạy không có tham số để chọn tương tác"
            exit 1
            ;;
    esac
fi
