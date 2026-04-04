# 🚀 Guide de Déploiement sur Railway.app

Guide complet pour déployer l'application **Quai Antique** sur Railway.app avec PostgreSQL et MongoDB.

---

## 📋 Prérequis avant de commencer

✅ Compte GitHub avec le projet poussé  
✅ Tous les commits sont sur GitHub (branch `develop` ou `main`)  
✅ Fichiers `README.md` et `database.sql` présents dans le repo  

---

## 🎯 Étape 1 : Créer un compte Railway

1. **Aller sur** : https://railway.app
2. **Cliquer sur** : "Start a New Project" ou "Login"
3. **Se connecter avec GitHub** : Cliquer sur "Login with GitHub"
4. **Autoriser Railway** : Accepter les permissions demandées

✅ **Tu es maintenant connecté à Railway !**

---

## 🗄️ Étape 2 : Créer un nouveau projet

1. Dans le dashboard Railway, cliquer sur **"New Project"**
2. Sélectionner **"Deploy from GitHub repo"**
3. **Choisir ton repository** : `RestaurantQuaiAntique`
4. **Sélectionner la branche** : `develop` (ou `main` si tu as tout mergé)

⏳ Railway va détecter automatiquement que c'est un projet PHP/Symfony

### ⚠️ Important (structure monorepo)

Ton backend Symfony n'est **pas** à la racine du repo, il est dans :
`QuaiAntiqueBackend/restaurant_backend`

Dans Railway, ouvre ton service Backend puis :
1. **Settings**
2. **Source**
3. **Root Directory** = `QuaiAntiqueBackend/restaurant_backend`
4. Sauvegarder puis **Redeploy**

✅ Cette étape évite l'erreur Railpack du type :
`Script start.sh not found` / `could not determine how to build the app`

---

## 🐘 Étape 3 : Ajouter PostgreSQL

📍 **Où cliquer exactement ?**

- Depuis le **Dashboard Railway** (comme ton screenshot 2), clique d'abord sur la carte du projet : `adorable-eagerness`
- Une fois **dans le projet** (vue Architecture), clique sur **"+ New"**

⚠️ Le bouton **"+ New" du dashboard** sert surtout à créer un **nouveau projet**.
Pour ajouter PostgreSQL à ton projet actuel, il faut utiliser **"+ New" à l'intérieur du projet**.

1. Dans ton projet Railway (vue Architecture), cliquer sur **"+ New"**
2. Sélectionner **"Database"**
3. Choisir **"Add PostgreSQL"**

✅ Railway crée automatiquement une base de données PostgreSQL !

### 📝 Noter les variables d'environnement PostgreSQL

Railway génère automatiquement ces variables (côté service PostgreSQL) :
- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `DATABASE_URL` (URL complète)

