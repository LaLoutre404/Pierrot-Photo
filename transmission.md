# Transmission — Portfolio Pierre Bousquet

Dernière mise à jour : 17 novembre 2026

## Simplification de la page d’avis — 17 novembre 2026

- Après avoir retiré l’introduction du haut, le propriétaire a demandé de retirer aussi le bloc « Poursuivons la conversation » et ses deux liens. La page ne conserve que la carte éditoriale et le bouton direct « Laissez un avis ».

## Remplacement de la page d’avis — 17 novembre 2026

- À la demande du propriétaire, le widget Elfsight et son composant, son identifiant de configuration, sa section de confidentialité et ses textes dédiés ont été supprimés.
- `/avis-clients` est maintenant une page éditoriale qui invite à laisser un avis via le lien direct Google. Un lien secondaire ouvre la fiche, sans afficher de faux avis ni de compteur. Tous les textes visibles restent modifiables dans le back-office.
- Le rendu a été vérifié localement sur ordinateur et à 390 px, sans débordement horizontal ; le lien principal contient le `Place ID` de Studio Pierro.
- La nouvelle version a été déployée sur Vercel : `dpl_G5Cz7KvgDoch1qzAHKPFKZMesNnQ`, état `Ready`, alias `https://pierrot-photo.vercel.app`. Le rendu public, le lien Google et l’absence de script Elfsight ont été vérifiés. Aucune commande Git n’a été exécutée.

## Déploiement du 17 novembre 2026 — avis Elfsight

- Le propriétaire a explicitement demandé le déploiement de la version locale. Déploiement de production Vercel `dpl_CNQMgKE5JCnUPUdehDEC688CWeoR`, état `Ready`, alias `https://pierrot-photo.vercel.app`.
- La page publique `/avis-clients` répond en HTTP 200. Le widget Elfsight se charge après clic et affiche actuellement zéro carte d’avis, son bouton interne « Review us on Google » et la marque de la formule gratuite. Le bouton français « Laissez un avis » du site est visible plus bas.
- L’accès à Vercel a nécessité la portée explicite `laloutre404s-projects` et le projet `prj_vPOQOjhQqM75JGZ9pcbiGmXvCVY8`. Le build Vercel a réussi. Aucune commande Git n’a été exécutée.

## Intervention du 17 novembre 2026 — page d’avis Elfsight, locale

- L’accès aux API Google Business Profile a été refusé pour le projet du propriétaire. Le lecteur paginé existant reste dans `lib/google-business-reviews.ts`, mais `/avis-clients` utilise désormais un emplacement Elfsight.
- La page d’avis a été redessinée, conserve les liens Google et affiche toujours « Laissez un avis ». Le widget Elfsight ne sera chargé qu’après un clic du visiteur. Les nouveaux textes sont modifiables dans le back-office ; la politique de confidentialité comprend une section Elfsight.
- Le propriétaire a créé le widget et fourni l’UUID `4b67270e-06cd-41c9-83a7-aa788802581e`, intégré dans `content/site.ts`. Il faut encore vérifier que la source du widget est bien Studio Pierro avec le `Place ID` `ChIJ0yDGy0yJ0GUR-lPbukv619k` et que le rendu réel fonctionne.
- Le chargement réel local du widget a été vérifié : le module s’affiche, mais ne contient encore aucune carte d’avis. Son bouton interne est en anglais (« Review us on Google ») ; la langue doit être réglée dans Elfsight. Le bouton français « Laissez un avis » du site reste accessible.
- Après intégration de l’UUID, ESLint et le build Webpack (avec TypeScript) passent.
- TypeScript, ESLint et le build Webpack sont passés ; la page locale et le bouton Google ont été vérifiés visuellement dans le navigateur à largeur mobile.
- À ce stade de l’intervention, l’intégration était uniquement locale ; elle a été déployée ensuite, comme indiqué ci-dessus. Aucune commande Git n’a été effectuée.

## Intervention du 10 novembre 2026 — avis Google, locaux

