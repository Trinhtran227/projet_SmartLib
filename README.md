

```markdown
# Système de Gestion de Bibliothèque

Le système de gestion de bibliothèque est construit avec React (Frontend) et Node.js/Express (Backend), en utilisant MongoDB comme base de données.

## 📋 Prérequis Système

### Logiciels Nécessaires
- **Node.js** : version 16.x ou supérieure
- **MongoDB** : version 4.4 ou supérieure
- **npm** ou **yarn** : pour gérer les dépendances

### Vérification des Versions
```bash
node --version
npm --version
mongod --version
```

## 🚀 Guide d'Installation et d'Exécution du Projet

### Méthode 1 : Utilisation des Scripts Automatiques (Recommandé)

#### 🪟 Windows (Command Prompt/PowerShell)

**Configuration automatique :**
```cmd
git clone <repository-url>
cd QuanLyThuVien
setup.bat
```

**Démarrer le projet :**
```cmd
start.bat
```

**Créer des données factices (Seed) :**
```cmd
seed.bat
```

**Arrêter le projet :**
```cmd
stop.bat
```

**Script complet :**
```cmd
dev.bat help    # Voir toutes les commandes
dev.bat setup   # Installer le projet
dev.bat start   # Démarrer les serveurs
dev.bat seed    # Créer des données factices
dev.bat test    # Lancer les tests
dev.bat status  # Vérifier l'état
```

#### 🐧 Linux/macOS (Bash)

**Configuration automatique :**
```bash
git clone <repository-url>
cd QuanLyThuVien
./setup.sh
```

**Démarrer le projet :**
```bash
./start.sh
```

**Créer des données factices :**
```bash
./seed.sh
```

**Arrêter le projet :**
```bash
./stop.sh
```

**Script complet :**
```bash
./dev.sh help    # Voir toutes les commandes
./dev.sh setup   # Installer le projet
./dev.sh start   # Démarrer les serveurs
./dev.sh seed    # Créer des données factices
./dev.sh test    # Lancer les tests
./dev.sh status  # Vérifier l'état
```

### Méthode 2 : Manuelle

### Étape 1 : Cloner le Dépôt
```bash
git clone <repository-url>
cd QuanLyThuVien
```

### Étape 2 : Installer le Backend

1. **Se déplacer dans le dossier backend :**
```bash
cd backend
```

2. **Installer les dépendances :**
```bash
npm install
```

3. **Configurer les variables d'environnement :**
```bash
# Copier le fichier env.example en .env
cp env.example .env
```

4. **Modifier le fichier .env avec les informations suivantes :**
```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/library_management
DB_NAME=library_management

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_REFRESH_EXPIRE=30d

# Serveur
PORT=5000
NODE_ENV=development

# Upload de Fichier
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Étape 3 : Installer le Frontend

1. **Se déplacer dans le dossier frontend :**
```bash
cd ../frontend
```

2. **Installer les dépendances :**
```bash
npm install
```

### Étape 4 : Démarrer MongoDB

**Sur Windows :**
```bash
# Démarrer le service MongoDB
net start MongoDB
```

**Sur macOS :**
```bash
# Utiliser Homebrew
brew services start mongodb-community
```

**Sur Linux :**
```bash
# Démarrer le service MongoDB
sudo systemctl start mongod
```

### Étape 5 : Lancer le Projet

#### Démarrer le Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Le Backend s'exécutera sur : `http://localhost:5000`

#### Démarrer le Frontend (Terminal 2)
```bash
cd frontend
npm start
```
Le Frontend s'exécutera sur : `http://localhost:3000`

### Étape 6 : Seed de Données (Optionnel)

Pour avoir des données factices pour tester, exécutez la commande suivante dans le dossier backend :

```bash
cd backend
npm run seed
```

#### 📊 Scripts de Seeding Disponibles

Le dossier `backend/scripts/` contient des scripts de seeding avec des données factices riches :

**Scripts principaux :**
- `seed.js` - Script de seeding principal avec des données complètes
- `seed-optimized.js` - Version optimisée

**Scripts supplémentaires :**
- `seedLoanData.js` - Créer des données de fiches d'emprunt factices
- `seedNotifications.js` - Créer des notifications factices
- `seedReviews.js` - Créer des avis de livres factices
- `testNotifications.js` - Tester le système de notification
- `testNewBookNotification.js` - Tester la notification de nouveau livre

**Les données factices incluent :**
- ✅ **28 livres** avec de vraies couvertures d'Amazon
- ✅ **12 catégories** de livres diverses
- ✅ **12 éditeurs** nationaux et internationaux
- ✅ **12 facultés** et **14 départements**
- ✅ **5 utilisateurs factices** avec des rôles différents
- ✅ **3 fiches d'emprunt factices** avec différents statuts
- ✅ **Politique d'amende** par défaut

