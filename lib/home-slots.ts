export const HOME_PHOTO_SLOTS = [
  {
    key: "hero",
    group: "Ouverture",
    label: "Bannière Portfolio",
    description: "Grande photographie noir et blanc affichée en tête de la page.",
  },
  {
    key: "about",
    group: "Présentation",
    label: "Portrait — À propos",
    description: "Portrait de Pierre placé à gauche du texte de présentation.",
  },
  {
    key: "skills-1",
    group: "Compétences",
    label: "Compétences — image 1",
    description: "Première image de la rangée éditoriale.",
  },
  {
    key: "skills-2",
    group: "Compétences",
    label: "Compétences — image 2",
    description: "Deuxième image de la rangée éditoriale.",
  },
  {
    key: "skills-3",
    group: "Compétences",
    label: "Compétences — image 3",
    description: "Troisième image de la rangée éditoriale.",
  },
  {
    key: "skills-4",
    group: "Compétences",
    label: "Compétences — image 4",
    description: "Quatrième image de la rangée éditoriale.",
  },
  {
    key: "quote",
    group: "Citation",
    label: "Bandeau Marcel Proust",
    description: "Photographie panoramique derrière la citation.",
  },
  {
    key: "universe-shooting",
    group: "Univers",
    label: "Couverture Shooting",
    description: "Vignette de l’univers Shooting sur la page d’accueil.",
  },
  {
    key: "universe-spectacle-vivant",
    group: "Univers",
    label: "Couverture Spectacle vivant",
    description: "Vignette de l’univers Spectacle vivant sur la page d’accueil.",
  },
  {
    key: "universe-sport",
    group: "Univers",
    label: "Couverture Sport",
    description: "Vignette de l’univers Sport sur la page d’accueil.",
  },
] as const;

export type HomePhotoSlotKey = (typeof HOME_PHOTO_SLOTS)[number]["key"];

export const HOME_PHOTO_SLOT_KEYS = HOME_PHOTO_SLOTS.map((slot) => slot.key);

export const HOME_UNIVERSE_SLOTS = {
  shooting: "universe-shooting",
  "spectacle-vivant": "universe-spectacle-vivant",
  sport: "universe-sport",
} as const satisfies Record<string, HomePhotoSlotKey>;
