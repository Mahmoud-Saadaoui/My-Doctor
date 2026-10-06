# MyDoctor — Stabilisation technique et roadmap MVP commercialisable

## Roadmap produit — MVP commercialisable

### P0 — Cadrage et critères de lancement

- [x] Définir la zone de lancement initiale (pays, villes couvertes et langues) et la documenter dans le README.
- [x] Définir le parcours MVP : demande de rendez-vous puis confirmation par le médecin, ou réservation instantanée.
- [x] Définir les règles métier de rendez-vous : durée d'un créneau, délai minimal/maximal de réservation, annulation, absence et motif de refus.
- [x] Décider quelles coordonnées sont publiques (adresse du cabinet, téléphone) et quelles données de contact restent privées.
- [x] Choisir un fournisseur de style/tuiles compatible avec un usage commercial et vérifier tarifs, quotas, attribution et conditions d'utilisation.
- [x] Choisir un fournisseur de géocodage/reverse-geocodage et vérifier quotas, attribution, politique de conservation et limites du service.
- [x] Documenter toutes les variables d'environnement nécessaires aux cartes et au géocodage dans les fichiers `.env.example`, sans y mettre de secrets.
- [x] Définir les critères de mise en production : tests verts, migration testée sur staging, sauvegarde vérifiée et parcours patient/médecin/admin validés.

### P0 — Sécurité, rôles et confiance des profils

- [x] Ajouter le rôle `admin` au modèle utilisateur (procédure de provisionnement du premier admin à faire).
- [x] Ajouter un middleware d'autorisation réutilisable pour protéger les routes médecin et administrateur.
- [x] Interdire à `PUT /account/update-profile` de modifier `userType`; seuls les parcours d'administration autorisés peuvent changer un rôle.
- [x] Faire créer les nouveaux profils médecins avec `isVerified = false` et un état explicite « en attente de vérification » dans l'API et le frontend.
- [x] Ajouter des routes administrateur pour consulter les demandes médecins et approuver/refuser un profil, avec contrôle d'accès.
- [x] Exclure les profils non approuvés des résultats de recherche, des fiches publiques et de la prise de rendez-vous.
- [x] Créer des sélecteurs de réponse publique dédiés et retirer les champs non nécessaires (notamment e-mail) des réponses publiques médecin.
- [x] Ajouter et appliquer les validations serveur à la mise à jour de profil, y compris les limites de longueur, coordonnées et champs obligatoires médecin.
- [x] Ajouter une limite de requêtes dédiée aux routes de connexion et inscription.
- [x] Définir la stratégie de stockage/renouvellement des jetons adaptée à la production et documenter les protections XSS/CSRF associées.
- [x] Ajouter la vérification d'adresse e-mail avant activation du compte et tester les liens expirés/réutilisés (token généré, envoi d'email et route verify-email restants).
- [x] Ajouter la récupération et le changement de mot de passe via un jeton à usage unique et à durée limitée.

### P1 — Modèle de localisation et recherche géographique API

