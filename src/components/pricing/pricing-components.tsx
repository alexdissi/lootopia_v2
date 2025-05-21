"use client";

import { Check, Coins, Crown, Sparkles, Star, Zap, Shield } from "lucide-react";
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
import { motion } from "framer-motion";
import { AvatarCircles } from "../magicui/avatar-circles";

type Pack = {
  id: string;
  label: string;
  description: string;
  amount: number;
  artefacts: number;
  popular?: boolean;
};

const avatars = [
  {
    imageUrl: "/alexis.jpeg",
    profileUrl: "https://www.linkedin.com/in/alexis-duchemann/",
  },
  {
    imageUrl: "/emmanuel.jpeg",
    profileUrl: "#emmanuel",
  },
  {
    imageUrl: "/enzo.jpeg",
    profileUrl: "https://www.instagram.com/ifbwima/",
  },
];

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

    const { url } = await res.json();
    router.push(url);
  };

  const getIconForPack = (index: number) => {
    switch (index) {
      case 0:
        return <Coins className="h-8 w-8 text-amber-400" />;
      case 1:
        return <Star className="h-8 w-8 text-emerald-400" />;
      case 2:
        return <Zap className="h-8 w-8 text-sky-400" />;
      case 3:
        return <Crown className="h-8 w-8 text-purple-400" />;
      case 4:
        return <Shield className="h-8 w-8 text-rose-400" />;
      default:
        return <Coins className="h-8 w-8 text-amber-400" />;
    }
  };

  const getGradientForPack = (
    index: number,
    isPopular: boolean | undefined
  ) => {
    if (isPopular)
      return "from-purple-900/80 to-purple-950/90 shadow-lg shadow-purple-500/20";

    switch (index) {
      case 0:
        return "from-amber-950/80 to-amber-900/30 shadow-amber-500/10";
      case 1:
        return "from-emerald-950/80 to-emerald-900/30 shadow-emerald-500/10";
      case 2:
        return "from-sky-950/80 to-sky-900/30 shadow-sky-500/10";
      case 3:
        return "from-purple-950/80 to-purple-900/30 shadow-purple-500/10";
      case 4:
        return "from-rose-950/80 to-rose-900/30 shadow-rose-500/10";
      default:
        return "from-gray-800/80 to-gray-900/90";
    }
  };

  const getButtonGradient = (index: number, isPopular: boolean | undefined) => {
    if (isPopular)
      return "bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300 text-white";

    switch (index) {
      case 0:
        return "bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white";
      case 1:
        return "bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white";
      case 2:
        return "bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-600 hover:to-sky-500 text-white";
      case 3:
        return "bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white";
      case 4:
        return "bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white";
    }
  };

  const getIconBgColor = (index: number, isPopular: boolean | undefined) => {
    if (isPopular) return "bg-purple-900/50 border border-purple-500/30";

    switch (index) {
      case 0:
        return "bg-amber-900/50 border border-amber-500/30";
      case 1:
        return "bg-emerald-900/50 border border-emerald-500/30";
      case 2:
        return "bg-sky-900/50 border border-sky-500/30";
      case 3:
        return "bg-purple-900/50 border border-purple-500/30";
      case 4:
        return "bg-rose-900/50 border border-rose-500/30";
      default:
        return "bg-gray-800/50 border border-gray-700/30";
    }
  };

  const getCheckColor = (index: number, isPopular: boolean | undefined) => {
    if (isPopular) return "bg-purple-500";

    switch (index) {
      case 0:
        return "bg-amber-500";
      case 1:
        return "bg-emerald-500";
      case 2:
        return "bg-sky-500";
      case 3:
        return "bg-purple-500";
      case 4:
        return "bg-rose-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-16 px-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-700 blur-3xl"></div>
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-amber-500 blur-3xl"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-blue-600 blur-3xl"></div>
        <div className="absolute top-2/3 left-1/4 w-72 h-72 rounded-full bg-emerald-500 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-rose-600 blur-3xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4"
          >
            Achetez des{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-500 to-rose-400">
              Couronnes
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300 mt-4 max-w-2xl mx-auto"
          >
            Augmentez vos chances de découvrir des trésors rares et devenez un
            maître de la chasse
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex justify-center"
          >
            <div className="inline-flex items-center rounded-full px-4 py-1 bg-purple-900/30 border border-purple-500/20">
              <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-sm text-purple-300">
                Offre limitée: Bonus de 10% sur tous les packs
              </span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {packs.map((pack, index) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "flex flex-col h-full border-0 bg-gradient-to-b transition-all duration-300 relative overflow-hidden",
                  getGradientForPack(index, pack.popular),
                  hoveredCard === pack.id && "scale-105 shadow-xl z-10",
                  hoveredCard === pack.id &&
                    pack.popular &&
                    "shadow-purple-500/30"
                )}
                onMouseEnter={() => setHoveredCard(pack.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Hover effect */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 transition-opacity duration-300",
                    hoveredCard === pack.id && "opacity-100"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm"></div>
                </div>

                {/* Popular badge */}
                {pack.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-purple-400 text-white px-4 py-1 text-sm font-bold rounded-bl-lg z-10">
                    POPULAIRE
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div
                    className={cn(
                      "mx-auto p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 transition-all duration-300",
                      getIconBgColor(index, pack.popular),
                      hoveredCard === pack.id && "scale-110"
                    )}
                  >
                    {getIconForPack(index)}
                  </div>
                  <CardTitle className="text-xl font-bold text-white">
                    {pack.label}
                  </CardTitle>
                  <CardDescription className="text-gray-300 h-12 flex items-center justify-center">
                    {pack.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center flex-grow pt-4">
                  <div className="flex justify-center items-baseline my-6">
                    <span
                      className={cn(
                        "text-5xl font-extrabold transition-all duration-300",
                        pack.popular ? "text-purple-300" : "text-white",
                        hoveredCard === pack.id && "scale-110"
                      )}
                    >
                      {pack.artefacts}
                    </span>
                    <span className="ml-2 text-lg text-gray-400">
                      Couronnes
                    </span>
                  </div>

                  <ul className="space-y-3 mt-6">
                    <li className="flex items-center justify-center">
                      <div
                        className={cn(
                          "flex items-center justify-center w-5 h-5 rounded-full mr-2",
                          getCheckColor(index, pack.popular)
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
                          getCheckColor(index, pack.popular)
                        )}
                      >
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-300">Indices exclusifs</span>
                    </li>
                    {(pack.popular || index === 4) && (
                      <li className="flex items-center justify-center">
                        <div
                          className={cn(
                            "flex items-center justify-center w-5 h-5 rounded-full mr-2",
                            getCheckColor(index, pack.popular)
                          )}
                        >
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-300">
                          Support prioritaire
                        </span>
                      </li>
                    )}
                    {index === 4 && (
                      <li className="flex items-center justify-center">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full mr-2 bg-rose-500">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-300">Accès VIP</span>
                      </li>
                    )}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4 pb-6 flex-col">
                  <div className="text-2xl font-bold text-white mb-4">
                    {pack.amount.toFixed(2)} €
                  </div>
                  <Button
                    className={cn(
                      "w-full py-5 text-base font-bold transition-all duration-300 relative overflow-hidden group",
                      getButtonGradient(index, pack.popular)
                    )}
                    onClick={() => handleBuy(pack.id, pack.artefacts)}
                  >
                    <span className="relative z-10">Acheter</span>
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  </Button>

                  <p className="w-full text-center text-xs text-gray-500 mt-3">
                    Paiement sécurisé • Remboursement sous 30 jours
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <AvatarCircles numPeople={99} avatarUrls={avatars} />
            <p className="text-gray-300 max-w-2xl mx-auto">
              Rejoignez plus de{" "}
              <span className="font-bold text-white">
                10,000 chasseurs de trésors
              </span>{" "}
              qui ont déjà découvert des artefacts rares grâce à nos packs
              premium.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
