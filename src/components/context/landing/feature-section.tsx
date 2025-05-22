import { Map, Calendar, Users, Coins, Award, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Explorez des chasses",
    description:
      "Parcourez et filtrez les chasses disponibles par lieu, durée ou récompense.",
    icon: Search,
  },
  {
    title: "Déchiffrez des énigmes",
    description:
      "Résolvez des énigmes captivantes et découvrez des caches secrètes.",
    icon: Map,
  },
  {
    title: "Collectionnez des artefacts",
    description:
      "Gagnez des objets virtuels rares classés par niveau de rareté.",
    icon: Award,
  },
  {
    title: "Créez vos chasses",
    description:
      "Concevez des parcours personnalisés avec des étapes, des indices et des cartes interactives.",
    icon: Calendar,
  },
  {
    title: "Rejoignez la communauté",
    description:
      "Participez à des événements spéciaux et rencontrez d'autres aventuriers.",
    icon: Users,
  },
  {
    title: "Économie virtuelle",
    description:
      "Gagnez et dépensez des Couronnes pour accéder à des bonus exclusifs.",
    icon: Coins,
  },
];

const FeaturesSection = () => (
  <section id="fonctionnalites" className="section-container">
    <div className="text-center max-w-3xl mx-auto mb-16">
      <h2 className="text-3xl md:text-4xl mb-6">
        Une aventure complète à portée de main
      </h2>
      <p className="text-lg text-foreground/80">
        Lootopia offre une expérience riche et immersive, combinant technologie
        et exploration du monde réel.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <Card
          key={index}
          className="map-card hover:shadow-lg transition-shadow"
        >
          <CardHeader className="pb-2">
            <div className="feature-icon-container">
              <feature.icon className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl">{feature.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-foreground/70 text-base">
              {feature.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
);

export default FeaturesSection;
