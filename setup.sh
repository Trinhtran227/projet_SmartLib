#!/bin/bash

# Library Management System - Setup Script
# Installation et configuration automatiques du projet

set -e  # Exit on any error

echo "🚀 Bắt đầu setup Library Management System..."

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

# Check if Node.js is installed
check_node() {
    print_status "Vérification de Node.js..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js non installé. Veuillez installer Node.js 16.x ou une version supérieure."
        echo "Télécharger sur: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js installé: $NODE_VERSION"
}

# Check if MongoDB is installed
check_mongodb() {
    print_status "Vérification de MongoDB..."
    if ! command -v mongod &> /dev/null; then
        print_warning "MongoDB non installé ou introuvable dans PATH."
        echo "Veuillez installer MongoDB :"
        echo "- Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/"
        echo "- macOS: brew install mongodb-community"
        echo "- Linux: https://docs.mongodb.com/manual/administration/install-on-linux/"
        read -p "Voulez-vous continuer? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "MongoDB installé"
    fi
}

# Install backend dependencies
setup_backend() {
    print_status "Installation des dépendances Backend..."
    cd backend
    
    if [ ! -f "package.json" ]; then
        print_error "package.json introuvable dans le dossier backend"
        exit 1
    fi
    
    npm install
    print_success "Dépendances backend installées"
    
    # Setup environment file
    if [ ! -f ".env" ]; then
        print_status "Création du fichier .env à partir de env.example..."
        cp env.example .env
        print_success "Fichier .env créé"
        print_warning "Veuillez vérifier et mettre à jour les informations trong file .env"
    else
        print_success "Le fichier .env existe"
    fi
    
    cd ..
}

# Install frontend dependencies
setup_frontend() {
    print_status "Installation des dépendances Frontend..."
    cd frontend
    
    if [ ! -f "package.json" ]; then
        print_error "package.json introuvable dans le dossier frontend"
        exit 1
    fi
    
    npm install
    print_success "Frontend dependencies installé"
    
    cd ..
}

# Create uploads directories
create_uploads_dirs() {
    print_status "Création du dossier uploads..."
    mkdir -p backend/uploads/avatars
    mkdir -p backend/uploads/books
    print_success "Dossier uploads créé"
}

# Main setup function
main() {
    echo "=========================================="
    echo "📚 Library Management System Setup"
    echo "=========================================="
    
    # Check prerequisites
    check_node
    check_mongodb
    
    # Setup backend
    setup_backend
    
    # Setup frontend
    setup_frontend
    
    # Create uploads directories
    create_uploads_dirs
    
    echo ""
    echo "=========================================="
    print_success "Configuration terminée !"
    echo "=========================================="
    echo ""
    echo "📋 Prochaines étapes:"
    echo "1. Démarrer MongoDB:"
    echo "   - Windows: net start MongoDB"
    echo "   - macOS: brew services start mongodb-community"
    echo "   - Linux: sudo systemctl start mongod"
    echo ""
    echo "2. Lancer le projet:"
    echo "   ./start.sh"
    echo ""
    echo "3. Ou lancer manuellement:"
    echo "   Backend: cd backend && npm run dev"
    echo "   Frontend: cd frontend && npm start"
    echo ""
    echo "4. Seed des données modèles (optionnel):"
    echo "   cd backend && npm run seed"
    echo ""
    print_success "Bon codage! 🎉"
}

# Run main function
main
