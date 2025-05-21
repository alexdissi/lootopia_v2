import { Button } from "@/components/ui/button";
import { Steps } from "@/components/ui/steps";
import Link from "next/link";

const steps = [
  {
    title: "Créez votre compte",
    description:
      "Inscrivez-vous gratuitement et personnalisez votre profil d'aventurier.",
    image:
      "https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=2670&auto=format&fit=crop",
    alt: "Création de compte utilisateur sur ordinateur",
  },
  {
    title: "Trouvez une chasse",
    description:
      "Explorez la carte pour découvrir les chasses à proximité ou créez votre propre aventure.",
    image:
      "https://images.unsplash.com/photo-1484910292437-025e5d13ce87?q=80&w=1788&auto=format&fit=crop",
    alt: "Carte d'exploration avec points d'intérêt",
  },
  {
    title: "Partez à l'aventure",
    description:
      "Suivez les indices, résolvez les énigmes et cherchez les trésors cachés.",
    image:
      "https://images.unsplash.com/photo-1509909756405-be0199881695?q=80&w=2670&auto=format&fit=crop",
    alt: "Personne explorant la nature avec une boussole",
  },
  {
    title: "Récoltez vos récompenses",
    description:
      "Gagnez des artefacts uniques et des Couronnes pour débloquer encore plus d'aventures.",
    image:
      "https://images.unsplash.com/photo-1614812513172-567d2fe96a75?q=80&w=2670&auto=format&fit=crop",
    alt: "Collection de pièces et trésors anciens",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="comment-ca-marche"
      className="section-container bg-lootopia-navy/5 dark:bg-lootopia-navy/20 py-20"
    >
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl mb-6">
          Comment fonctionne Lootopia ?
        </h2>
        <p className="text-lg text-foreground/80">
          Suivez ces étapes simples pour commencer votre aventure et découvrir
          des trésors cachés.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Steps
          items={steps.map((step, index) => ({
            title: step.title,
            description: step.description,
            icon: (index + 1).toString(),
          }))}
        />
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg shadow-md transition-transform hover:scale-105 duration-300 bg-card dark:bg-card/80 border border-border"
          >
            <div className="absolute top-0 left-0 bg-lootopia-gold text-lootopia-navy font-bold py-1 px-3 rounded-br-lg z-10">
              {index + 1}
            </div>
            <div className="relative">
              <img
                src={step.image}
                alt={step.alt}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/40"></div>
            </div>
            <div className="p-4">
              <h3 className="font-adventure text-xl mb-1 text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link href="/auth/register">
          <Button className="treasure-button text-lg">
            Créer mon compte gratuitement
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default HowItWorks;