Ensuite, dans le service **Backend**, ajoute une **Reference Variable** vers la variable `DATABASE_URL`
du service PostgreSQL (ou vérifie qu'elle existe déjà).

---

## 🍃 Étape 4 : Ajouter MongoDB

1. Dans ton projet Railway (vue Architecture), cliquer sur **"+ New"**
2. Sélectionner **"Database"**
3. Choisir **"Add MongoDB"**

✅ Railway crée automatiquement une instance MongoDB !

### 📝 Variables MongoDB générées

Railway crée automatiquement :
- `MONGOHOST`
- `MONGOPORT`
- `MONGOUSER`
- `MONGOPASSWORD`
- `MONGO_URL` (URL complète)

Puis, dans le service **Backend**, ajoute une **Reference Variable** vers `MONGO_URL`.

### ✅ Règle simple (très important)

- `MONGO_URL` = variable fournie par le service MongoDB
- `MONGODB_URL` = variable que ton backend Symfony lit

Donc dans le Backend :
1. Crée `MONGODB_URL`
2. Fais-la pointer en **Reference** vers `MongoDB -> MONGO_URL`
3. Ne crée pas de variable Backend nommée `MongoDB`

---

## ⚙️ Étape 5 : Configurer les variables d'environnement Symfony

1. **Cliquer sur ton service Backend** (le déploiement depuis GitHub)
2. Aller dans l'onglet **"Variables"**
3. **Ajouter les variables dans cet ordre (mode débutant)** :

### 5.1 Ajouter les variables de type Reference

1. Variable Name : `DATABASE_URL`
2. Cliquer sur **Add Reference**
3. Choisir : `Postgres -> DATABASE_URL`
4. Cliquer sur **Add**

1. Variable Name : `MONGODB_URL`
2. Cliquer sur **Add Reference**
3. Choisir : `MongoDB -> MONGO_URL`
4. Cliquer sur **Add**

### 5.2 Ajouter les variables manuelles

1. `APP_ENV` = `prod`
2. `APP_SECRET` = ton secret généré
3. `MONGODB_DATABASE` = `quai_antique_stats`
4. `APP_DEBUG` = `0` (optionnel mais recommandé)
5. `CORS_ALLOW_ORIGIN` = URL de ton frontend (optionnel pour ce projet, car CORS est déjà permissif dans la config actuelle)

### 5.3 Nettoyage important

- Garder **une seule** variable `APP_ENV`
- Si tu as `MONGO_URL` dans le Backend, tu peux la supprimer
- Garder `MONGODB_URL` (c'est ce nom que Symfony lit)
- Si tu as une variable nommée `MongoDB` dans le Backend, supprime-la (mauvais nom)

### 5.4 Appliquer les changements

Quand Railway affiche **Apply X changes** en haut à gauche :
1. Cliquer sur **Deploy**
2. Attendre le nouveau déploiement

### ✅ État final attendu (Backend)

- `DATABASE_URL` (Reference vers Postgres)
- `MONGODB_URL` (Reference vers MongoDB)
- `MONGODB_DATABASE=quai_antique_stats`
- `APP_ENV=prod`
- `APP_SECRET=...`
- `APP_DEBUG=0` (optionnel)
- `CORS_ALLOW_ORIGIN=...` (optionnel)

### 🔐 Générer APP_SECRET

Dans ton terminal local :
```bash
php -r "echo bin2hex(random_bytes(16));"
```
Copie le résultat et colle-le comme valeur de `APP_SECRET`

---

## 📦 Étape 6 : Build Backend (Dockerfile)

Le backend utilise maintenant un **Dockerfile** dans :
`QuaiAntiqueBackend/restaurant_backend/Dockerfile`

📍 **Où trouver ce Dockerfile ?**

- **En local (VS Code)** : Explorateur de fichiers > `QuaiAntiqueBackend` > `restaurant_backend` > `Dockerfile`
- **Sur GitHub** : ouvrir le repo > dossier `QuaiAntiqueBackend/restaurant_backend` > fichier `Dockerfile`

✅ Avec ce mode, **pas besoin de Procfile**.

Le Dockerfile installe les extensions PHP nécessaires, dont MongoDB (`ext-mongodb`).

---

## 🔧 Étape 7 : Configurer Railway pour le Dockerfile

📍 **Où cliquer exactement dans Railway ?**

1. Ouvrir le projet `adorable-eagerness`
2. Cliquer sur le service Backend `RestaurantQuaiAntique`
3. Onglet **Settings**
4. Section **Source**
5. **Root Directory** : `QuaiAntiqueBackend/restaurant_backend`
6. Vérifier que Railway détecte le `Dockerfile`
7. Dans **Build** : laisser vide (pas de Build Command Railpack)
8. Dans **Start** : laisser vide (la commande vient du Dockerfile)
9. **Redeploy**

### 🔒 Important : garder PostgreSQL et MongoDB

Le Dockerfile remplace seulement la façon de construire/lancer l'app.
Il **ne remplace pas** les services de base de données Railway.

Donc l'étape **Ajouter PostgreSQL** reste obligatoire, même avec Docker.

---

## 🗃️ Étape 8 : Importer les données SQL

⚠️ **Optionnel** : si ton application crée déjà le schéma par migrations/seed, l'import de `database.sql` n'est pas obligatoire.

Cas recommandés :
- **Tu veux les données de démonstration exactes** : importe `database.sql`
- **Tu veux seulement démarrer l'app** : lance les migrations Symfony, sans import SQL

👉 **Ton cas (tables déjà créées via migrations Symfony)** : utilise **Option C**.

### Option C - Sans import SQL (migrations Symfony) — Recommandé si tu utilises Doctrine Migrations

Dans un shell du backend ou en local avec la même `DATABASE_URL` :

```bash
php bin/console doctrine:migrations:migrate --no-interaction
```

Si les migrations sont déjà exécutées, Symfony affichera qu'il n'y a rien à migrer.

📍 **Où cliquer pour récupérer la bonne URL en local ?**

1. Service **Postgres** > onglet **Database**
2. Cliquer sur **Connect**
3. Aller dans l'onglet **Public Network** (pas Private Network)
4. Copier l'URL PostgreSQL publique

⚠️ Important :
- En local, l'URL privée `*.railway.internal` ne fonctionne pas.
- Utilise l'URL du **Public Network** pour lancer la migration depuis ton PC.

Exemple PowerShell :

```powershell
$env:DATABASE_URL="COLLER_ICI_L_URL_PUBLIC_POSTGRES"
Set-Location C:\xampp\htdocs\QuaiAntique\QuaiAntiqueBackend\restaurant_backend
php bin/console doctrine:migrations:migrate --no-interaction
```

✅ Après la commande, quoi faire ?

1. Retourner dans Railway > Postgres > **Database** > **Data**
2. Vérifier que les tables sont apparues
3. Aller sur le service Backend > **Deployments** et vérifier qu'il est vert
4. Générer le domaine public du backend : **Settings** > **Networking** > **Generate Domain**

### Option A - Via Railway Dashboard (import manuel)

1. Dans Railway, cliquer sur ton service **PostgreSQL**
2. Aller dans l'onglet **"Data"**
3. Cliquer sur **"Connect"** pour obtenir les infos de connexion
4. **Utiliser un client PostgreSQL** (DBeaver, pgAdmin, ou TablePlus)

**Connexion** :
- Host: `[copier depuis Railway]`
- Port: `[copier depuis Railway]`
- Database: `[copier depuis Railway]`
- User: `[copier depuis Railway]`
- Password: `[copier depuis Railway]`

5. **Exécuter ton fichier `database.sql`** (si tu veux réutiliser les données de démo)

### Option B - Via CLI (Alternative)

```bash
# Dans Railway, copier la DATABASE_URL
# Puis dans ton terminal local :
psql "postgresql://user:password@host:port/database" -f database.sql
```

---

## 🌐 Étape 9 : Obtenir l'URL de ton application

1. Dans Railway, cliquer sur ton service Backend
2. Aller dans **"Settings"**
3. Section **"Networking"**
4. Cliquer sur **"Generate Domain"**

✅ **Railway génère une URL publique** : `https://ton-app.up.railway.app`

---

## 🎨 Étape 10 : Déployer le Frontend

### Option A - Sur Railway (même projet)

1. Cliquer sur **"+ New"** dans ton projet
2. Sélectionner **"Empty Service"**
3. Nommer le service "Frontend"
4. Ouvrir le service **Frontend** créé
5. Onglet **Settings** > section **Source**
6. Cliquer sur **Connect Repo** et choisir le même repo GitHub
7. Dans **Root Directory**, saisir exactement : `QuaiAntiqueFrontend`
8. Toujours dans **Settings**, section **Deploy/Start Command** :
   `npx --yes serve -s . -l $PORT`
9. Cliquer sur **Deploy** / **Redeploy**

⚠️ Si tu vois l'erreur `python: command not found`, c'est normal :
le runtime Railway de ce service n'a pas Python.
Utilise la commande `npx --yes serve -s . -l $PORT`.

📍 Si tu ne vois pas `QuaiAntiqueFrontend`, c'est généralement parce que le repo n'est pas encore connecté au service Frontend.

### Option A.1 - Si Railway Frontend te bloque

Tu peux déployer le frontend sur **Netlify** ou **Vercel** (plus simple pour du statique),
et garder le backend sur Railway.
Les deux services fonctionnent très bien ensemble via HTTPS (il faudra seulement mettre la bonne URL API dans le frontend).

### Option B - Via Netlify (Plus simple pour du HTML statique)

1. Aller sur https://netlify.com
2. **Drag & Drop** ton dossier `QuaiAntiqueFrontend`
3. Netlify génère une URL : `https://ton-site.netlify.app`

### Option C - Via Vercel

1. Aller sur https://vercel.com
2. Importer depuis GitHub
3. Sélectionner le dossier `QuaiAntiqueFrontend`
4. Déployer

---

## 🔗 Étape 11 : Connecter Frontend et Backend

### Dans ton Frontend (fichiers JS)

Remplacer toutes les occurrences de `http://localhost:8000/api` par ton URL Railway :

**Fichiers à modifier** :
- `js/auth/signin.js`
- `js/auth/signup.js`
- `js/auth/account.js`
- `js/carte.js`
- `js/galerie/galerie.js`
- `js/employee/*.js`
- `js/reservation/reserver.js`

**Exemple** :
```javascript
// Avant
const apiBaseUrl = 'http://localhost:8000/api';

// Après
const apiBaseUrl = 'https://ton-backend.up.railway.app/api';
```

**Committer et pusher les changements**

---

## 🔐 Étape 12 : Configurer CORS sur le Backend

Dans Railway, **Variables d'environnement** du Backend, modifier :

```env
CORS_ALLOW_ORIGIN=https://ton-frontend.netlify.app
```

Remplacer par l'URL réelle de ton frontend déployé.

---

## 🧪 Étape 13 : Tester l'application déployée

1. **Ouvrir l'URL frontend** : `https://ton-frontend.netlify.app`
2. **Tester la connexion** avec les comptes de test :
   - Admin : `admin@quaiantique.fr` / `Admin123!`
   - Employé : `employe@quaiantique.fr` / `Employe123!`
   - Client : `client@test.fr` / `Client123!`

3. **Vérifier** :
   - ✅ Connexion fonctionne
   - ✅ Affichage de la carte (menus/plats)
   - ✅ Galerie photos
   - ✅ Réservations
   - ✅ Dashboard admin

---

## 📹 Étape 14 : Filmer le déploiement (pour ta formation)

### Ce qu'il faut montrer dans la vidéo :

1. **GitHub** : Montrer que tout le code est sur GitHub
2. **Railway Dashboard** : Montrer les 3 services (Backend, PostgreSQL, MongoDB)
3. **Variables d'environnement** : Montrer la configuration (sans révéler les mots de passe)
4. **Logs du déploiement** : Montrer que le build a réussi
5. **URL publique** : Ouvrir l'application dans le navigateur
6. **Test des fonctionnalités** :
   - Connexion admin
   - Voir la carte
   - Créer un plat
   - Faire une réservation
   - Voir les statistiques

### Durée recommandée : 5-10 minutes

---

## 🐛 Dépannage

### Correctifs réutilisables pour un autre projet (mêmes symptômes)

Si tu déploies un autre projet et que tu retrouves les mêmes erreurs (page vide, login 404, réservations bloquées), applique cette checklist.

1. Frontend SPA: routes qui chargent mal en production
- Symptôme: la page charge le header/footer mais le contenu principal reste vide.
- Cause fréquente: le serveur statique réécrit les chemins de fragments HTML (`/pages/*.html`) vers la shell (`index.html`).
- Correctif appliqué ici:
   - Fallback local des pages dans [QuaiAntiqueFrontend/Router/pageTemplates.js](QuaiAntiqueFrontend/Router/pageTemplates.js)
   - Chargement résilient dans [QuaiAntiqueFrontend/Router/router.js](QuaiAntiqueFrontend/Router/router.js)
   - Si aucun fragment n'est récupérable, fallback vers 404 au lieu de planter.

2. Cache navigateur après patch JS/CSS
- Symptôme: le correctif est en prod mais le navigateur garde l'ancien script.
- Correctif appliqué ici:
   - Incrémenter les query params des assets dans [QuaiAntiqueFrontend/index.html](QuaiAntiqueFrontend/index.html)
   - Exemple: `router.js?v=20260329-2`, `script.js?v=20260329-2`, `main.css?v=20260329-2`.

3. Login API en 404 ou comportement instable
- Symptôme: `POST /api/login` retourne 404.
- Correctif robuste:
   - Créer un endpoint explicite de login dans [QuaiAntiqueBackend/restaurant_backend/src/Controller/LoginController.php](QuaiAntiqueBackend/restaurant_backend/src/Controller/LoginController.php)
   - Conserver une règle publique pour `/api/login` dans [QuaiAntiqueBackend/restaurant_backend/config/packages/security.yaml](QuaiAntiqueBackend/restaurant_backend/config/packages/security.yaml)
   - Éviter de dépendre uniquement de `json_login` si l'interception ne se comporte pas comme attendu en prod.

4. Réservation toujours "Complet" avec 404 côté API
- Symptôme: `GET /api/reservations/available` ou `GET /api/admin/restaurant` retourne 404.
- Cause fréquente: aucun enregistrement restaurant en base (settings inexistants).
- Correctif appliqué ici:
   - Auto-création d'une configuration restaurant par défaut dans:
      - [QuaiAntiqueBackend/restaurant_backend/src/Controller/RestaurantSettingsController.php](QuaiAntiqueBackend/restaurant_backend/src/Controller/RestaurantSettingsController.php)
      - [QuaiAntiqueBackend/restaurant_backend/src/Controller/ReservationController.php](QuaiAntiqueBackend/restaurant_backend/src/Controller/ReservationController.php)
   - Résultat: les endpoints settings/disponibilité ne retournent plus 404 à froid.

5. Variables Railway à ne pas oublier
- Backend:
   - `DATABASE_URL` (reference Postgres)
   - `MONGODB_URL` (reference Mongo `MONGO_URL`)
   - `MONGODB_DATABASE`
   - `APP_ENV=prod`, `APP_DEBUG=0`, `APP_SECRET=...`

6. Vérification rapide après déploiement
- Tester ces endpoints (status attendu):
   - `GET /` -> 200 (health)
   - `POST /api/login` -> 200 ou 401 (mais pas 404)
   - `GET /api/admin/restaurant` -> 200
   - `GET /api/reservations/available?...` -> 200 avec `{ "free": true|false }`
   - `POST /api/reservations` (auth) -> 201 ou 409 (mais pas 404)

7. Important pour monorepo
- Vérifier le `Root Directory` Railway de chaque service.
- Backend Symfony ici: `QuaiAntiqueBackend/restaurant_backend`.
- Frontend statique ici: `QuaiAntiqueFrontend`.

### Erreur : "Application failed to respond"

**Solution** :
- Vérifier que le service Backend utilise bien le `Dockerfile`
- Vérifier que Root Directory = `QuaiAntiqueBackend/restaurant_backend`
- Vérifier qu'aucune Build/Start Command Railpack n'écrase le Dockerfile
- Vérifier les logs : Railway > Backend > "Deployments" > Cliquer sur le dernier déploiement

### Erreur : "Script start.sh not found" ou "Railpack could not determine how to build the app"

**Cause la plus fréquente** : Railway build depuis la mauvaise racine du dépôt.

**Solution** :
1. Railway > Service Backend > **Settings** > **Source**
2. Définir **Root Directory** sur `QuaiAntiqueBackend/restaurant_backend`
3. Vider Build Command / Start Command (si mode Dockerfile)
4. Vérifier que Railway détecte le `Dockerfile`
5. Cliquer sur **Redeploy**

### Erreur : "ext-mongodb is missing from your system"

**Cause** : le runtime PHP Railway n'a pas l'extension MongoDB activée par défaut.

**Correctif recommandé (déjà ajouté dans ce repo)** :
- Un `Dockerfile` backend est présent dans `QuaiAntiqueBackend/restaurant_backend`
- Il installe `pdo_pgsql` + `mongodb` (PECL)

**À faire dans Railway** :
1. Service Backend > **Settings** > **Source**
2. **Root Directory** = `QuaiAntiqueBackend/restaurant_backend`
3. Laisser Railway détecter le `Dockerfile` (build Docker)
4. Vider Build/Start Command si tu en avais mis en mode Railpack
5. **Redeploy**

**Contournement rapide (moins propre)** :
- Build Command : `composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-req=ext-mongodb`
- À utiliser seulement si tu acceptes que les routes statistiques Mongo puissent être indisponibles.

### Erreur : "DebugBundle not found" pendant `composer install`

Si le build Docker affiche une erreur liée à `importmap:require` ou `DebugBundle`,
il faut forcer l'installation Composer en mode production dans le Dockerfile.

Le Dockerfile backend du repo utilise déjà :
- `APP_ENV=prod`
- `APP_DEBUG=0`
- `composer install --no-dev --no-scripts --no-plugins`

✅ Cela évite l'exécution des scripts/recipes qui attendent des dépendances `dev`.

### Erreur : "CORS policy"

**Solution** :
```env
CORS_ALLOW_ORIGIN=https://ton-frontend-url.com
```
Dans les variables Railway du Backend

### Erreur : "Database connection failed"

**Solution** :
- Vérifier que PostgreSQL est bien créé
- Vérifier que `DATABASE_URL` est bien référencée
- Importer le fichier `database.sql`

### Frontend ne communique pas avec le Backend

**Solution** :
- Vérifier que toutes les URLs dans les fichiers JS pointent vers Railway
- Vérifier que CORS est bien configuré

---

## 💰 Coût

### Plan Gratuit Railway :

- ✅ **500 heures par mois** : Largement suffisant pour une démo
- ✅ **PostgreSQL + MongoDB inclus**
- ✅ **1 GB RAM par service**
- ✅ **SSL automatique**

**Pour ta formation, c'est parfait !** 🎓

---

## 📝 Checklist finale

Avant de valider ton déploiement :

- [ ] Code poussé sur GitHub (branch develop ou main)
- [ ] Compte créé sur Railway.app
- [ ] Projet Railway créé avec 3 services (Backend, PostgreSQL, MongoDB)
- [ ] Variables d'environnement configurées
- [ ] Fichier `database.sql` importé dans PostgreSQL
- [ ] Frontend déployé (Railway, Netlify ou Vercel)
- [ ] URLs du backend modifiées dans le frontend
- [ ] CORS configuré correctement
- [ ] Tests effectués avec les 3 types de comptes
- [ ] Vidéo du déploiement enregistrée
- [ ] URL publique fonctionnelle notée pour le jury

---

## 🎓 Pour ta présentation devant le jury

**Tu peux dire** :

> "J'ai déployé mon application sur Railway.app via un workflow CI/CD connecté à GitHub. 
> Le déploiement est automatique à chaque push sur la branche develop. 
> L'infrastructure comprend un backend Symfony avec API REST, 
> une base PostgreSQL pour les données relationnelles, 
> et MongoDB pour les statistiques de consultation. 
> Le frontend est déployé sur [Netlify/Vercel] et communique avec l'API via HTTPS."

**Ça montre que tu maîtrises** :
- ✅ Git/GitHub workflow
- ✅ Déploiement cloud moderne
- ✅ Architecture microservices
- ✅ CI/CD
- ✅ Sécurité (HTTPS, CORS, JWT)

---

## 🚀 Bon déploiement !

Si tu as des questions pendant le déploiement, les logs Railway sont ton meilleur ami ! 📊

**URL Railway** : https://railway.app  
**Documentation Railway** : https://docs.railway.app

---

**Projet réalisé dans le cadre de la formation Développeur Web - RNCP Niveau 5 (Bac+2)**