- Le lien fourni `https://share.google/wp1jlRRDwnxNFTcJP` ouvre la fiche « Studio Pierro » ; Google affichait « Aucun avis trouvé » le 10 novembre 2026.
- Le `Place ID` vérifié est `ChIJ0yDGy0yJ0GUR-lPbukv619k`. Le lien `https://search.google.com/local/writereview?placeid=ChIJ0yDGy0yJ0GUR-lPbukv619k` ouvre le formulaire d’avis Google.
- `/avis-clients` affiche localement « Laissez un avis » et les liens Google. Un lecteur paginé pour tous les avis via Google Business Profile est prêt, mais les cinq variables `GOOGLE_BUSINESS_*` ne sont pas configurées. Le propriétaire ne sait pas encore si son projet Google Cloud a l’accès API requis.
- TypeScript, ESLint, 6 tests et un build Webpack sont passés. Le rendu local sans avis et la destination du lien ont été vérifiés.
- **Aucun déploiement de cette fonctionnalité n’a eu lieu.** La revue automatique a refusé le déploiement : elle demande un nouvel accord explicite du propriétaire pour remplacer la version publique, compte tenu de son ancienne consigne de garder les changements locaux. Ne pas contourner ce refus ; solliciter l’accord explicite avant toute nouvelle tentative.
- Aucune commande Git n’a été exécutée.

## Déploiement de production du 12 octobre 2026

- Le propriétaire a ensuite demandé explicitement la mise en production de la version locale.
- Les contrôles locaux ont réussi : ESLint, TypeScript, 6 tests et build Webpack. Le build Vercel a également réussi.
- Déploiement Vercel de la version locale effectué, puis second déploiement pour actualiser la documentation. Version de production finale : `dpl_ApYzipqejxGFGpVrs5eJp6ZYY4Br`, alias `https://pierrot-photo.vercel.app`.
- L’accueil et `/admin/connexion` ont répondu en HTTP 200 après le déploiement.
- Les notes ci-dessous sur la version « non déployée » décrivent l’état **avant** cette demande de mise en production.
- Aucune commande Git n’a été exécutée pendant ce déploiement.

## Intervention du 12 octobre 2026 — modifications locales avant déploiement

- Les fonds sombres du site sont passés à `#141415`.
- Les textes publics et coordonnées ont une interface d’édition dans `/admin`, une API protégée et une table `site_texts` avec RLS. Les valeurs actuelles restent disponibles comme repli.
- Les liens de contact sont agrandis, les quatre photos des compétences sont alignées, les séparateurs des compétences sont supprimés et les paragraphes sont justifiés.
- L’accueil a un parallaxe sur la photo et le titre. La signature temporaire « Studio Pierro » apparaît en grand au centre de la photo, puis remonte et reprend sa taille dans l’en-tête au fil du défilement ; « Portfolio » apparaît pendant ce mouvement. Le chargement de la photo est attendu avant l’affichage ; les préférences de mouvement réduit sont respectées.
- La migration `202610120001_site_texts.sql` a été exécutée dans Supabase `Bousquet-DEV` le 12 octobre 2026. La présence des deux politiques et l’activation de RLS ont été vérifiées dans l’éditeur SQL. Le fichier local est idempotent pour une éventuelle exécution ultérieure par le CLI.
- **Le code du site n’a pas été déployé sur Vercel, à la demande explicite du propriétaire.** La production présente encore la version précédente ; seule la migration de base est appliquée.
- Aucune commande Git n’a été lancée pendant cette intervention.
- Validations locales : lint, TypeScript, 6 tests et build Webpack réussis ; rendu vérifié à 390 px et 1440 px, sans débordement horizontal à 390 px.
- Ajustement du 12 octobre 2026 : animation du logo pilotée par le défilement, parallaxe du titre ajoutée ; lint, TypeScript et build Webpack réussis, rendu vérifié à 1280 px et 390 px. Les changements restent locaux, sans commande Git ni déploiement.

## Consigne de reprise

