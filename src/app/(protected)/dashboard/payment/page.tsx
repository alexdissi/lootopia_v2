import PricingComponent from "@/components/pricing/pricing-components";

export default function PricingPage() {
  const packs = [
    {
      id: "price_1RFtMsHvWY7Zh28WmuSVahJZ",
      label: "Pack Basique",
      description: "Pour les aventuriers débutants",
      amount: 4.99,
      artefacts: 150,
    },
    {
      id: "price_1RFtNYHvWY7Zh28WAFaQSvB5",
      label: "Pack Aventurier",
      description: "Pour les chasseurs expérimentés",
      amount: 14.99,
      artefacts: 500,
      popular: true,
    },
    {
      id: "price_1RFtOAHvWY7Zh28WepLKqAkf",
      label: "Pack Trésorier",
      description: "Pour les maîtres de la chasse",
      amount: 24.99,
      artefacts: 1000,
    },
  ];

  return <PricingComponent packs={packs} />;
}
