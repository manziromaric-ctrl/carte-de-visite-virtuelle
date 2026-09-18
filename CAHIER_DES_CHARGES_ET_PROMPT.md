# 📄 CAHIER DES CHARGES & PROMPT MAÎTRE DE GÉNÉRATION
## Application : Carte de Visite Digitale & Connectée NFC — Ange Elenga (Kongo Digital Wave)

---

# PARTIE 1 : CAHIER DES CHARGES FONCTIONNEL ET TECHNIQUE

## 1. Contexte et Objectifs du Projet
Ce projet consiste en la création d'une **carte de visite digitale professionnelle, interactive et connectée (compatible NFC et QR Code)** pour **Ange Elenga**, Consultante Digitale & Stratège Médias au sein de l'agence **Kongo Digital Wave** basée à **Pointe-Noire, République du Congo**.

### Objectifs Clés :
1. **Facilité de transmission immédiate** : Permettre à un interlocuteur de scanner un QR Code ou de taper un tag NFC pour accéder à l'ensemble des coordonnées sans aucune application à installer.
2. **Expérience haut de gamme & Interactive** : Offrir un simulateur de carte physique 3D recto/verso tactile, un compteur de vues en temps réel, un accès direct aux canaux de communication (Téléphone, WhatsApp, Email, LinkedIn, Site Web, Google Maps).
3. **Sécurité et protection des modifications** : Empêcher toute personne non autorisée de modifier les informations de la carte grâce à un sas de sécurité protégé par mot de passe administrateur strict (`021185`).
4. **Export de contact universel** : Téléchargement en 1 clic d'une fiche contact vCard 3.0 (`.vcf`) compatible iOS (Contacts Apple) et Android (Google Contacts).
5. **Autonomie de personnalisation** : Panneau d'administration permettant au titulaire de modifier sa photo, son logo d'entreprise, ses coordonnées et ses repères géographiques avec persistance locale.

---

## 2. Identité de Marque & Profil par Défaut

- **Nom complet** : Ange Elenga
- **Poste** : Consultante Digitale & Stratège Médias
- **Entreprise** : Kongo Digital Wave
- **Slogan / Tagline** : « Création de contenus stratégiques, audiovisuels & solutions digitales d'impact »
- **Bio** : « Passionnée par l'innovation technologique et la communication de marque en Afrique centrale. Nous accompagnons les entreprises, institutions et porteurs de projets dans leur visibilité et leur croissance numérique. »
- **Email** : `congodigitalwave@gmail.com`
- **Téléphone direct** : `+242 05 377 06 06`
- **WhatsApp direct** : `+242053770606` (Lien direct `https://wa.me/242053770606`)
- **LinkedIn** : `https://www.linkedin.com/in/ange-elenga-4a37b0385/`
- **Site Web** : `https://kongodigitalwave.netlify.app/`
- **Lien Google Maps** : `https://share.google/zLH09B7lbmuFmabrn`
- **Adresse physique** : Avenue de la Paix, Centre-Ville, Pointe-Noire, République du Congo
- **Repère géographique** : Bureaux Kongo Digital Wave
- **Coordonnées GPS** : Latitude `-4.7774`, Longitude `11.8635` | Plus Code `6FV7+F8 Pointe-Noire`
- **Domaines d'expertise** :
  - Stratégie de communication digitale
  - Production audiovisuelle & vidéo corporate
  - Développement Web & Solutions digitales
  - Campagnes d'attraction d'investisseurs
- **Compétences clés** : Digital Transformation, Content Strategy, Branding & Video, Project Management, Tech & Web Solutions.

---

## 3. Spécifications Graphiques & UI/UX

### 3.1 Thème & Palette Chromatique
- **Ambiance** : Thème sombre ultra-premium (Dark Slate & Emerald Wave).
- **Fond principal** : `slate-950` (`#020617`) avec halo lumineux radial diffus (`emerald-500/10` et `teal-500/5`).
- **Conteneurs & Cartes** : `slate-900` avec bordures subtiles `slate-800` et rehauts `emerald-500/20`.
- **Accents de couleur** :
  - Émeraude & Sarcelle (`emerald-400`, `emerald-500`, `teal-500`) : Symbolisant l'Afrique numérique, l'innovation et l'énergie dynamique.
  - Or / Ambre (`amber-400`, `amber-500`) : Pour le verrou de sécurité et les détails haut de gamme.
  - Rouge bordeaux subtil : Issu de l'identité originale du logo Kongo Digital Wave.
