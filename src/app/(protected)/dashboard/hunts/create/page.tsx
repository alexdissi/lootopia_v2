import { Metadata } from "next";
import { CreateHuntForm } from "@/components/context/hunts/create-hunt-form";

export const metadata: Metadata = {
  title: "Créer une chasse au trésor",
  description: "Créez une nouvelle chasse au trésor pour vos participants",
};

export default function CreateHuntPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Créer une chasse au trésor</h1>
      <CreateHuntForm />
    </div>
  );
}
