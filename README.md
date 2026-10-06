# MyDoctor — Plateforme de mise en relation patients / médecins

<div align="center">

![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?style=flat&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?style=flat&logo=tailwind-css)
![Node](https://img.shields.io/badge/Node.js-18.0+-green?style=flat&logo=node.js)
![MapLibre](https://img.shields.io/badge/MapLibre_GL-6.12.0-000000?style=flat)

**Plateforme web de recherche de médecins et de prise de rendez-vous en ligne**

[Stack technique](#-stack-technique) • [Installation](#-installation) • [Structure](#-structure-du-projet) • [API](#-api) • [Déploiement](#-déploiement)

</div>

---

## Aperçu

**MyDoctor** est une application web moderne qui permet aux patients de rechercher des médecins par spécialité, nom ou proximité géographique, et de prendre rendez-vous en ligne. Les médecins gèrent leurs disponibilités et confirment les demandes de rendez-vous. Les administrateurs vérifient les profils de médecins avant leur mise en ligne.

### Fonctionnalités principales

- **Recherche géographique** — Trouver des médecins près de chez soi (tri par distance, rayon configurable)
- **Prise de rendez-vous** — Le patient choisit un créneau disponible, le médecin confirme
- **Gestion des disponibilités** — Le médecin définit ses plages horaires hebdomadaires
- **Vérification des médecins** — Processus d'approbation par un administrateur
- **Notifications email** — Alertes pour chaque étape du rendez-vous
- **Multilingue** — Interface arabe (RTL) et anglais (LTR)
- **Cartographie** — Carte interactive avec MapLibre GL et géocodage Nominatim

---

## Stack technique

### Frontend (`web/`)

| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 19.1.0 | Bibliothèque UI |
| Vite | 5.4.21 | Bundler et serveur de développement |
| TailwindCSS | 4.0 | Framework CSS utilitaire |
| React Router | 7.13.1 | Routage côté client |
| MapLibre GL | 6.12.0 | Cartographie (via react-map-gl) |
| Formik + Yup | 2.4.9 / 1.7.1 | Gestion et validation de formulaires |
| Axios | 1.13.5 | Client HTTP |
| i18next | 26.4.2 | Internationalisation (ar/en) |
| lucide-react | 0.575.0 | Icônes |

### Backend (`server/`)

| Technologie | Version | Usage |
|-------------|---------|-------|
| Node.js | 18+ | Environnement d'exécution |
| Express | 4.18.2 | Framework API |
| Prisma | 7.4.0 | ORM (PostgreSQL) |
| PostgreSQL | 15+ | Base de données (Neon serverless) |
| JWT | 9.0.2 | Authentification |
| bcryptjs | 2.4.3 | Hachage des mots de passe |
| Nodemailer | 6.9.16 | Envoi d'emails transactionnels |
| express-validator | 7.0.1 | Validation des requêtes |
| express-rate-limit | 7.5.0 | Limitation de débit |
| helmet | 8.1.0 | En-têtes de sécurité |
| i18next | 26.4.2 | Internationalisation côté serveur |

---

## Installation

### Prérequis

- **Node.js** 18+
- **npm** ou **pnpm**
- **PostgreSQL** 15+ (ou un compte [Neon](https://neon.tech) gratuit)

### 1. Cloner le projet

```bash
git clone https://github.com/your-username/my-doctor.git
cd my-doctor
```

### 2. Installer les dépendances

```bash
# Backend
cd server
npm install

# Frontend
cd ../web
npm install
```

### 3. Configurer les variables d'environnement

```bash
# server/.env (voir server/.env.example)
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:5173

# Neon PostgreSQL
DATABASE_URL=postgresql://USER:PASSWORD@EP-neon-project-pooler.REGION.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://USER:PASSWORD@EP-neon-project.REGION.aws.neon.tech/neondb?sslmode=require

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=15m

# Recherche géographique
MAX_SEARCH_RADIUS_KM=50
DEFAULT_SEARCH_RADIUS_KM=10
APPOINTMENT_DURATION_MINUTES=30

# Emails (Nodemailer SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
EMAIL_FROM=noreply@mydoctor.com

# web/.env (voir web/.env.example)
VITE_API_URL=http://localhost:4000/api/v1
VITE_MAP_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_MAP_ATTRIBUTION=OpenStreetMap contributors
VITE_GEOCODING_URL=https://nominatim.openstreetmap.org
VITE_MAP_DEFAULT_CENTER=36.8065,10.1815
VITE_MAP_DEFAULT_ZOOM=11
```

### 4. Exécuter les migrations

```bash
cd server
npm run db:migrate
```

### 5. Démarrer les serveurs

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd web
npm run dev
```

L'application est accessible sur :
- **Frontend** : http://localhost:5173
- **API** : http://localhost:4000
- **Health check** : http://localhost:4000/health

---

## Structure du projet

```
my-doctor/
├── web/                      # Frontend React (Vite)
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   │   ├── Alert.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── DoctorCard.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── LocationPicker.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/         # Context API
│   │   │   └── AuthContext.jsx
│   │   ├── i18n/             # Traductions
│   │   │   ├── index.js
│   │   │   └── locales/
│   │   │       ├── ar.json
│   │   │       └── en.json
│   │   ├── lib/              # Utilitaires
│   │   │   ├── axios.js
│   │   │   ├── helpers.js
│   │   │   └── urls.js
│   │   ├── pages/            # Pages de l'application
│   │   │   ├── Home.jsx
│   │   │   ├── SignIn.jsx
│   │   │   ├── SignUp.jsx
│   │   │   ├── Doctors.jsx
│   │   │   ├── DoctorDetails.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── UpdateProfile.jsx
│   │   │   ├── Appointments.jsx
│   │   │   ├── DoctorAvailability.jsx
│   │   │   ├── Terms.jsx
│   │   │   └── Privacy.jsx
│   │   ├── App.jsx           # Routeur principal
│   │   ├── main.jsx          # Point d'entrée
│   │   └── index.css         # Styles globaux + Tailwind
│   ├── public/
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── eslint.config.js
│   └── package.json
│
└── server/                   # Backend Node.js/Express
    ├── config/               # Configuration (DB, i18n)
    ├── controllers/          # Logique métier
    ├── errors/               # Classes d'erreur personnalisées
    ├── locales/              # Traductions serveur
    ├── middlewares/          # Auth, validation, erreurs
    ├── prisma/               # Schéma Prisma + migrations
    ├── routes/               # Définition des routes API
    ├── services/             # Services (email)
    ├── test/                 # Tests backend
    ├── app.js                # Point d'entrée Express
    └── package.json
```

---

## API

Toutes les routes sont préfixées par `/api/v1`.

### Authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/account/signup` | Créer un compte |
| POST | `/account/login` | Se connecter |
| GET | `/account/me` | Utilisateur courant |
| GET | `/account/profile` | Profil utilisateur |
| PUT | `/account/update-profile` | Mettre à jour le profil |
| DELETE | `/account/delete-profile` | Supprimer le compte |
| GET | `/account/verify-email` | Vérifier l'email |
| POST | `/account/resend-verification` | Renvoyer l'email de vérification |
| POST | `/account/forgot-password` | Demander un reset |
| POST | `/account/reset-password` | Réinitialiser le mot de passe |

### Médecins

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/doctors` | Rechercher des médecins |
| GET | `/doctors?lat=36.8&lng=10.1&radiusKm=10&sort=distance` | Recherche par proximité |
| GET | `/doctors?q=cardiology&page=1&limit=12` | Recherche par texte + pagination |
| GET | `/doctors/:id` | Détails d'un médecin |
| GET | `/doctors/:id/availability` | Disponibilités hebdomadaires |
| GET | `/doctors/:id/available-slots?startDate=2024-01-01&endDate=2024-01-31` | Créneaux disponibles |
| POST | `/doctors/me/availability` | Ajouter une disponibilité (médecin) |
| DELETE | `/doctors/me/availability/:id` | Supprimer une disponibilité (médecin) |

### Rendez-vous

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/appointments` | Liste des rendez-vous de l'utilisateur |
| POST | `/appointments` | Demander un rendez-vous |
| PATCH | `/appointments/:id/cancel` | Annuler un rendez-vous |
| PATCH | `/appointments/:id/status` | Changer le statut (médecin) |

### Administration

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/admin/doctors/pending` | Médecins en attente de vérification |
| PATCH | `/admin/doctors/:id/approve` | Approuver un médecin |
| PATCH | `/admin/doctors/:id/reject` | Refuser un médecin |

---

## Déploiement

### Backend (Render / Railway / Fly.io)

1. Configurer les variables d'environnement de production
2. Exécuter `npm run db:migrate:deploy` pour appliquer les migrations
3. Démarrer avec `npm start`

### Frontend (Vercel / Netlify)

1. Configurer `VITE_API_URL` vers l'URL de production de l'API
2. Exécuter `npm run build`
3. Déployer le dossier `dist/`

### Base de données (Neon)

- Les sauvegardes automatiques sont gérées par Neon
- Pour une restauration : utiliser le dashboard Neon ou `pg_restore`

---

## Sécurité

- Mots de passe hachés avec bcrypt
- Tokens JWT pour l'authentification (expiration 15 min)
- Validation des entrées côté serveur (express-validator)
- Limitation de débit (express-rate-limit)
- En-têtes de sécurité (helmet)
- Protection CORS configurée
- Vérification email avant activation
- Tokens de reset à usage unique et durée limitée

---

## Licence

ISC

---

<div align="center">

**Construit avec React, Node.js et PostgreSQL**

</div>