- [x] Définir explicitement la localisation médecin comme l'emplacement du cabinet et la localisation patient comme une donnée de recherche temporaire, non enregistrée par défaut.
- [x] Déplacer les coordonnées du cabinet de `User` vers `Profile` (ou documenter et conserver explicitement le modèle actuel si la migration est différée).
- [x] Écrire une migration Prisma non destructive qui préserve les coordonnées existantes et la tester sur une branche Neon de staging.
- [x] Valider qu'une latitude et une longitude sont fournies ensemble et qu'elles se trouvent dans les plages géographiques autorisées.
- [x] Mettre à jour les sélecteurs Prisma et les réponses médecin pour retourner les coordonnées du cabinet uniquement là où elles sont nécessaires.
- [x] Étendre `GET /doctors` avec les paramètres documentés `lat`, `lng`, `radiusKm`, `sort`, `page` et `limit`.
- [x] Rejeter les requêtes avec une seule coordonnée, une coordonnée invalide, un rayon négatif ou un rayon supérieur à la limite configurée.
- [x] Filtrer les médecins sans coordonnées et ceux hors rayon quand une recherche par proximité est demandée.
- [x] Calculer `distanceKm` à vol d'oiseau et renvoyer cette valeur pour chaque résultat géolocalisé.
- [x] Trier par distance lorsque `sort=distance` et conserver une pagination stable avec un ordre secondaire déterministe.
- [x] Faire respecter les paramètres `page` et `limit` côté frontend et ajouter une navigation « page suivante/précédente » ou « charger plus ».
- [x] Corriger le paramètre `location` de la page d'accueil : le géocoder en coordonnées puis transmettre ces coordonnées à la recherche, ou retirer le paramètre jusqu'à sa prise en charge.
- [x] Ajouter des tests API pour la recherche sans coordonnées, les limites de rayon, les coordonnées invalides, le tri, les profils non vérifiés et la pagination.
- [x] Évaluer le volume prévu et documenter le seuil auquel une recherche PostGIS avec index spatial remplacera le calcul initial.

### P1 — Remplacement des cartes par MapLibre

- [x] Ajouter MapLibre GL et choisir un binding React maintenu; supprimer Leaflet et React-Leaflet une fois tous les parcours migrés.
- [x] Créer un composant de carte partagé qui reçoit style, centre, marqueurs, sélection et callbacks sans contenir de logique métier.
- [x] Migrer le sélecteur de localisation médecin vers le composant partagé MapLibre.
- [x] Migrer la carte de la fiche médecin vers MapLibre.
- [x] Ajouter une carte des résultats sur `/doctors` avec les médecins renvoyés par l'API et leur attribution cartographique visible.
- [x] Synchroniser la sélection entre marqueur et fiche médecin; ouvrir depuis chaque marqueur une fiche compacte avec nom, spécialité, distance et lien vers le profil.
- [x] Ajouter le regroupement des marqueurs lorsque le nombre de médecins affichés dépasse le seuil défini.
- [x] Ajouter un bouton « Me localiser » déclenché par l'utilisateur; gérer permission refusée, navigateur incompatible, délai dépassé et erreur sans bloquer la recherche manuelle.
- [x] Ne pas envoyer ni enregistrer la position patient avant l'action explicite de géolocalisation; ne pas la persister dans le compte par défaut.
- [x] Rendre fonctionnel le champ de recherche par ville/adresse avec le géocodeur choisi et permettre de corriger le lieu sur la carte.
- [x] Ajouter une action « Rechercher dans cette zone » après déplacement de carte et limiter les requêtes à la zone visible.
- [x] Créer une disposition liste/carte sur grand écran et un contrôle accessible de bascule liste/carte sur mobile.
- [x] Ajouter les états carte en chargement, erreur de tuiles, absence de résultats et résultat sans coordonnées; conserver une liste de résultats utilisable sans carte.
- [x] Tester navigation clavier, libellés accessibles, attribution, rendu mobile et directions arabe RTL / anglais LTR.
- [x] Vérifier que les jetons de carte exposés au navigateur sont publics et restreints par domaine; ne jamais embarquer de clé secrète fournisseur dans le bundle.

### P1 — Disponibilités et réservation fiables

