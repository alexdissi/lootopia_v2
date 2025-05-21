import { Button } from "@/components/ui/button";
import { MapView } from "@/components/ui/maps";
import { ArrowRight, Map as MapIcon } from "lucide-react";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/treasure-map-bg.webp')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
      </div>

      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center relative z-10">
        <div className="lg:w-1/2 lg:pr-16 mb-10 lg:mb-0 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            Partez à l'aventure avec{" "}
            <span className="text-lootopia-gold inline-block animate-float">
              Lootopia
            </span>
          </h1>

          <p className="text-lg md:text-xl mb-8 text-foreground/80 max-w-lg mx-auto lg:mx-0">
            Une plateforme de chasses au trésor immersives où vous pouvez
            participer, créer et partager des aventures uniques dans le monde
            réel.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
            <Button className="treasure-button px-8 py-6 text-lg">
              <Link href="/auth/register">Commencer l'aventure</Link>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              className="border-lootopia-gold text-lootopia-navy hover:bg-lootopia-gold/10 px-8 py-6 text-lg"
            >
              En savoir plus
            </Button>
          </div>
        </div>

        <div className="lg:w-1/2 relative">
          <div className="relative w-full max-w-lg mx-auto">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-lootopia-gold via-lootopia-brown to-lootopia-gold opacity-30 blur-lg"></div>
            <MapView location="Paris" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default HeroSection;
