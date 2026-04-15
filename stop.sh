#!/bin/bash

# Library Management System - Stop Script
# Arrêt de tous les serveurs

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
    local service_name=$2
    
    if check_port $port; then
        print_status "Arrêt en cours de $service_name sur le port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
        
        if check_port $port; then
            print_warning "Không thể dừng $service_name sur le port $port"
        else
            print_success "$service_name arrêté"
        fi
    else
        print_status "$service_name ne fonctionne pas sur le port $port"
    fi
}

# Function to kill process by PID file
kill_by_pid() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            print_status "Arrêt en cours de $service_name (PID: $pid)..."
            kill $pid 2>/dev/null || true
            sleep 2
            
            if ps -p $pid > /dev/null 2>&1; then
                print_warning "Force killing $service_name (PID: $pid)..."
                kill -9 $pid 2>/dev/null || true
            fi
            
            print_success "$service_name arrêté"
        else
            print_status "$service_name không chạy (PID: $pid)"
        fi
        rm -f "$pid_file"
    else
        print_status "Không tìm thấy PID file cho $service_name"
    fi
}

# Main stop function
main() {
    echo "=========================================="
    echo "🛑 Arrêt du système de gestion de la bibliothèque"
    echo "=========================================="
    
    # Kill by PID files first
    kill_by_pid "logs/backend.pid" "Backend"
    kill_by_pid "logs/frontend.pid" "Frontend"
    
    # Kill by ports as backup
    kill_port 5000 "Backend"
    kill_port 3000 "Frontend"
    
    # Clean up any remaining Node.js processes
    print_status "Nettoyage des processus Node.js restants..."
    pkill -f "node.*server.js" 2>/dev/null || true
    pkill -f "react-scripts start" 2>/dev/null || true
    pkill -f "nodemon" 2>/dev/null || true
    
    # Clean up log files
    if [ -d "logs" ]; then
        print_status "Nettoyage des fichiers journaux..."
        rm -f logs/*.pid
        print_success "Log files nettoyés"
    fi
    
    echo ""
    echo "=========================================="
    print_success "Tous les serveurs arrêté!"
    echo "=========================================="
    echo ""
    echo "📝 Pour voir les journaux:"
    echo "   Backend:  cat logs/backend.log"
    echo "   Frontend: cat logs/frontend.log"
    echo ""
    echo "🚀 Pour redémarrer:"
    echo "   ./start.sh"
    echo ""
}

# Run main function
main