- **Typographie** :
  - Titres et Chiffres : `Space Grotesk` (technologique, moderne).
  - Corps et Menus : `Plus Jakarta Sans` (ergonomique, lisibilité optimale).

### 3.2 Logo Officiel Kongo Digital Wave
Le logo officiel doit être respecté scrupuleusement :
- Silhouette stylisée du continent africain avec dégradé vert.
- 3 courbes ondulantes dynamiques aux couleurs panafricaines (vert, jaune doré, rouge bordeaux).
- Île de Madagascar fidèlement positionnée.
- Typographie officielle : **Kongo** en vert foncé, **Digital Wave** en bordeaux et baseline « Expert in Digital Marketing & Content Creation ».
- Disponibilité en 2 formats :
  1. Logo complet avec texte (`/kongo_digital_logo.png`).
  2. Emblème seul pour les cartes et puces compactes (`/kongo_emblem.png`).

---

## 4. Spécifications Fonctionnelles Détaillées

### 4.1 En-tête (Header)
- Logo Kongo Digital Wave officiel (emblème) + Titre de l'entreprise et mention métier.
- **Compteur de consultations** : Affiche le nombre de vues avec prévention de surcomptage (cooldown de 30 minutes enregistré en `localStorage`).
- **Bouton Partager** : Copie dans le presse-papiers l'URL publique de la carte avec feedback visuel vert (« Copié »).
- **Bouton Admin / Modifier** :
  - Si non authentifié : Icône Cadenas doré (`Lock`) avec label « Admin ».
  - Si authentifié : Icône Réglages émeraude (`Settings2`) avec label « Modifier » et surbrillance verte.

### 4.2 Simulateur de Carte Physique 3D NFC
- Rendu au format carte de crédit ISO / NFC standard avec coins arrondis élégants.
- **Interactivité 3D (Flip Card)** :
  - Clic ou tap pour retourner la carte (Recto / Verso) avec perspective CSS 3D fluide et effet de survol.
- **Face Recto (Avant)** :
  - Emblème officiel Kongo Digital Wave + Nom de l'entreprise.
  - Symbole sans contact NFC avec puce à induction simulée en filigrane doré.
  - Photo de profil portrait dans un cadre circulaire avec lueur émeraude (clic pour agrandir).
  - Nom : Ange Elenga, Titre professionnel, Ville et Pays.
  - Bouton d'accès direct au QR Code intégré sur la carte.
- **Face Verso (Arrière)** :
  - Bande magnétique stylisée sombre et puce NFC holographique.
  - Mini QR Code vectoriel dynamique directement scannable au verso.
  - Coordonnées imprimées : Téléphone, Email, Site web, Adresse physique.
  - Emblème discret en filigrane pour un rendu bancaire / exécutif haut de gamme.

### 4.3 Barre d'Actions Rapides (Quick Actions)
Quatre boutons d'action instantanée :
1. **Appeler** : Déclenche le protocole `tel:+242053770606`.
2. **WhatsApp** : Ouvre la conversation directe WhatsApp `https://wa.me/242053770606`.
3. **Email** : Déclenche le client mail vers `congodigitalwave@gmail.com`.
4. **Enregistrer contact** : Génère et télécharge le fichier `Ange_Elenga_KongoDigitalWave.vcf` (vCard 3.0 avec nom, prénom, entreprise, titre, téléphone, email, URL, note et adresse complète).