- [x] Créer dans l'espace médecin une interface pour ajouter, afficher, désactiver et supprimer des disponibilités hebdomadaires.
- [x] Valider côté serveur les jours, plages horaires, fuseaux horaires et chevauchements de disponibilités.
- [x] Ajouter une route qui renvoie les créneaux disponibles d'un médecin pour une plage de dates, dans le fuseau horaire du profil.
- [x] Générer les créneaux selon la durée de rendez-vous décidée au cadrage et exclure les créneaux déjà occupés ou passés.
- [x] Faire vérifier côté serveur qu'une demande de rendez-vous correspond à un créneau disponible; ne pas faire confiance aux horaires saisis librement par le client.
- [x] Conserver la protection transactionnelle contre les doubles réservations et ajouter un test de deux demandes concurrentes sur le même créneau.
- [x] Remplacer les champs de date/heure libres dans la fiche médecin par la sélection d'un créneau disponible.
- [x] Adapter la liste des rendez-vous au rôle connecté : patient voit le médecin; médecin voit le patient et ses demandes entrantes.
- [x] Ajouter côté médecin les actions confirmer/refuser/terminer/marquer absent selon les transitions autorisées.
- [x] Définir et faire respecter côté API une matrice de transitions de statut; interdire toute transition invalide et toute modification d'un rendez-vous d'un autre utilisateur.
- [x] Ajouter à chaque rôle les informations/actions pertinentes, avec états chargement, erreur, liste vide et confirmation avant action destructive.
- [x] Ajouter des tests pour la réservation hors disponibilité, dates passées, fuseaux horaires, annulation, droits d'accès et transitions de statut.

### P2 — Notifications, confidentialité et expérience de lancement

- [x] Choisir un fournisseur d'e-mails transactionnels et ajouter une configuration séparée pour développement, staging et production.
- [x] Envoyer un e-mail au patient et au médecin lors d'une nouvelle demande, confirmation, refus ou annulation.
- [x] Ajouter une gestion des échecs d'envoi (journalisation sans données médicales inutiles et possibilité de réessai).
- [x] Rédiger et publier les conditions d'utilisation, la politique de confidentialité et l'information sur la géolocalisation.
- [x] Ajouter le consentement nécessaire avant toute collecte ou conservation de données personnelles sensibles et documenter la durée de conservation/suppression.
- [x] Afficher clairement que la distance sur la carte est une distance à vol d'oiseau, et non un itinéraire ou un temps de trajet.
- [x] Compléter les traductions arabe/anglais pour tous les nouveaux écrans, validations, notifications et erreurs.
- [x] Mettre à jour le README : architecture réelle, Prisma/Neon, configuration MapLibre, variables d'environnement, migrations et procédure de lancement.
- [x] Documenter le processus opérationnel de vérification des médecins et le support des demandes d'assistance.

### P2 — Qualité, déploiement et critères de sortie

- [ ] Compléter les tests backend pour inscription, connexion, rôles, approbation médecin, géorecherche, disponibilités et rendez-vous.
- [ ] Ajouter des tests frontend pour recherche, permission de géolocalisation autorisée/refusée, carte/liste et sélection de créneau.
- [ ] Ajouter des tests end-to-end couvrant patient : rechercher près de soi → ouvrir un médecin approuvé → demander un créneau → annuler.
- [ ] Ajouter des tests end-to-end couvrant médecin : compléter profil → attendre/obtenir approbation → publier des disponibilités → traiter un rendez-vous.
- [ ] Ajouter des tests end-to-end couvrant administrateur : consulter une demande et approuver/refuser le médecin.
- [ ] Exécuter et corriger `npm test`, le lint frontend, le build frontend et le contrôle i18n dans la CI.
- [ ] Tester les migrations Prisma sur staging avec un jeu de données représentatif et vérifier que les coordonnées et rendez-vous sont conservés.
- [ ] Configurer les sauvegardes PostgreSQL et effectuer un exercice de restauration documenté.
- [ ] Ajouter une surveillance des erreurs API/frontend et vérifier que les journaux ne contiennent ni mots de passe, ni jetons, ni motifs médicaux sensibles.
- [ ] Configurer domaines, HTTPS, CORS de production, secrets, limites de requêtes, quotas cartographiques et alertes de quota.
- [ ] Effectuer une recette manuelle sur mobile et desktop, en arabe RTL et anglais LTR, avec géolocalisation autorisée/refusée et carte indisponible.
- [ ] Valider le lancement uniquement lorsque les tests passent, les migrations sont validées sur staging et les parcours patient/médecin/admin sont démontrés de bout en bout.
