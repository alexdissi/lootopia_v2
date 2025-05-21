import { Button } from "@/components/ui/button";
import { Coins, Award, Map as MapIcon } from "lucide-react";

const CTASection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-lootopia-navy opacity-95 z-0">
        <div className="absolute inset-0 bg-[url('/treasure-map-bg.webp')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8 flex justify-center space-x-4">
            <div className="bg-lootopia-gold/20 p-4 rounded-full">
              <MapIcon className="h-10 w-10 text-lootopia-gold" />
            </div>
            <div className="bg-lootopia-gold/20 p-4 rounded-full">
              <Award className="h-10 w-10 text-lootopia-gold" />
            </div>
            <div className="bg-lootopia-gold/20 p-4 rounded-full">
              <Coins className="h-10 w-10 text-lootopia-gold" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-adventure text-lootopia-gold mb-6">
            Commencez votre aventure dès maintenant
          </h2>

          <p className="text-lg md:text-xl text-white/80 mb-10">
            Rejoignez des milliers d'aventuriers et partez à la découverte de
            trésors cachés. Créez votre compte gratuitement et explorez votre
            première chasse au trésor aujourd'hui !
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              size="lg"
              className="treasure-button text-lg bg-lootopia-gold hover:bg-lootopia-gold/90 text-lootopia-navy px-8 py-6"
            >
              S'inscrire gratuitement
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-lg border-lootopia-gold text-white hover:bg-lootopia-gold/10 px-8 py-6"
            >
              En savoir plus
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