### 4.4 Modale QR Code Professionnelle Multi-Cibles
La modale de scan QR propose 3 modes commutables :
1. **Lien de la carte digitale** : Encode l'URL web pour affichage direct dans le navigateur du smartphone. Possibilité de personnaliser l'URL cible directement dans l'interface avec réinitialisation en 1 clic.
2. **Contact VCF / MeCard** : Encode les coordonnées complètes pour ajout direct dans le carnet d'adresses sans passer par internet.
3. **Localisation Google Maps** : Encode le lien Google Maps précis du bureau à Pointe-Noire pour guidage GPS instantané.
- **Fonctionnalités associées** :
  - Téléchargement du QR Code en fichier image PNG haute résolution (500x500 px).
  - Partage natif via Web Share API (`navigator.share`) ou copie du lien.

### 4.5 Section Géolocalisation & Itinéraire GPS
- Carte stylisée interactive ou vue repère avec coordonnées géographiques précises.
- Adresse complète : Avenue de la Paix, Centre-Ville, Pointe-Noire, Congo.
- Bouton « Ouvrir dans Google Maps » avec lien officiel direct.
- Bouton « Lancer l'itinéraire » calculant la route depuis la position actuelle de l'utilisateur.

### 4.6 Section Présence en Ligne & Réseaux
- Cartes d'accès rapide pour :
  - **Site Web Officiel** (`https://kongodigitalwave.netlify.app/`) avec statut en ligne.
  - **Profil LinkedIn** (`https://www.linkedin.com/in/ange-elenga-4a37b0385/`).
  - **WhatsApp Business**.
  - **Boîte Email professionnelle**.

### 4.7 Section À Propos & Vision d'Entreprise
- Logo officiel complet de Kongo Digital Wave mis en valeur dans un écrin épuré contrasté.
- Présentation de la vision d'accompagnement numérique des entreprises en Afrique centrale.
- Grille des 4 services phares avec icônes distinctes.
- Badges de compétences professionnelles.

### 4.8 Sécurité & Sas d'Authentification Administrateur
- **Protection par mot de passe strict** : Le mot de passe requis est **`021185`**.
- **Interface de saisie sécurisée** :
  - Cadenas animé avec badge « Protégé ».
  - Champ de saisie masqué avec icône œil (`Eye`/`EyeOff`) pour afficher/masquer le code.
  - Pavé numérique tactile virtuel (touches 0 à 9, effacer, retour) optimisé pour mobile.
  - Saisie au clavier physique avec validation par la touche Entrée.
  - Message d'erreur explicite en cas de code erroné.
  - Animation de succès et déverrouillage dès la validation du mot de passe `021185`.
  - Mémorisation de session (`sessionStorage`).
  - Bouton « Verrouiller » dans l'en-tête de la modale d'édition pour fermer la session à tout moment.

### 4.9 Section Réalisations Vidéo & Preuves de Production (2 Emplacements)
- **Objectif** : Démontrer le savoir-faire audiovisuel de pointe de l'agence directement aux visiteurs de la carte.
- **Onglet dédié et intégration Aperçu** : Onglet « Vidéos » dans la barre de filtre avec pastille animée, et affichage en tête de la vue d'ensemble.
- **Vidéo #1 (Intégrée d'office)** :
  - *Titre* : Terre d'Avenir : Projet Manzi Camp MAB.
  - *Thématique* : Exploration & Exploitation Semi-Industrielle des Ressources Stratégiques (Or, Coltan, Cobalt, Cassitérite & Quartz).
  - *Client / Partenaires* : Partenariat Stratégique MTMA Group x Famille Nama Kiganga (District de Kakamoeka, Département du Kouilou, Congo).
  - *Réalisation* : Kongo Digital Wave (Présenté par Divin MAYELA & Rock NKOUELOLO).
  - *Format* : Prises de vues aériennes par drone 4K, cartographie 3D, interviews et valorisation des gisements.
  - *Lecteur* : Modale cinéma HD avec contrôles complets et bouton WhatsApp direct.
- **Vidéo #2 (À téléverser par le titulaire)** :
  - Emplacement réservé et prêt à l'emploi.
  - Bouton de téléversement direct depuis un ordinateur ou smartphone (fichiers MP4, WebM, MOV).
  - Support de liens directs et intégrations vidéo externes (YouTube, Vimeo, Cloud).
