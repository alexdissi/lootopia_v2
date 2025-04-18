import { RegisterForm } from "@/components/context/auth/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte",
};

export default function LoginPage() {
  return <RegisterForm />;
}
