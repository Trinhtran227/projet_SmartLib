#!/bin/bash

# Library Management System - Start Script
# Démarrage du backend et du frontend

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

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    print_warning "Port $port en cours d\'utilisation. Arrêt du processus en cours..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Check MongoDB connection
check_mongodb() {
    print_status "Vérification de la connexion MongoDB..."
    
    # Try to connect to MongoDB
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
    
    print_warning "Impossible de se connecter à MongoDB"
    echo "Veuillez vous assurer que MongoDB fonctionne:"
    echo "- Windows: net start MongoDB"
    echo "- macOS: brew services start mongodb-community"
    echo "- Linux: sudo systemctl start mongod"
    echo ""
    read -p "Voulez-vous continuer? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

# Start backend
start_backend() {
    print_status "Démarrage du serveur Backend..."
    
    # Check if backend port is in use
    if check_port 5000; then
        kill_port 5000
    fi
    
    cd backend
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_warning "Fichier .env introuvable. Création à partir de env.example..."
        cp env.example .env
    fi
    
    # Start backend in background
    npm run dev > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    
    # Wait a moment for backend to start
    sleep 3
    
    # Check if backend started successfully
    if check_port 5000; then
        print_success "Backend en cours d\'exécution sur http://localhost:5000"
    else
        print_error "Échec du démarrage du backend. Vérifier les journaux/backend.log"
        exit 1
    fi
    
    cd ..
}

# Start frontend
start_frontend() {
    print_status "Démarrage du serveur Frontend..."
    
    # Check if frontend port is in use
    if check_port 3000; then
        kill_port 3000
    fi
    
    cd frontend
    
    # Start frontend in background
    npm start > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/frontend.pid
    
    # Wait a moment for frontend to start
    sleep 5
    
    # Check if frontend started successfully
    if check_port 3000; then
        print_success "Frontend en cours d\'exécution sur http://localhost:3000"
    else
        print_error "Échec du démarrage du frontend. Vérifier les journaux/frontend.log"
        exit 1
    fi
    
    cd ..
}

# Create logs directory
create_logs_dir() {
    mkdir -p logs
}

# Cleanup function
cleanup() {
    print_status "Arrêt en cours de servers..."
    
    # Kill backend
    if [ -f "logs/backend.pid" ]; then
        BACKEND_PID=$(cat logs/backend.pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm -f logs/backend.pid
    fi
    
    # Kill frontend
    if [ -f "logs/frontend.pid" ]; then
        FRONTEND_PID=$(cat logs/frontend.pid)
        kill $FRONTEND_PID 2>/dev/null || true
        rm -f logs/frontend.pid
    fi
    
    # Kill any remaining processes on ports
    kill_port 5000
    kill_port 3000
    
    print_success "Đã dừng tất cả servers"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main function
main() {
    echo "=========================================="
    echo "🚀 Library Management System"
    echo "=========================================="
    
    # Create logs directory
    create_logs_dir
    
    # Check MongoDB
    check_mongodb
    
    # Start backend
    start_backend
    
    # Start frontend
    start_frontend
    
    echo ""
    echo "=========================================="
    print_success "Tous les serveurs ont démarré!"
    echo "=========================================="
    echo ""
    echo "🌐 URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:5000"
    echo "   API Health: http://localhost:5000/api/health"
    echo ""
    echo "📋 Comptes de test:"
    echo "   Admin: admin@library.com / admin123"
    echo "   Bibliothécaire: librarian@library.com / librarian123"
    echo "   Étudiant: student1@university.edu / student123"
    echo ""
    echo "📊 Seed des données modèles:"
    echo "   cd backend && npm run seed"
    echo ""
    echo "📝 Logs:"
    echo "   Backend:  logs/backend.log"
    echo "   Frontend: logs/frontend.log"
    echo ""
    echo "🛑 Appuyez sur Ctrl+C pour arrêter tous les serveurs"
    echo ""
    
    # Keep script running
    while true; do
        sleep 1
    done
}

# Run main function
main