Dans une nouvelle conversation, commencer par lire ce fichier puis traiter la demande courante. Le propriétaire a explicitement autorisé une synchronisation Git et un déploiement le 17 novembre 2026 ; tenir compte de sa demande la plus récente pour toute intervention ultérieure. Ne pas refaire l'historique, les migrations ou toutes les validations déjà terminées sans raison.

Le propriétaire souhaite des interventions efficaces et économes en temps/tokens : inspection ciblée, modification ciblée, puis une seule validation proportionnée au changement.

## État actuel

- Le site est développé, documenté, versionné et déployé.
- Production : <https://pierrot-photo.vercel.app>
- Dépôt : <https://github.com/LaLoutre404/Pierrot-Photo>
- Branche : `main`
- Back-office : <https://pierrot-photo.vercel.app/admin/connexion>
- Aucun secret ni mot de passe administrateur n'est consigné ici.

## Stack et architecture

- Next.js avec App Router, TypeScript strict et Tailwind CSS.
- Supabase pour PostgreSQL, l'authentification administrateur et le stockage privé des images.
- Vercel pour l'hébergement de production.
- Les pages publiques lisent uniquement les catégories actives et les photos publiées.
- Les images sont servies depuis le bucket privé Supabase `portfolio` au moyen d'URL signées.
- Le back-office vérifie réellement la session Supabase côté serveur et l'appartenance à `admin_users`.
- Il n'existe aucune inscription publique.

Flux simplifié :

```text
Visiteur -> pages Next.js -> photos publiées + catégories actives -> Supabase
Admin -> /admin/connexion -> Supabase Auth -> contrôle admin_users -> API admin
API admin -> base PostgreSQL + bucket privé portfolio
GitHub main -> déploiement Vercel (connexion automatique encore à finaliser)
```

Le README principal contient aussi des schémas Mermaid de l'architecture et des données.

## Fonctionnalités livrées

### Site public

- Accueil éditorial responsive, galeries Shooting, Spectacle vivant et Sport.
- La catégorie Urbain a été désactivée proprement : elle ne paraît plus sur le site ni dans le back-office.
- Galeries responsives, lightbox, clavier, Échap et interactions mobiles.
- Contact, mentions légales, confidentialité, SEO, sitemap, robots, données structurées et page 404.
- Les légendes des photos ne sont plus affichées publiquement, mais restent stockées en base et modifiables dans l'administration.
- Le texte alternatif reste utilisé pour l'accessibilité.
- Les photos placées sur l'accueil sont exclues des galeries publiques, notamment de Shooting.

### Page d'accueil configurable

L'administrateur peut choisir précisément une photo pour chacun des dix emplacements :

- `hero`
- `about`
- `skills-1`
- `skills-2`
- `skills-3`
- `skills-4`
- `quote`
- `universe-shooting`
- `universe-spectacle-vivant`
- `universe-sport`

Ces affectations sont enregistrées dans `home_photo_slots`.

### Administration

- Connexion et déconnexion.
- Ajout multiple par sélection ou glisser-déposer avec progression.
- Conversion WebP, contrôle du type réel, orientation, dimensions et limites de poids.
- Catégorie, texte alternatif, légende, publication/masquage, déplacement et suppression confirmée.
- Réorganisation par glisser-déposer.
- Choix de l'image principale d'une page galerie.
- Affectation précise des images de la page d'accueil.
- Prévisualisation et messages d'erreur ou de réussite.

Le bouton anciennement ambigu « Mettre en couverture » est désormais présenté comme « Image principale de la page galerie ». Il agit sur la page galerie, pas sur l'accueil. Les images de l'accueil se règlent dans « Page de présentation ».

## Supabase

- Projet : `Bousquet-DEV`
- Référence : `lccbsqjxojflnejjahfv`
- Les migrations se trouvent dans `supabase/migrations/`.
- La migration `202609150001_home_slots_and_remove_urbain.sql` a déjà été exécutée avec succès en production.
- Ne pas la relancer aveuglément.
- Urbain est conservé en base mais avec `is_active = false`; ses photos ont été dépubliées.
- Les politiques RLS limitent la lecture publique aux photos publiées des catégories actives.
- Les écritures sont réservées aux administrateurs authentifiés.
- Les règles couvrent aussi le bucket Storage privé.
- Ne jamais placer une clé `service_role` dans le navigateur, GitHub ou Vercel côté public.