- **Moteur de stockage hybride IndexedDB** :
  - Contourne la limite de 5 Mo de `localStorage` pour supporter des fichiers vidéo volumineux en toute fluidité.
  - Génération automatique de la miniature (vignette) et calcul de la durée dès le téléversement du fichier.
- **Gestion de session** :
  - Mémorisation de l'authentification dans la session de navigation (`sessionStorage`).
  - Bouton **« Verrouiller »** présent dans l'en-tête du panneau d'édition permettant de refermer immédiatement la session administrateur.

### 4.9 Panneau d'Édition & Personnalisation (Admin)
Accessible uniquement après validation du mot de passe `021185` :
- Modification de la photo de profil : Drag & drop d'un fichier image (avec conversion Base64) ou saisie d'une URL.
- Gestion du logo d'entreprise : Prévisualisation, téléversement d'un nouveau logo et bouton « Rétablir le logo officiel ».
- Modification des données textuelles : Nom, Titre, Société, Tagline, Bio, Email, Téléphone, WhatsApp, LinkedIn, Site Web, Lien Maps.
- Modification des coordonnées géographiques : Adresse, Ville, Pays, Repère, Latitude, Longitude.
- Bouton « Enregistrer les modifications » avec sauvegarde en `localStorage`.
- Bouton « Réinitialiser par défaut » pour restaurer les données d'origine d'Ange Elenga.

### 4.10 Synchronisation Cloud Temps Réel & Backend Universel (Firebase + Supabase)
- **Diffusion Universelle en Temps Réel** :
  - Tout changement apporté par l'administrateur (textes, contacts, repères GPS, avatar, portfolio vidéo) est persisté sur le cloud.
  - Dès qu'une modification est enregistrée, elle est instantanément transmise à tous les terminaux (smartphones, ordinateurs, tablettes des lecteurs et clients) sans rechargement de page.
  - Indicateur visuel d'état en direct dans l'en-tête de la carte avec pastille animée (`En direct`).
- **Support Hybride Firebase Firestore & Supabase** :
  - Backend cloud Firestore déployé et actif par défaut (sécurité configurée dans `firestore.rules`).
  - Module d'intégration Supabase (`@supabase/supabase-js`) prêt à l'emploi : configuration possible de l'URL Supabase (`VITE_SUPABASE_URL`) et de la clé anonyme (`VITE_SUPABASE_ANON_KEY`) directement dans le panneau d'administration pour la double synchronisation temps réel (Realtime Broadcast) et le stockage de médias (Supabase Storage).
- **Moteur de Fallback & Persistance Hors-Ligne** :
  - Maintien du cache `localStorage` et de la base `IndexedDB` pour garantir un chargement instantané même en cas de réseau instable.

### 4.11 Modale Visionneuse Photo Portrait HD
- Clic sur la photo de profil pour ouvrir une modale plein écran avec zoom et coordonnées récapitulatives.

---

## 5. Architecture Technique & Dépendances

- **Framework** : React 18+ avec TypeScript.
- **Outil de build** : Vite.
- **Styling** : Tailwind CSS (utilitaires natifs, flexbox, grid, animations `animate-in fade-in`).
- **Icônes** : `lucide-react` (aucune icône SVG brute).
- **Génération QR Code** : Bibliothèque `qrcode` pour le rendu Canvas et DataURL PNG.
- **Stockage client** :
  - `localStorage` : Profil utilisateur personnalisé, compteur de vues, timestamp anti-doublon, URL personnalisée du QR code.
  - `sessionStorage` : État d'authentification administrateur (`kongo_admin_authenticated`).

---
---

# PARTIE 2 : LE PROMPT PARFAIT POUR GÉNÉRER DE NOUVEAU LA CARTE DE A À Z

*(Vous pouvez copier et coller l'intégralité du bloc ci-dessous dans Google AI Studio ou tout assistant de code IA pour recréer l'application exacte.)*

