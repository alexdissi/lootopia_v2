// src/app/auth/login/page.tsx
import { LoginForm } from "@/components/context/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte",
};

export default function LoginPage() {
  return <LoginForm />;
}
