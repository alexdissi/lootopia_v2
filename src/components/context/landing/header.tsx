import { Map } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-sm shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Map className="text-lootopia-gold h-8 w-8" />
          <span className="font-adventure text-2xl text-lootopia-navy">
            Lootopia
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#fonctionnalites"
            className="text-lootopia-navy hover:text-lootopia-gold transition-colors"
          >
            Fonctionnalités
          </a>
          <a
            href="#comment-ca-marche"
            className="text-lootopia-navy hover:text-lootopia-gold transition-colors"
          >
            Comment ça marche
          </a>
          <a
            href="#communaute"
            className="text-lootopia-navy hover:text-lootopia-gold transition-colors"
          >
            Communauté
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            className="hidden sm:flex border-lootopia-gold text-lootopia-navy hover:bg-lootopia-gold/10"
          >
            <Link href="/auth/login">Se connecter</Link>
          </Button>
          <Button className="bg-lootopia-gold hover:bg-lootopia-gold/80 text-lootopia-navy">
            <Link href="/auth/register">S&apos;'inscrire</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
