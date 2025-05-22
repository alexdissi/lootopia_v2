// src/app/auth/login/page.tsx
import type { Metadata } from "next";
import { LoginForm } from "@/components/context/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte",
};

export default function LoginPage() {
  return <LoginForm />;
}
