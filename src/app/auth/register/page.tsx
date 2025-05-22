import type { Metadata } from "next";
import { RegisterForm } from "@/components/context/auth/register-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte",
};

export default function LoginPage() {
  return <RegisterForm />;
}
