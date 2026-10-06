# Processus de vérification des médecins

## Vue d'ensemble

Le processus de vérification garantit que seuls les médecins qualifiés et vérifiés sont visibles par les patients sur la plateforme.

## Étapes du processus

### 1. Inscription du médecin

- Le médecin crée un compte via `/signup` en cochant "Je suis médecin"
- Il remplit ses informations professionnelles : spécialité, adresse du cabinet, téléphone, horaires
- Son profil est créé avec `isVerified = false`
- Un email de vérification est envoyé pour activer le compte

### 2. Vérification de l'email

- Le médecin clique sur le lien de vérification envoyé par email
- Son compte est activé (`isEmailVerified = true`)
- Il peut se connecter mais son profil reste invisible pour les patients

### 3. Soumission pour vérification

- Le médecin complète son profil (spécialité, adresse, téléphone, horaires, localisation)
- Le profil est soumis automatiquement pour vérification
- Statut : `isVerified = false` (en attente)

### 4. Révision par l'administrateur

- L'administrateur accède au tableau de bord admin (`/admin/doctors/pending`)
- Il consulte les informations du médecin
- Il peut approuver ou refuser le profil

### 5. Décision

**Si approuvé :**
- `isVerified = true`
- Le médecin devient visible dans les résultats de recherche
- Il peut recevoir des demandes de rendez-vous

**Si refusé :**
- `isVerified = false`
- Le médecin reste invisible
- Il peut contester la décision via le support

## Rôles et permissions

| Rôle | Peut vérifier | Peut approuver/refuser |
|------|---------------|------------------------|
| Patient | Non | Non |
| Médecin | Non | Non |
| Admin | Oui | Oui |

## API endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/v1/admin/doctors/pending` | Liste des médecins en attente |
| PATCH | `/api/v1/admin/doctors/:id/approve` | Approuver un médecin |
| PATCH | `/api/v1/admin/doctors/:id/reject` | Refuser un médecin |

## Support

Pour toute question relative à la vérification :
- Email : support@mydoctor.com
- Le médecin peut contacter le support depuis son profil
