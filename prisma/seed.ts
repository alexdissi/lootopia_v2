import {
  PrismaClient,
  UserRole,
  HuntMode,
  HuntStatus,
  ArtefactRarity,
  ParticipationStatus,
  ShopItemType,
  CurrencySourceType,
  TransactionType,
  RewardType,
  ArtefactSource,
} from "../generated/prisma";

const prisma = new PrismaClient();

const villes = [
  "Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux", "Nantes", "Lille", "Strasbourg", "Nice", "Montpellier",
  "Rennes", "Grenoble", "Dijon", "Angers", "Reims", "Le Havre", "Saint-Étienne", "Toulon", "Clermont-Ferrand", "Nancy"
];

async function main() {
  console.log("Nettoyage complet des tables...");
  await prisma.craftMaterial.deleteMany();
  await prisma.craft.deleteMany();
  await prisma.transactionHistory.deleteMany();
  await prisma.virtualCurrency.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.participation.deleteMany();
  await prisma.artefact.deleteMany();
  await prisma.huntStep.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.userItem.deleteMany();
  await prisma.shopItem.deleteMany();
  await prisma.treasureHunt.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Utilisateurs
  console.log("Création des utilisateurs...");
  const users = await Promise.all(
    Array.from({ length: 20 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: `Utilisateur ${i + 1}`,
          email: `user${i + 1}@test.com`,
          emailVerified: true,
          image: `https://randomuser.me/api/portraits/men/${i}.jpg`,
          createdAt: new Date(Date.now() - (1000 * 60 * 60 * 24 * (30 - i))),
          updatedAt: new Date(),
          nickname: `nick${i + 1}`,
          role: i < 2 ? UserRole.ADMIN : i < 5 ? UserRole.ORGANIZER : UserRole.PLAYER,
          isMfaEnabled: i % 3 === 0,
        },
      })
    )
  );

  // Boutique
  console.log("Création des articles de la boutique...");
  await prisma.shopItem.createMany({
    data: [
      { name: "Double Artefact", description: "Double le nombre d'artefacts trouvés pendant 24 heures", price: 80, type: ShopItemType.BOOST, imageUrl: "https://images.unsplash.com/photo-1602024242516-fbc9d4fda4b6?q=80&w=1200" },
      { name: "Radar Amélioré", description: "Détecte les chasses dans un rayon plus large pendant 7 jours", price: 150, type: ShopItemType.BOOST, imageUrl: "https://images.unsplash.com/photo-1543652046-c00772d8bac3?q=80&w=1200" },
      { name: "Pack d'Indices", description: "5 indices supplémentaires à utiliser sur n'importe quelle chasse", price: 50, type: ShopItemType.HINT, imageUrl: "https://images.unsplash.com/photo-1553484771-0a615f264d58?q=80&w=1200" },
      { name: "Badge Explorer", description: "Badge exclusif à afficher sur votre profil", price: 30, type: ShopItemType.COSMETIC, imageUrl: "https://images.unsplash.com/photo-1584623928301-17c53555abdf?q=80&w=1200" },
      { name: "Badge Aventurier", description: "Badge premium pour les aventuriers chevronnés", price: 60, type: ShopItemType.COSMETIC, imageUrl: "https://images.unsplash.com/photo-1623039405147-547794f92e9e?q=80&w=1200" },
      { name: "Accès VIP", description: "Accès à des chasses exclusives pendant 30 jours", price: 200, type: ShopItemType.SPECIAL_ACCESS, imageUrl: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?q=80&w=1200" },
      { name: "Boost de Couronnes", description: "Gagnez 50% de couronnes supplémentaires pendant 3 jours", price: 120, type: ShopItemType.BOOST, imageUrl: "https://images.unsplash.com/photo-1589740986324-5a8fbc2a75e5?q=80&w=1200" },
      { name: "Révélateur de Secrets", description: "Révèle automatiquement un indice caché par chasse", price: 75, type: ShopItemType.HINT, imageUrl: "https://images.unsplash.com/photo-1512236040036-3ffc76721713?q=80&w=1200" },
      { name: "Couronne d'Or", description: "Couronne rare à collectionner", price: 300, type: ShopItemType.COSMETIC, imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200" },
      { name: "Potion Mystère", description: "Effet aléatoire sur votre prochaine chasse", price: 90, type: ShopItemType.BOOST, imageUrl: "https://images.unsplash.com/photo-1464983953574-0892a716854b?q=80&w=1200" },
    ],
  });
  const shopItemsDb = await prisma.shopItem.findMany();

  // Attribution d'items à chaque user
  for (const user of users) {
    await prisma.userItem.create({
      data: {
        userId: user.id,
        itemId: shopItemsDb[Math.floor(Math.random() * shopItemsDb.length)].id,
        quantity: Math.floor(Math.random() * 3) + 1,
        isActive: true,
      },
    });
  }

  // Chasses au trésor
  console.log("Création des chasses au trésor...");
  const hunts = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.treasureHunt.create({
        data: {
          title: `Chasse à ${villes[i]}`,
          description: `Une chasse au trésor palpitante dans la ville de ${villes[i]}`,
          createdById: users[i % users.length].id,
          startDate: new Date(Date.now() - (1000 * 60 * 60 * 24 * (10 - i))),
          endDate: new Date(Date.now() + (1000 * 60 * 60 * 24 * i)),
          location: villes[i],
          mode: i % 2 === 0 ? HuntMode.PUBLIC : HuntMode.PRIVATE,
          fee: i % 2 === 0 ? 0 : 50,
          mapStyle: "standard",
          isFinished: i % 3 === 0,
          status: i % 3 === 0 ? HuntStatus.COMPLETED : HuntStatus.IN_PROGRESS,
        },
      })
    )
  );

  // Artefacts pour chaque chasse
  for (const hunt of hunts) {
    for (let j = 0; j < 4; j++) {
      await prisma.artefact.create({
        data: {
          name: `Artefact ${hunt.title} #${j + 1}`,
          rarity: [ArtefactRarity.COMMON, ArtefactRarity.RARE, ArtefactRarity.EPIC, ArtefactRarity.LEGENDARY][j % 4],
          description: `Un artefact spécial pour ${hunt.title}`,
          imageUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=1200",
          isHidden: j % 2 === 0,
          source: ArtefactSource.CRAFT,
          user: {
            connect: { id: users[(hunt.id.charCodeAt(0) + j) % users.length].id }
          }
        },
      });
    }
  }

  // Participations
  for (const hunt of hunts) {
    for (let j = 0; j < 6; j++) {
      const user = users[(hunt.id.charCodeAt(1) + j) % users.length];
      await prisma.participation.create({
        data: {
          userId: user.id,
          huntId: hunt.id,
          status: [ParticipationStatus.ONGOING, ParticipationStatus.COMPLETED, ParticipationStatus.ABANDONED][j % 3],
        },
      });
    }
  }

  // Monnaie virtuelle et transactions
  for (const user of users) {
    const vc = await prisma.virtualCurrency.create({
      data: {
        userId: user.id,
        amount: Math.floor(Math.random() * 1000) + 100,
        type: [CurrencySourceType.EARNED, CurrencySourceType.PURCHASED, CurrencySourceType.GIFTED][Math.floor(Math.random() * 3)],
      },
    });
    await prisma.transactionHistory.create({
      data: {
        userId: user.id,
        amount: Math.floor(Math.random() * 500) + 50,
        transactionType: [TransactionType.EARNED, TransactionType.SPENT, TransactionType.BOUGHT][Math.floor(Math.random() * 3)],
        virtualCurrencyId: vc.id,
        description: "Transaction de seed",
      },
    });
  }

  // Steps et rewards pour chaque chasse
  for (const hunt of hunts) {
    for (let s = 0; s < 3; s++) {
      await prisma.huntStep.create({
        data: {
          description: `Étape ${s + 1} de ${hunt.title}`,
          huntId: hunt.id,
          stepOrder: s + 1,
        },
      });
      await prisma.reward.create({
        data: {
          type: [RewardType.VIRTUAL_CURRENCY, RewardType.ARTEFACT, RewardType.DISCOUNT, RewardType.PHYSICAL_ITEM][s % 4],
          value: (s + 1) * 100,
          description: `Récompense ${s + 1} pour ${hunt.title}`,
          huntId: hunt.id,
        },
      });
    }
  }

  // Leaderboard
  for (const hunt of hunts) {
    for (let l = 0; l < 5; l++) {
      const user = users[(hunt.id.charCodeAt(2) + l) % users.length];
      await prisma.leaderboardEntry.create({
        data: {
          userId: user.id,
          huntId: hunt.id,
          rank: l + 1,
          score: 1000 - l * 100,
          completedAt: new Date(Date.now() - (1000 * 60 * 60 * 24 * l)),
        },
      });
    }
  }

  console.log("Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });