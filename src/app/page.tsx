"use client";

import CTASection from "@/components/context/landing/cta-action";
import FeaturesSection from "@/components/context/landing/feature-section";
import Footer from "@/components/context/landing/footer";
import Header from "@/components/context/landing/header";
import HeroSection from "@/components/context/landing/hero-section";
import HowItWorks from "@/components/context/landing/how-to-works";
import TestimonialsSection from "@/components/context/landing/testimonials";

export default function Home() {
  return (
    <main className="flex flex-col mx-5">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </main>
  );
}
