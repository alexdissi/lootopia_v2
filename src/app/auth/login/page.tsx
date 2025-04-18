import { LoginForm } from "@/components/context/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez un nouveau compte",
};

export default function LoginPage() {
  return <LoginForm />;
}
