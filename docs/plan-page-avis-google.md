# Page d’avis Google

Mis à jour le 17 novembre 2026.

## Fonctionnement

La page [`/avis-clients`](../app/avis-clients/page.tsx) invite le visiteur à laisser un avis sur la fiche Google de Studio Pierro. Le bouton principal ouvre directement le formulaire d’avis :

`https://search.google.com/local/writereview?placeid=ChIJ0yDGy0yJ0GUR-lPbukv619k`

La page ne montre aucun compteur ni aucun avis inventé. Ses textes sont modifiables dans le back-office via [`lib/site-texts.ts`](../lib/site-texts.ts).

## Historique du choix

L’accès aux API Google Business Profile du projet Google Cloud a été refusé. Un widget Elfsight a été intégré puis retiré à la demande du propriétaire : il ne montrait aucune carte d’avis et ajoutait un module tiers sur la page. La solution actuelle repose sur des liens directs vers Google, sans script tiers.

Le lecteur paginé [`lib/google-business-reviews.ts`](../lib/google-business-reviews.ts) reste dans le projet à titre de travail antérieur, mais n’est pas appelé par la page.

## Vérifications

- Le lien principal ouvre le formulaire d’avis de Studio Pierro dans un nouvel onglet.
- La page reste lisible sur mobile et au clavier, sans débordement horizontal.
- La politique de confidentialité ne mentionne aucun widget d’avis supprimé.
