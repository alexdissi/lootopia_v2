import { PrismaClient, UserRole } from "../generated/prisma";

const prisma = new PrismaClient();

const PASSWORD = "Password123!"; // Mot de passe par défaut pour tous les utilisateurs seed

async function main() {
  console.log("Démarrage du seed...");

  // Supprimer les utilisateurs existants (optionnel)
  // await prisma.user.deleteMany({});

  // Créer un admin
  const admin = await prisma.user.create({
    data: {
      name: "Admin Lootopia",
      email: "admin@lootopia.fr",
      emailVerified: true,
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: {
        create: {
          id: `admin-account-${Date.now()}`,
          accountId: `admin-${Date.now()}`,
          providerId: "credentials",
          password: PASSWORD, // Idéalement, utilisez une fonction de hachage ici
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  });
  console.log(`Admin créé: ${admin.email}`);

  // Créer 3 organisateurs
  const organizers = [];
  for (let i = 1; i <= 3; i++) {
    const organizer = await prisma.user.create({
      data: {
        name: `Organisateur ${i}`,
        email: `organizer${i}@lootopia.fr`,
        emailVerified: i % 2 === 0, // Certains ont vérifié leur email, d'autres non
        role: UserRole.ORGANIZER,
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
        ), // Date aléatoire dans les 30 derniers jours
        updatedAt: new Date(),
        accounts: {
          create: {
            id: `organizer-account-${i}-${Date.now()}`,
            accountId: `organizer-${i}-${Date.now()}`,
            providerId: "credentials",
            password: PASSWORD,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
    });
    organizers.push(organizer);
    console.log(`Organisateur créé: ${organizer.email}`);
  }

  // Créer 16 joueurs
  const players = [];
  for (let i = 1; i <= 16; i++) {
    const player = await prisma.user.create({
      data: {
        name: `Joueur ${i}`,
        email: `player${i}@example.com`,
        emailVerified: Math.random() > 0.3, // 70% de chance d'avoir vérifié leur email
        role: UserRole.PLAYER,
        nickname: `Gamer${i}`,
        image: i % 3 === 0 ? `https://i.pravatar.cc/150?img=${i}` : null, // Certains ont une image de profil
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000,
        ), // Date aléatoire dans les 60 derniers jours
        updatedAt: new Date(),
        accounts: {
          create: {
            id: `player-account-${i}-${Date.now()}`,
            accountId: `player-${i}-${Date.now()}`,
            providerId: "credentials",
            password: PASSWORD,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
    });

    // Ajouter de la monnaie virtuelle pour certains joueurs
    if (i % 3 === 0) {
      await prisma.virtualCurrency.create({
        data: {
          userId: player.id,
          amount: Math.floor(Math.random() * 1000) + 100,
          type: "EARNED",
        },
      });
    }

    players.push(player);
    console.log(`Joueur créé: ${player.email}`);
  }

  console.log("Seed terminé!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
