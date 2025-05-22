import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    name: "Sophie L.",
    role: "Organisatrice",
    avatar: "/avatar1.webp",
    quote:
      "J'ai créé une chasse au trésor pour l'anniversaire de mon fils. Les outils sont intuitifs et les enfants ont adoré suivre la carte interactive !",
  },
  {
    name: "Thomas D.",
    role: "Joueur passionné",
    avatar: "/avatar2.webp",
    quote:
      "Lootopia a transformé mes balades du weekend en véritables aventures. J'ai déjà collecté plus de 20 artefacts rares !",
  },
  {
    name: "Marie F.",
    role: "Enseignante",
    avatar: "/avatar3.webp",
    quote:
      "J'utilise Lootopia pour créer des sorties éducatives ludiques. Mes élèves sont bien plus engagés quand l'apprentissage prend la forme d'une chasse au trésor.",
  },
  {
    name: "Lucas P.",
    role: "Guide touristique",
    avatar: "/avatar4.webp",
    quote:
      "J'ai créé des parcours touristiques originaux dans ma ville grâce à Lootopia. Les visiteurs adorent découvrir les lieux autrement !",
  },
];

const TestimonialsSection = () => (
  <section id="communaute" className="section-container">
    <div className="text-center max-w-3xl mx-auto mb-16">
      <h2 className="text-3xl md:text-4xl mb-6">
        Ce qu&apos;'en disent nos aventuriers
      </h2>
      <p className="text-lg text-foreground/80">
        Découvrez les témoignages de notre communauté de chasseurs de trésors et
        d&apos;'organisateurs.
      </p>
    </div>

    <div className="relative max-w-5xl mx-auto px-10">
      <Carousel className="w-full">
        <CarouselContent>
          {testimonials.map((testimonial, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
              <Card className="map-card h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar>
                      <AvatarImage
                        src={testimonial.avatar}
                        alt={testimonial.name}
                      />
                      <AvatarFallback className="bg-lootopia-gold text-lootopia-navy">
                        {testimonial.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-foreground/70">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  <blockquote className="flex-grow">
                    <p className="italic text-foreground/80">
                      {testimonial.quote}
                    </p>
                  </blockquote>

                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-lootopia-gold"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 -translate-x-1/2" />
        <CarouselNext className="right-0 translate-x-1/2" />
      </Carousel>
    </div>
  </section>
);

export default TestimonialsSection;