**Comptes par défaut pour tester :**

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@library.com | admin123 |
| Bibliothécaire | librarian@library.com | librarian123 |
| Étudiant 1 | student1@university.edu | student123 |
| Étudiant 2 | student2@university.edu | student123 |
| Étudiant 3 | student3@university.edu | student123 |

## 🛠️ Scripts Disponibles

### Scripts Backend
- `npm start` : Démarrer le serveur en production
- `npm run dev` : Démarrer le serveur de développement avec nodemon
- `npm run seed` : Créer des données factices
- `npm test` : Lancer les tests

### Scripts de Seeding Supplémentaires
```bash
# Exécuter le script de seeding principal
node scripts/seed.js

# Exécuter la version optimisée
node scripts/seed-optimized.js

# Créer des données de fiches d'emprunt
node scripts/seedLoanData.js

# Créer des notifications factices
node scripts/seedNotifications.js

# Créer des avis de livres factices
node scripts/seedReviews.js

# Tester le système de notification
node scripts/testNotifications.js

# Tester la notification de nouveau livre
node scripts/testNewBookNotification.js
```

### Scripts Frontend
- `npm start` : Démarrer le serveur de développement
- `npm run build` : Build pour la production
- `npm test` : Lancer les tests
- `npm run eject` : Éjecter de Create React App

## 📁 Structure du Projet

```
QuanLyThuVien/
├── backend/                 # API Backend
│   ├── models/             # Modèles de base de données
│   ├── routes/             # Routes de l'API
│   ├── middleware/         # Middlewares personnalisés
│   ├── utils/              # Fonctions utilitaires
│   ├── scripts/            # Scripts de seeding pour la base de données
│   │   ├── seed.js         # Script de seeding principal
│   │   ├── seed-optimized.js # Version optimisée
│   │   ├── seedLoanData.js # Créer des fiches d'emprunt factices
│   │   ├── seedNotifications.js # Créer des notifications factices
│   │   ├── seedReviews.js  # Créer des avis factices
│   │   ├── testNotifications.js # Tester les notifications
│   │   └── README.md       # Guide des scripts
│   ├── tests/              # Fichiers de test
│   └── uploads/            # Fichiers uploadés
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── pages/         # Composants de page
│   │   ├── contexts/      # Contextes React
│   │   ├── lib/           # Utilitaires d'API
│   │   └── types/         # Types TypeScript
│   └── public/            # Fichiers statiques
└── README.md
```

## 🔧 Configuration Supplémentaire

### MongoDB Atlas (Base de Données Cloud)
Si vous souhaitez utiliser MongoDB Atlas au lieu d'un MongoDB local :

1. Créer un cluster sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Récupérer la chaîne de connexion (connection string)
3. Mettre à jour `MONGODB_URI` dans le fichier `.env`

### Variables d'Environnement
Variables d'environnement importantes :

- `MONGODB_URI` : Chemin de connexion MongoDB
- `JWT_SECRET` : Clé secrète pour les tokens JWT
- `PORT` : Port pour le serveur backend (par défaut : 5000)
- `CORS_ORIGIN` : URL frontend autorisée à y accéder

## 🐛 Dépannage

### Erreurs Courantes

1. **Erreur de connexion MongoDB :**
   - Vérifier si MongoDB est en cours d'exécution
   - Vérifier la chaîne de connexion dans .env

2. **Port déjà utilisé (Port already in use) :**
   - Changer le PORT dans .env
   - Ou tuer le processus utilisant le port

3. **Erreur CORS :**
   - Vérifier CORS_ORIGIN dans .env
   - S'assurer que le frontend et le backend s'exécutent sur les bons ports

4. **Module introuvable (Module not found) :**
   - Exécuter à nouveau `npm install`
   - Supprimer node_modules et réinstaller

### Logs et Débogage

**Logs Backend :**
```bash
cd backend
npm run dev
```

**Logs Frontend :**
```bash
cd frontend
npm start
```

## 📚 Documentation de l'API

L'API Backend est documentée dans la collection Postman :
- Fichier : `backend/postman/Library_Management_API.postman_collection.json`

## 🧪 Tests

### Lancer les Tests Backend
```bash
cd backend
npm test
```

### Lancer les Tests Frontend
```bash
cd frontend
npm test
```

## 🚀 Déploiement en Production

### Build du Frontend
```bash
cd frontend
npm run build
```

### Démarrer en Production
```bash
cd backend
NODE_ENV=production npm start
```

## 📞 Support

Si vous rencontrez des problèmes, veuillez :
1. Vérifier les logs dans le terminal
2. Vous assurer que toutes les dépendances ont été installées
3. Vérifier la connexion MongoDB
4. Consulter la section de dépannage ci-dessus

## 🛠️ Scripts Automatiques

Le projet inclut des scripts `.sh` pour automatiser la configuration et la gestion :

### 📋 Liste des Scripts

#### 🪟 Scripts Windows (.bat)

| Script | Description | Utilisation |
|--------|-------------|-------------|
| `setup.bat` | Installer le projet de zéro | `setup.bat` |
| `start.bat` | Démarrer le backend et le frontend | `start.bat` |
| `stop.bat` | Arrêter tous les serveurs | `stop.bat` |
| `seed.bat` | Créer des données factices | `seed.bat` |
| `dev.bat` | Script principal pour le développement | `dev.bat help` |

#### 🐧 Scripts Linux/macOS (.sh)

| Script | Description | Utilisation |
|--------|-------------|-------------|
| `setup.sh` | Installer le projet de zéro | `./setup.sh` |
| `start.sh` | Démarrer le backend et le frontend | `./start.sh` |
| `stop.sh` | Arrêter tous les serveurs | `./stop.sh` |
| `seed.sh` | Créer des données factices | `./seed.sh` |
| `dev.sh` | Script principal pour le développement | `./dev.sh help` |

### 🚀 Détails des Scripts

#### `setup.sh` - Installation Automatique
```bash
./setup.sh
```
**Fonctionnalités :**
- Vérifier Node.js et MongoDB
- Installer les dépendances pour le backend et le frontend
- Créer le fichier .env à partir de env.example
- Créer le dossier uploads
- Afficher les instructions suivantes

#### `start.sh` - Démarrer les Serveurs
```bash
./start.sh
```
**Fonctionnalités :**
- Vérifier la connexion MongoDB
- Démarrer le backend sur le port 5000
- Démarrer le frontend sur le port 3000
- Créer des logs et gérer les PIDs
- Afficher les URLs et les comptes de test

#### `stop.sh` - Arrêter les Serveurs
```bash
./stop.sh
```
**Fonctionnalités :**
- Arrêter les serveurs backend et frontend
- Nettoyer les processus et les PIDs
- Afficher les instructions de redémarrage

#### `seed.sh` - Créer des Données Factices
```bash
./seed.sh                    # Mode interactif
./seed.sh seed              # Exécuter seed.js
./seed.sh optimized         # Exécuter seed-optimized.js
./seed.sh loans            # Exécuter seedLoanData.js
./seed.sh notifications    # Exécuter seedNotifications.js
./seed.sh reviews          # Exécuter seedReviews.js
./seed.sh all              # Exécuter tous les scripts
```
**Fonctionnalités :**
- Vérifier la connexion MongoDB
- Exécuter les scripts de seeding
- Afficher les comptes de test et les données créées

#### `dev.sh` - Outils de Développement
```bash
./dev.sh help      # Afficher l'aide
./dev.sh setup     # Installer le projet
./dev.sh start     # Démarrer les serveurs
./dev.sh stop      # Arrêter les serveurs
./dev.sh restart   # Redémarrer
./dev.sh seed      # Créer des données factices
./dev.sh test      # Lancer les tests
./dev.sh build     # Build pour la production
./dev.sh logs      # Voir les logs
./dev.sh clean     # Nettoyer le projet
./dev.sh status    # Vérifier l'état
```

### 📝 Logs et Surveillance

**Voir les logs en temps réel :**
```bash
tail -f logs/backend.log    # Logs Backend
tail -f logs/frontend.log   # Logs Frontend
```

**Vérifier l'état :**
```bash
./dev.sh status
```

**URLs importantes :**
- Frontend : http://localhost:3000
- Backend : http://localhost:5000
- API Health : http://localhost:5000/api/health

### 🔧 Dépannage des Scripts

#### 🪟 Windows

**Si le script ne s'exécute pas :**
```cmd
dev.bat clean             # Nettoyer et réinstaller
dev.bat status            # Vérifier l'état
```

**Si le port est occupé :**
```cmd
stop.bat                  # Arrêter tous les serveurs
netstat -ano | findstr ":3000"  # Trouver le processus sur le port 3000
netstat -ano | findstr ":5000"  # Trouver le processus sur le port 5000
taskkill /PID <PID> /F    # Forcer l'arrêt du processus
```

**Si MongoDB ne s'exécute pas :**
```cmd
net start MongoDB         # Démarrer le service MongoDB
```

#### 🐧 Linux/macOS

**Si le script ne s'exécute pas :**
```bash
chmod +x *.sh              # Accorder les droits d'exécution
./dev.sh clean             # Nettoyer et réinstaller
./dev.sh status            # Vérifier l'état
```

**Si le port est occupé :**
```bash
./stop.sh                  # Arrêter tous les serveurs
lsof -ti:3000 | xargs kill -9  # Forcer l'arrêt du port 3000
lsof -ti:5000 | xargs kill -9  # Forcer l'arrêt du port 5000
```

**Si MongoDB ne s'exécute pas :**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

---

**Note :** Assurez-vous que MongoDB est en cours d'exécution avant de démarrer le serveur backend.
```