```markdown
Crée une application web complète, moderne, ultra-professionnelle et responsive de "Carte de Visite Digitale & Connectée NFC" en React (Vite + TypeScript + Tailwind CSS) pour Ange Elenga, Consultante Digitale & Stratège Médias au sein de l'agence Kongo Digital Wave basée à Pointe-Noire en République du Congo.

L'application doit être immédiatement opérationnelle, sans maquette statique ni données fictives, avec une fidélité graphique et fonctionnelle absolue selon les spécifications ci-dessous.

### 1. DONNÉES ET IDENTITÉ PAR DÉFAUT (src/data/defaultProfile.ts)
- Nom : Ange Elenga
- Titre : Consultante Digitale & Stratège Médias
- Entreprise : Kongo Digital Wave
- Slogan : "Création de contenus stratégiques, audiovisuels & solutions digitales d'impact"
- Bio : "Passionnée par l'innovation technologique et la communication de marque en Afrique centrale. Nous accompagnons les entreprises, institutions et porteurs de projets dans leur visibilité et leur croissance numérique."
- Email : congodigitalwave@gmail.com
- Téléphone : +242 05 377 06 06
- WhatsApp : +242053770606 (lien direct wa.me/242053770606)
- LinkedIn : https://www.linkedin.com/in/ange-elenga-4a37b0385/
- Site Web : https://kongodigitalwave.netlify.app/
- Google Maps : https://share.google/zLH09B7lbmuFmabrn
- Adresse : Avenue de la Paix, Centre-Ville, Pointe-Noire, République du Congo
- Repère : Bureaux Kongo Digital Wave
- Coordonnées GPS : Latitude -4.7774, Longitude 11.8635 (Plus Code : 6FV7+F8 Pointe-Noire)
- Services :
  * Stratégie de communication digitale
  * Production audiovisuelle & vidéo corporate
  * Développement Web & Solutions digitales
  * Campagnes d'attraction d'investisseurs
- Compétences : Digital Transformation, Content Strategy, Branding & Video, Project Management, Tech & Web Solutions.

### 2. CHARTE GRAPHIQUE & LOGO OFFICIEL (src/components/KongoLogo.tsx)
- Thème : Sombre haut de gamme (slate-950, accents émeraude emerald-400/500, sarcelle teal-500, touches ambre/dorées pour la sécurité et le NFC).
- Typographies : Plus Jakarta Sans (corps et menus) et Space Grotesk (titres et chiffres).
- Logo Kongo Digital Wave officiel : Composant dédié avec support de variantes ('full', 'emblem', 'badge') utilisant les fichiers haute résolution du logo officiel (silhouette d'Afrique dégradé vert, 3 vagues ondulantes vert/jaune/bordeaux, île de Madagascar, typographie officielle Kongo en vert et Digital Wave en bordeaux). Ne pas réinventer ni déformer le logo.

### 3. SIMULATEUR DE CARTE PHYSIQUE 3D NFC (src/components/PhysicalCardPreview.tsx)
- Carte format carte bancaire avec perspective 3D et effet de retournement (Flip) au clic ou tap.
- Recto :
  * Logo emblème Kongo Digital Wave, nom de l'entreprise et icône NFC sans contact avec simulation de puce.
  * Photo de profil portrait dans un cercle avec bordure émeraude lumineuse (clic ouvrant la photo en plein écran).
  * Nom complet Ange Elenga, fonction professionnelle, ville et pays.
  * Bouton tactile d'accès rapide au QR Code.
- Verso :
  * Bande magnétique sombre supérieure et puce NFC holographique.
  * Mini QR Code dynamique vectoriel fonctionnel et scannable.
  * Coordonnées imprimées (Téléphone, Email, Site Web, Adresse Pointe-Noire).
  * Emblème officiel en filigrane texturé.

### 4. ACTIONS RAPIDES & EXPORT DE CONTACT (src/components/ActionButtons.tsx & src/utils/vcard.ts)
- 4 boutons principaux avec icônes de lucide-react :
  1. Appeler (+242 05 377 06 06 via lien tel:).
  2. WhatsApp (message direct wa.me).
  3. Email (congodigitalwave@gmail.com via lien mailto:).
  4. Enregistrer Contact : Génération et téléchargement direct d'un fichier vCard (.vcf version 3.0) universel avec nom, prénom, titre, société, téléphone, email, URL, note et adresse complète.

### 5. MODALE QR CODE MULTI-CIBLES (src/components/QrCodeModal.tsx)
- Utilise la bibliothèque "qrcode" pour générer un QR Code haute définition sur canvas.
- 3 modes commutables avec boutons d'onglets :
  1. Lien de la carte digitale (URL actuelle ou personnalisée avec éditeur de lien en ligne).
  2. Fiche contact complète vCard / MeCard pour ajout instantané au répertoire.
  3. Coordonnées Google Maps pour guidage GPS immédiat.
- Bouton pour télécharger le QR Code en image PNG (500x500 px).
- Bouton de partage natif (Web Share API) ou copie du lien avec feedback visuel.

### 6. GÉOLOCALISATION GPS & PRÉSENCE EN LIGNE
- Section Localisation GPS avec adresse détaillée à Pointe-Noire, repère visuel, coordonnées exactes, bouton "Ouvrir dans Google Maps" et bouton "Itinéraire" calculant la route.
- Section Réseaux avec cartes d'accès direct vers le site web officiel, LinkedIn, WhatsApp et Email.
- Section À Propos avec le logo officiel complet sur fond blanc contrasté, texte de présentation de la vision panafricaine et grille des 4 services phares.

### 7. SAS DE SÉCURITÉ & PROTECTION PAR MOT DE PASSE (src/components/PasswordModal.tsx)
- L'accès à la modification de la carte DOIT être strictement protégé par mot de passe.
- Le mot de passe exact est : 021185.
- La modale de mot de passe doit comporter :
  * Titre "Accès Administrateur", badge "Protégé", icône Cadenas stylisée.
  * Champ de saisie sécurisé avec bouton pour afficher/masquer les caractères (Eye/EyeOff).
  * Pavé numérique tactile intégré (touches 1 à 9, 0, Effacer, Retour) parfait pour smartphone.
  * Support de la touche Entrée du clavier.
  * Message d'alerte rouge en cas d'erreur de mot de passe ("Mot de passe incorrect. Seul le titulaire est autorisé à modifier cette carte.").
  * Animation de déverrouillage vert en cas de succès et ouverture du formulaire d'édition.
- Gestion de session : Mémorisation de l'authentification dans sessionStorage pour la session courante.
- Bouton "Verrouiller" présent dans l'en-tête du panneau d'édition permettant au titulaire de reverrouiller l'accès immédiatement dès qu'il a fini ses modifications.

### 8. PANNEAU DE PERSONNALISATION ADMIN (src/components/EditProfileModal.tsx)
- Accessible uniquement après saisie du mot de passe 021185.
- Permet de modifier en direct :
  * Photo de profil (téléversement local avec FileReader Base64 ou URL externe, avec suppression).
  * Logo de l'entreprise (téléversement de logo PNG transparent avec bouton "Rétablir le logo officiel").
  * Nom, Titre, Entreprise, Slogan, Bio, Téléphone, WhatsApp, Email, LinkedIn, Site Web, Google Maps.
  * Adresse, Repère, Ville, Pays, Latitude, Longitude.
- Bouton de sauvegarde avec persistance dans localStorage sous la clé 'kongo_digital_wave_profile_v2'.
- Bouton de réinitialisation pour rétablir les données d'origine d'Ange Elenga.

### 9. COMPTEUR DE VUES INTELLIGENT
- Compteur de consultations visible dans l'en-tête et sous la carte.
- Sauvegardé en localStorage avec horodatage pour éviter de compter deux fois le même utilisateur lors d'un simple rafraîchissement (cooldown de 30 minutes).

### 10. MODALE VISIONNEUSE PHOTO (src/components/PhotoModal.tsx)
- Agrandissement plein écran de la photo portrait officielle d'Ange Elenga avec coordonnées de contact rapides au bas de l'image.

Assure-toi que toutes les dépendances requises (lucide-react, qrcode, @types/qrcode) sont correctement importées et que le projet compile à 100% sans aucune erreur TypeScript ni régression.
```
