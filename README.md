# Quai Antique - Application de Gestion de Restaurant

Application web complète pour le restaurant "Quai Antique" avec gestion des menus, réservations, galerie photos et statistiques.

---

## Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancement de l'application](#lancement-de-lapplication)
- [Accès à l'application](#accès-à-lapplication)
- [Comptes de test](#comptes-de-test)
- [Technologies utilisées](#technologies-utilisées)

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **PHP** >= 8.1
- **Composer** >= 2.0
- **PostgreSQL** >= 14
- **MongoDB** >= 5.0
- **Apache** (XAMPP)
- **Git**

---

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/WebDeveloperDB/RestaurantQuaiAntique
cd RestaurantQuaiAntique
```

### 2. Installer les dépendances Backend (Symfony)

```bash
cd QuaiAntiqueBackend/restaurant_backend
composer install
```

### 3. Créer la base de données PostgreSQL

```bash
php bin/console doctrine:database:create

# Exécuter le fichier SQL fourni via PostgreSQL
psql -U postgres -d restaurant_quai_antique -f ../../database.sql
```

**Alternative** : Importer le fichier `database.sql` via **pgAdmin**

### 4. Vérifier MongoDB

Assurez-vous que MongoDB est démarré :

```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

---

## Configuration

### 1. Fichier `.env.local` (Backend Symfony)

Créer le fichier `QuaiAntiqueBackend/restaurant_backend/.env.local` :

```env
# Database PostgreSQL
DATABASE_URL="postgresql://postgres:mot_de_passe@127.0.0.1:5432/restaurant_quai_antique?serverVersion=15&charset=utf8"

# MongoDB pour les statistiques
MONGODB_URL=mongodb://127.0.0.1:27017
MONGODB_DB=quai_antique_stats


```
Remplacez `_mot_de_passe` par votre mot de passe PostgreSQL

### 2. Vérifier les migrations

```bash
php bin/console doctrine:migrations:migrate
```

---

## Lancement de l'application

### 1. Démarrer le serveur Symfony (Backend)

```bash
cd QuaiAntiqueBackend/restaurant_backend
symfony server:start
```

**ou avec PHP :**

```bash
php -S localhost:8000 -t public
```

**Backend accessible sur : http://localhost:8000**

### 2. Démarrer le serveur Frontend

**Option A - avec PHP :**

```bash
cd QuaiAntiqueFrontend
php -S localhost:3000
```

**Option B - avec Apache (XAMPP) :**

Placer le projet dans `C:\xampp\htdocs\QuaiAntique` et accéder via :

**Frontend accessible sur : http://localhost/QuaiAntique/QuaiAntiqueFrontend/index.html**

---

## Accès à l'application

### Interfaces disponibles

| Interface | URL | Description |

| **Page d'accueil** | http://localhost/QuaiAntique/QuaiAntiqueFrontend/ | Page publique |
| **Carte du restaurant** | http://localhost/QuaiAntique/QuaiAntiqueFrontend/carte | Menus et plats |
| **Galerie photos** | http://localhost/QuaiAntique/QuaiAntiqueFrontend/galerie | Photos du restaurant |
| **Connexion** | http://localhost/QuaiAntique/QuaiAntiqueFrontend/signin | Page de connexion |
| **Inscription** | http://localhost/QuaiAntique/QuaiAntiqueFrontend/signup | Créer un compte client |
| **Dashboard Admin** | http://localhost/QuaiAntique/QuaiAntiqueFrontend/dashboardEmployee | Gestion admin |
| **API Backend** | http://localhost:8000/api | API Symfony |


## Technologies utilisées

### Backend

- **Symfony 7.2** - Framework PHP
- **Doctrine ORM** - Gestion PostgreSQL
- **Doctrine MongoDB ODM** - Statistiques MongoDB

### Frontend

- **JavaScript** - SPA avec routing
- **Bootstrap 5** - Design responsive
- **Fetch API** - Communication avec le backend

### Base de données

- **PostgreSQL 15** - Données relationnelles
- **MongoDB 5.0** - Statistiques de consultation