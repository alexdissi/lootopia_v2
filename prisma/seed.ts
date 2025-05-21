import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Démarrage du seed de la boutique...");

  // Nettoyer les tables liées à la boutique
  console.log("Nettoyage des données de la boutique...");
  await prisma.userItem.deleteMany({});
  await prisma.shopItem.deleteMany({});
  
  console.log("Tables de la boutique nettoyées");

  // Seed des articles de la boutique
  console.log("Création des articles de la boutique...");
  
  const shopItems = await prisma.shopItem.createMany({
    data: [
      {
        name: "Double Artefact",
        description: "Double le nombre d'artefacts trouvés pendant 24 heures",
        price: 80,
        type: "BOOST",
        imageUrl: "https://images.unsplash.com/photo-1602024242516-fbc9d4fda4b6?q=80&w=1200",
      },
      {
        name: "Radar Amélioré",
        description: "Détecte les chasses dans un rayon plus large pendant 7 jours",
        price: 150,
        type: "BOOST",
        imageUrl: "https://images.unsplash.com/photo-1543652046-c00772d8bac3?q=80&w=1200",
      },
      {
        name: "Pack d'Indices",
        description: "5 indices supplémentaires à utiliser sur n'importe quelle chasse",
        price: 50,
        type: "HINT",
        imageUrl: "https://images.unsplash.com/photo-1553484771-0a615f264d58?q=80&w=1200",
      },
      {
        name: "Badge Explorer",
        description: "Badge exclusif à afficher sur votre profil",
        price: 30,
        type: "COSMETIC",
        imageUrl: "https://images.unsplash.com/photo-1584623928301-17c53555abdf?q=80&w=1200",
      },
      {
        name: "Badge Aventurier",
        description: "Badge premium pour les aventuriers chevronnés",
        price: 60,
        type: "COSMETIC",
        imageUrl: "https://images.unsplash.com/photo-1623039405147-547794f92e9e?q=80&w=1200",
      },
      {
        name: "Accès VIP",
        description: "Accès à des chasses exclusives pendant 30 jours",
        price: 200,
        type: "SPECIAL_ACCESS",
        imageUrl: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?q=80&w=1200",
      },
      {
        name: "Boost de Couronnes",
        description: "Gagnez 50% de couronnes supplémentaires pendant 3 jours",
        price: 120,
        type: "BOOST",
        imageUrl: "https://images.unsplash.com/photo-1589740986324-5a8fbc2a75e5?q=80&w=1200",
      },
      {
        name: "Révélateur de Secrets",
        description: "Révèle automatiquement un indice caché par chasse",
        price: 75,
        type: "HINT",
        imageUrl: "https://images.unsplash.com/photo-1512236040036-3ffc76721713?q=80&w=1200",
      },
    ],
  });
  
  console.log(`✅ ${shopItems.count} articles de boutique créés`);
  console.log("Seed terminé avec succès!");
}

main()
  .catch((e) => {
    console.error("Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });