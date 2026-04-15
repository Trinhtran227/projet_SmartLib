#!/bin/bash

# Library Management System - Development Script
# Script tổng hợp cho development

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

# Show help
show_help() {
    echo "=========================================="
    echo "🛠️  Library Management System - Dev Tools"
    echo "=========================================="
    echo ""
    echo "Cách sử dụng: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup     - Cài đặt project từ đầu"
    echo "  start     - Khởi động tất cả servers"
    echo "  stop      - Arrêt de tous les serveurs"
    echo "  restart   - Khởi động lại servers"
    echo "  seed      - Créer dữ liệu mẫu"
    echo "  test      - Lancer tests"
    echo "  build     - Build production"
    echo "  logs      - Xem logs"
    echo "  clean     - Dọn dẹp project"
    echo "  status    - Vérifier trạng thái"
    echo "  help      - Hiển thị help này"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh setup    # Cài đặt project"
    echo "  ./dev.sh start    # Khởi động servers"
    echo "  ./dev.sh seed     # Créer dữ liệu mẫu"
    echo "  ./dev.sh test     # Lancer tests"
    echo ""
}

# Setup project
setup_project() {
    print_status "Cài đặt project..."
    chmod +x setup.sh
    ./setup.sh
}

# Start servers
start_servers() {
    print_status "Khởi động servers..."
    chmod +x start.sh
    ./start.sh
}

# Stop servers
stop_servers() {
    print_status "Arrêt des serveurs..."
    chmod +x stop.sh
    ./stop.sh
}

# Restart servers
restart_servers() {
    print_status "Redémarrage des serveurs..."
    stop_servers
    sleep 2
    start_servers
}

# Seed data
seed_data() {
    print_status "Création de données de test..."
    chmod +x seed.sh
    ./seed.sh
}

# Run tests
run_tests() {
    print_status "Exécution des tests..."
    
    # Backend tests
    print_status "Exécution des tests backend..."
    cd backend
    npm test
    cd ..
    
    # Frontend tests
    print_status "Exécution des tests frontend..."
    cd frontend
    npm test -- --watchAll=false
    cd ..
    
    print_success "Tous les tests sont terminés"
}

# Build production
build_production() {
    print_status "Build production..."
    
    # Build frontend
    print_status "Build frontend..."
    cd frontend
    npm run build
    cd ..
    
    print_success "Build de production terminé"
    echo "Frontend build: frontend/build/"
}

# Show logs
show_logs() {
    echo "=========================================="
    echo "📝 Logs"
    echo "=========================================="
    echo ""
    
    if [ -f "logs/backend.log" ]; then
        echo "🔧 Backend Logs:"
        echo "----------------------------------------"
        tail -20 logs/backend.log
        echo ""
    else
        print_warning "Journaux backend introuvables"
    fi
    
    if [ -f "logs/frontend.log" ]; then
        echo "🌐 Frontend Logs:"
        echo "----------------------------------------"
        tail -20 logs/frontend.log
        echo ""
    else
        print_warning "Journaux frontend introuvables"
    fi
    
    echo "Pour voir les journaux real-time:"
    echo "  tail -f logs/backend.log"
    echo "  tail -f logs/frontend.log"
}

# Clean project
clean_project() {
    print_status "Nettoyage du projet..."
    
    # Stop servers first
    stop_servers
    
    # Clean node_modules
    print_status "Suppression de node_modules..."
    rm -rf backend/node_modules
    rm -rf frontend/node_modules
    
    # Clean logs
    print_status "Suppression des journaux..."
    rm -rf logs
    
    # Clean build
    print_status "Suppression des fichiers de build..."
    rm -rf frontend/build
    
    # Clean uploads
    print_status "Suppression des uploads..."
    rm -rf backend/uploads/avatars/*
    rm -rf backend/uploads/books/*
    
    print_success "Projet nettoyé"
    echo "Lancer './dev.sh setup' để cài đặt lại"
}

# Check status
check_status() {
    echo "=========================================="
    echo "📊 État du projet"
    echo "=========================================="
    echo ""
    
    # Check if ports are in use
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_success "Frontend en cours d\'exécution sur le port 3000"
    else
        print_warning "Le frontend ne fonctionne pas"
    fi
    
    if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_success "Backend en cours d\'exécution sur le port 5000"
    else
        print_warning "Le backend ne fonctionne pas"
    fi
    
    # Check MongoDB
    if command -v mongosh &> /dev/null; then
        if mongosh --eval "db.runCommand('ping')" --quiet >/dev/null 2>&1; then
            print_success "MongoDB fonctionne"
        else
            print_warning "MongoDB ne fonctionne pas"
        fi
    else
        print_warning "MongoDB không được cài đặt ou introuvable dans PATH"
    fi
    
    # Check dependencies
    if [ -d "backend/node_modules" ]; then
        print_success "Backend dependencies đã cài đặt"
    else
        print_warning "Backend dependencies chưa cài đặt"
    fi
    
    if [ -d "frontend/node_modules" ]; then
        print_success "Dépendances Frontend installées"
    else
        print_warning "Dépendances Frontend non installées"
    fi
    
    echo ""
    echo "📁 Structure du projet:"
    echo "  Backend:  $(ls -la backend/ | wc -l) items"
    echo "  Frontend: $(ls -la frontend/ | wc -l) items"
    echo "  Logs:     $(ls -la logs/ 2>/dev/null | wc -l || echo 0) items"
}

# Main function
main() {
    case ${1:-help} in
        "setup")
            setup_project
            ;;
        "start")
            start_servers
            ;;
        "stop")
            stop_servers
            ;;
        "restart")
            restart_servers
            ;;
        "seed")
            seed_data
            ;;
        "test")
            run_tests
            ;;
        "build")
            build_production
            ;;
        "logs")
            show_logs
            ;;
        "clean")
            clean_project
            ;;
        "status")
            check_status
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function
main "$@"
