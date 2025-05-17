"use client";

import { Check, Coins, Crown, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Pack = {
  id: string;
  label: string;
  description: string;
  amount: number;
  artefacts: number;
  popular?: boolean;
};

export default function PricingComponent({ packs }: { packs: Pack[] }) {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleBuy = async (priceId: string, currencyAmount: number) => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId,
        currencyAmount,
      }),
    });

    console.log(priceId, currencyAmount);

    const { url } = await res.json();
    router.push(url);
  };

  const getIconForPack = (index: number) => {
    if (index === 0) return <Coins className="h-8 w-8 text-amber-500" />;
    if (index === 1) return <Star className="h-8 w-8 text-purple-500" />;
    return <Crown className="h-8 w-8 text-yellow-500" />;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-16 px-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-700 blur-3xl"></div>
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-amber-500 blur-3xl"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-blue-600 blur-3xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Achetez des{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-500">
              Artefacts
            </span>
          </h2>
          <p className="text-xl text-gray-300 mt-4 max-w-2xl mx-auto">
            Augmentez vos chances de découvrir des trésors rares et devenez un
            maître de la chasse
          </p>
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center rounded-full px-4 py-1 bg-purple-900/30 border border-purple-500/20">
              <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-sm text-purple-300">
                Offre limitée: Bonus de 10% sur tous les packs
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packs.map((pack, index) => (
            <Card
              key={pack.id}
              className={cn(
                "flex flex-col border-0 bg-gradient-to-b transition-all duration-300 relative overflow-hidden",
                pack.popular
                  ? "from-purple-900/80 to-purple-950/90 shadow-lg shadow-purple-500/20"
                  : "from-gray-800/80 to-gray-900/90 shadow-lg",
                hoveredCard === pack.id && "scale-105 shadow-xl",
                hoveredCard === pack.id &&
                  pack.popular &&
                  "shadow-purple-500/30"
              )}
              onMouseEnter={() => setHoveredCard(pack.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className={cn(
                  "absolute inset-0 opacity-0 transition-opacity duration-300",
                  hoveredCard === pack.id && "opacity-100"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm"></div>
              </div>

              {pack.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-purple-400 text-white px-4 py-1 text-sm font-bold rounded-bl-lg z-10">
                  POPULAIRE
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div
                  className={cn(
                    "mx-auto p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 transition-all duration-300",
                    pack.popular
                      ? "bg-purple-900/50 border border-purple-500/30"
                      : "bg-gray-800/50 border border-gray-700/30",
                    hoveredCard === pack.id && "scale-110"
                  )}
                >
                  {getIconForPack(index)}
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  {pack.label}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {pack.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center flex-grow pt-4">
                <div className="flex justify-center items-baseline my-6">
                  <span
                    className={cn(
                      "text-6xl font-extrabold transition-all duration-300",
                      pack.popular ? "text-purple-300" : "text-white",
                      hoveredCard === pack.id && "scale-110"
                    )}
                  >
                    {pack.artefacts}
                  </span>
                  <span className="ml-2 text-xl text-gray-400">artefacts</span>
                </div>

                <ul className="space-y-3 mt-6">
                  <li className="flex items-center justify-center">
                    <div
                      className={cn(
                        "flex items-center justify-center w-5 h-5 rounded-full mr-2",
                        pack.popular ? "bg-purple-500" : "bg-green-500"
                      )}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-300">Accès aux chasses</span>
                  </li>
                  <li className="flex items-center justify-center">
                    <div
                      className={cn(
                        "flex items-center justify-center w-5 h-5 rounded-full mr-2",
                        pack.popular ? "bg-purple-500" : "bg-green-500"
                      )}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-300">Indices exclusifs</span>
                  </li>
                  {pack.popular && (
                    <li className="flex items-center justify-center">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full mr-2 bg-purple-500">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-300">Support prioritaire</span>
                    </li>
                  )}
                </ul>
              </CardContent>

              <CardFooter className="pt-4 pb-8 flex-col">
                <Button
                  className={cn(
                    "w-full py-6 text-lg font-bold transition-all duration-300 relative overflow-hidden group",
                    pack.popular
                      ? "bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300 text-white"
                      : "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white"
                  )}
                  onClick={() => handleBuy(pack.id, pack.artefacts)}
                >
                  <span className="relative z-10">
                    Acheter pour {pack.amount.toFixed(2)} €
                  </span>
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                </Button>

                <p className="w-full text-center text-xs text-gray-500 mt-3">
                  Paiement sécurisé • Remboursement sous 30 jours
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400 max-w-2xl mx-auto">
            Rejoignez plus de 10,000 chasseurs de trésors qui ont déjà découvert
            des artefacts rares grâce à nos packs premium.
          </p>
        </div>
      </div>
    </div>
  );
}