Configuration Auth déjà appliquée :

```text
Site URL     https://pierrot-photo.vercel.app
Redirect URL https://pierrot-photo.vercel.app/**
```

Variables attendues, sans exposer leur valeur :

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
```

En production, `NEXT_PUBLIC_SITE_URL` vaut `https://pierrot-photo.vercel.app`.

## Vercel

- Équipe : `laloutre404s-projects`
- Projet : `pierrot-photo`
- Project ID : `prj_vPOQOjhQqM75JGZ9pcbiGmXvCVY8`
- Le dossier local `.vercel/` lie déjà le dépôt au bon projet et reste ignoré par Git.
- Le framework Vercel est configuré sur Next.js et Node.js 22.x.
- Le déploiement de production a réussi ; l'accueil, `/galerie/shooting` et `/admin/connexion` ont répondu en HTTP 200.

Déploiement manuel possible depuis la racine :

```bash
npx --yes vercel@latest deploy --prod --yes
```

Point restant : la connexion GitHub automatique de Vercel n'a pas pu être autorisée en CLI. Le message indiquait que Vercel n'avait pas accès au dépôt. Il faut, si souhaité, installer/autoriser l'intégration GitHub Vercel pour `LaLoutre404/Pierrot-Photo`. Le déploiement manuel fonctionne déjà.

## Fichiers importants

```text
app/page.tsx                              accueil
app/galerie/[slug]/page.tsx               pages galerie
app/admin/connexion/page.tsx              connexion admin
app/api/admin/home-slots/route.ts          emplacements de l'accueil
app/api/admin/photos/                      gestion des photos
components/admin-dashboard.tsx             interface d'administration
components/photo-gallery.tsx               galerie et lightbox
components/photo-frame.tsx                 rendu d'une photographie
content/site.ts                            textes et coordonnées centralisés
lib/home-slots.ts                          définition des dix emplacements
lib/photos.ts                              lecture et préparation des photos
lib/types.ts                               types applicatifs
supabase/migrations/                       schéma, fonctions et politiques RLS
scripts/import-initial-photos.ts           import initial documenté
docs/screenshots/                          contrôles visuels desktop/mobile
README.md                                  installation et exploitation complètes
```

## Commandes utiles

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run build -- --webpack
```

Dernières validations réussies avant déploiement :

- lint ;
- vérification TypeScript ;
- 5 tests sur 5 ;
- build de production local avec Webpack ;
- build Next.js natif sur Vercel ;
- contrôles visuels en 390 × 844 et 1440 × 900.

## Éléments encore attendus du client

- Logo définitif, la signature « Studio Pierro » restant temporaire.
- Informations légales marquées `À COMPLÉTER PAR LE CLIENT`.
- Éventuels vrais avis clients ; aucun faux témoignage n'a été ajouté.
- Éventuels nouveaux textes ou photographies, à administrer depuis le back-office.

## Règles pour la prochaine intervention

1. Ne jamais afficher ni committer `.env.local` ou une clé Supabase secrète.
2. Créer une nouvelle migration pour toute évolution de base ; ne pas modifier l'historique déjà appliqué.
3. Conserver Urbain désactivé tant que le client ne demande pas explicitement son retour.
4. Préserver la distinction entre image principale de galerie et emplacements de l'accueil.
5. Pour une petite modification, lancer d'abord les contrôles ciblés, puis lint/typecheck/tests/build une seule fois avant livraison ou déploiement.
6. Respecter les instructions les plus récentes du propriétaire concernant Git et le déploiement.

## Prompt court à utiliser dans une nouvelle conversation

> Lis `transmission.md`, puis traite ma nouvelle demande à partir de l'état actuel du projet. Ne recommence pas les travaux déjà validés. Garde les actions et comptes rendus courts, et demande seulement si une décision métier manque réellement.
