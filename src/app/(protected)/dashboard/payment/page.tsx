import { Suspense } from "react";
import PricingComponent from "@/components/pricing/pricing-components";
import { PaymentModalWrapper } from "@/components/pricing/payment-modal";

export default function PricingPage({
  searchParams,
}: {
  searchParams: { payment?: string };
}) {
  const paymentStatus = searchParams.payment as "success" | "cancel" | null;

  const packs = [
    {
      id: "price_1RR6xvHvWY7Zh28WVP63Kfgn",
      label: "Pack Découverte",
      description: "Parfait pour commencer l'aventure",
      amount: 1.49,
      artefacts: 10,
    },
    {
      id: "price_1RR6yIHvWY7Zh28WodSNOitz",
      label: "Pack Aventurier",
      description: "Un petit coup de pouce pour progresser",
      amount: 3.49,
      artefacts: 25,
    },
    {
      id: "price_1RR6yqHvWY7Zh28WoZB06awG",
      label: "Pack Explorateur",
      description: "Idéal pour les chasseurs réguliers",
      amount: 6.49,
      artefacts: 50,
    },
    {
      id: "price_1RR6zFHvWY7Zh28WgSiPWOPy",
      label: "Pack Maître",
      description: "Devenez un expert des chasses",
      amount: 11.99,
      artefacts: 100,
      popular: true,
    },
    {
      id: "price_1RR6zeHvWY7Zh28Wpj9sfP8z",
      label: "Pack Légende",
      description: "Pour les plus ambitieux",
      amount: 99.99,
      artefacts: 1000,
    },
  ];

  return (
    <>
      <PricingComponent packs={packs} />
      <Suspense fallback={null}>
        {paymentStatus && <PaymentModalWrapper paymentStatus={paymentStatus} />}
      </Suspense>
    </>
  );
}
