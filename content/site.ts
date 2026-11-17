import type { CategorySlug } from "@/lib/types";

export const siteConfig = {
  name: "Pierre Bousquet",
  studioName: "Studio Pierro",
  title: "Photographe — Pierre Bousquet",
  description:
    "Portfolio de Pierre Bousquet, photographe de portraits, spectacle vivant et sport.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phoneDisplay: "06 77 83 75 54",
  phoneHref: "+33677837554",
  email: "pbousquet.photo@gmail.com",
  instagramHandle: "pierro_photo_",
  instagramUrl: "https://www.instagram.com/pierro_photo_/",
  googleReviewsUrl: "https://share.google/wp1jlRRDwnxNFTcJP",
  googleWriteReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJ0yDGy0yJ0GUR-lPbukv619k",
  legal: {
    address: "À COMPLÉTER PAR LE CLIENT",
    siret: "À COMPLÉTER PAR LE CLIENT",
    publicationDirector: "À COMPLÉTER PAR LE CLIENT",
    host: "À COMPLÉTER PAR LE CLIENT",
  },
} as const;

export const about = {
  title: "À propos de moi",
  paragraphs: [
    "Animé par la volonté de capturer l’authenticité de chaque instant, j’aborde la photographie comme un art de mise en valeur et de transmission. Spécialisé dans la photographie sportive, événementielle et de portrait, je m’attache à révéler l’identité et la singularité de chaque sujet. Mon sens du détail et mon approche créative me permettent de raconter des histoires à travers l’image, en saisissant des émotions vraies et des moments éphémères pour en faire des souvenirs durables.",
    "Mon approche photographique repose sur l’équilibre entre la lumière naturelle et des compositions maîtrisées, afin de créer des images qui traduisent à la fois l’authenticité et la spontanéité de mes sujets. Qu’il s’agisse d’immortaliser l’intensité d’un regard, la complicité d’un couple, la joie d’une famille ou la beauté d’un moment, je conçois chaque photographie comme un souvenir précieux, alliant élégance et sincérité.",
  ],
};

export const skills = [
  "Maîtrise de la prise de vue",
  "Sens artistique développé",
  "Post-traitement professionnel",
  "Adaptabilité en toute situation",
] as const;

export const quote = {
  text: "La photographie, c’est l’art de montrer de combien d’instants éphémères la vie est faite.",
  author: "Marcel Proust",
} as const;

export const categoryContent: Record<
  CategorySlug,
  {
    title: string;
    shortTitle: string;
    description: string;
    themeColor: string;
    textColor: string;
    eyebrow: string;
  }
> = {
  shooting: {
    title: "Shooting",
    shortTitle: "Portraits",
    eyebrow: "Portrait · Extérieur",
    themeColor: "#e6c99c",
    textColor: "#2b2927",
    description:
      "Chaque séance photo est une rencontre, un échange destiné à mettre en lumière votre personnalité et votre singularité. Que ce soit pour un portrait artistique, un projet professionnel ou un souvenir personnel, j’accorde une attention particulière à vos attentes et à l’atmosphère que vous souhaitez transmettre. Le résultat : des images authentiques, élégantes et uniques, qui vous ressemblent pleinement.",
  },
  "spectacle-vivant": {
    title: "Spectacle vivant",
    shortTitle: "Sur scène",
    eyebrow: "Concert · Théâtre · Événement",
    themeColor: "#f0d8a8",
    textColor: "#302b26",
    description:
      "Sur scène, chaque détail compte : un regard, une posture, un jeu de lumière. Mon approche consiste à capter l’essence même de la performance, qu’il s’agisse d’un concert, d’une pièce de théâtre ou d’un événement culturel. J’aime retranscrire la puissance des émotions et l’ambiance singulière du spectacle, afin d’en prolonger la magie bien au-delà du moment vécu.",
  },
  sport: {
    title: "Sport",
    shortTitle: "En mouvement",
    eyebrow: "Intensité · Énergie · Dépassement",
    themeColor: "#a85b1d",
    textColor: "#fff7ed",
    description:
      "La photographie sportive demande une grande réactivité et une attention particulière aux détails. Mon objectif est de figer l’intensité du mouvement et l’émotion de l’instant, qu’il s’agisse d’un geste technique, d’une expression de concentration ou de la célébration d’une victoire. Chaque image devient ainsi le reflet de l’énergie, de la passion et du dépassement de soi propres aux athlètes.",
  },
};

export const categorySlugs = Object.keys(categoryContent) as CategorySlug[];

export const contactIntro =
  "À l’écoute de vos projets, qu’ils soient personnels, artistiques ou professionnels, j’aborde chaque collaboration comme une opportunité de donner vie à des images uniques et empreintes de sens. Je vous invite à me contacter pour échanger autour de vos besoins et envisager ensemble la meilleure façon de concrétiser vos idées.";
