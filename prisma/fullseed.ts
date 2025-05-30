import { PrismaClient, UserRole } from "../generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Démarrage du seed complet de la base de données...");

  // Nettoyer la base de données existante
  console.log("Nettoyage des données existantes...");
  await cleanDatabase();
  console.log("Nettoyage terminé");

  // Seed des utilisateurs
  console.log("Création des utilisateurs...");
  const users = await seedUsers();
  console.log(`${users.length} utilisateurs créés`);

  // Seed des chasses au trésor
  console.log("Création des chasses au trésor...");
  const hunts = await seedHunts(users);
  console.log(`${hunts.length} chasses créées`);

  // Seed des participations
  console.log("Création des participations...");
  const participations = await seedParticipations(users, hunts);
  console.log(`${participations.length} participations créées`);

  // Seed des monnaies virtuelles
  console.log("Création des monnaies virtuelles...");
  await seedVirtualCurrency(users);
  console.log("Monnaies virtuelles créées");

  // Seed des articles de la boutique
  console.log("Création des articles de la boutique...");
  await seedShopItems();
  console.log("Articles de la boutique créés");

  console.log("Seed terminé avec succès !");
}

async function cleanDatabase() {
  // Supprimer dans l'ordre pour éviter les erreurs de contraintes de clé étrangère
  await prisma.stepProgress.deleteMany({});
  await prisma.transactionHistory.deleteMany({});
  await prisma.virtualCurrency.deleteMany({});
  await prisma.leaderboardEntry.deleteMany({});
  await prisma.userItem.deleteMany({});
  await prisma.shopItem.deleteMany({});
  await prisma.artefact.deleteMany({});
  await prisma.reward.deleteMany({});
  await prisma.participation.deleteMany({});
  await prisma.huntStep.deleteMany({});
  await prisma.treasureHunt.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.user.deleteMany({});
}

async function seedUsers() {
  const hashedPassword = await hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@lootopia.fr",
      name: "Admin Lootopia",
      emailVerified: true,
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: {
        create: {
          id: "admin-account",
          accountId: "admin",
          providerId: "credentials",
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }
    }
  });

  const organizerUser = await prisma.user.create({
    data: {
      email: "organisateur@lootopia.fr",
      name: "Paul Organisateur",
      emailVerified: true,
      role: "ORGANIZER",
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: {
        create: {
          id: "organizer-account",
          accountId: "organizer",
          providerId: "credentials",
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }
    }
  });

  const playerUsers = await Promise.all(
    Array.from({ length: 3 }).map(async (_, i) => {
      return prisma.user.create({
        data: {
          email: `joueur${i + 1}@lootopia.fr`,
          name: `Joueur ${i + 1}`,
          emailVerified: true,
          role: "PLAYER",
          createdAt: new Date(),
          updatedAt: new Date(),
          accounts: {
            create: {
              id: `player${i + 1}-account`,
              accountId: `player${i + 1}`,
              providerId: "credentials",
              password: hashedPassword,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          }
        }
      });
    })
  );

  return [adminUser, organizerUser, ...playerUsers];
}

async function seedHunts(users) {
  const organizerUser = users.find(user => user.role === "ORGANIZER");
  
  // Créer quelques chasses au trésor
  const hunt1 = await prisma.treasureHunt.create({
    data: {
      title: "Trésors de Paris",
      description: "Partez à la découverte des trésors cachés de la capitale française",
      createdById: organizerUser.id,
      status: "IN_PROGRESS",
      mode: "PUBLIC",
      fee: 50,
      location: JSON.stringify({ latitude: 48.856614, longitude: 2.3522219 }),
      steps: {
        create: [
          {
            description: "Trouvez le Louvre et prenez une photo de la pyramide",
            stepOrder: 1,
          },
          {
            description: "Rendez-vous à la Tour Eiffel et montez jusqu'au premier étage",
            stepOrder: 2,
          },
          {
            description: "Découvrez le code secret caché sur l'Arc de Triomphe",
            stepOrder: 3,
          }
        ]
      },
      rewards: {
        create: [
          {
            type: "VIRTUAL_CURRENCY",
            value: 100,
            description: "Récompense pour avoir terminé la chasse"
          }
        ]
      }
    }
  });

  const hunt2 = await prisma.treasureHunt.create({
    data: {
      title: "Mystères de Lyon",
      description: "Explorez les secrets bien gardés de la ville de Lyon",
      createdById: organizerUser.id,
      status: "PENDING",
      mode: "PUBLIC",
      fee: 0,
      location: JSON.stringify({ latitude: 45.764043, longitude: 4.835659 }),
      steps: {
        create: [
          {
            description: "Découvrez le message caché dans la Basilique Notre-Dame de Fourvière",
            stepOrder: 1,
          },
          {
            description: "Explorez les traboules du Vieux Lyon",
            stepOrder: 2,
          },
          {
            description: "Trouvez l'indice secret sur la Place Bellecour",
            stepOrder: 3,
          },
          {
            description: "Résolvez l'énigme du Parc de la Tête d'Or",
            stepOrder: 4,
          }
        ]
      },
      rewards: {
        create: [
          {
            type: "VIRTUAL_CURRENCY",
            value: 150,
            description: "Récompense pour avoir terminé la chasse"
          }
        ]
      }
    }
  });

  const hunt3 = await prisma.treasureHunt.create({
    data: {
      title: "Aventure à Marseille",
      description: "Une chasse au trésor le long du Vieux Port et des Calanques",
      createdById: organizerUser.id,
      status: "IN_PROGRESS",
      mode: "PRIVATE",
      fee: 75,
      location: JSON.stringify({ latitude: 43.296482, longitude: 5.36978 }),
      steps: {
        create: [
          {
            description: "Trouvez l'indice caché près du Vieux Port",
            stepOrder: 1,
          },
          {
            description: "Rendez-vous à la Basilique Notre-Dame de la Garde",
            stepOrder: 2,
          },
          {
            description: "Découvrez le secret des Calanques",
            stepOrder: 3,
          }
        ]
      },
      rewards: {
        create: [
          {
            type: "VIRTUAL_CURRENCY",
            value: 200,
            description: "Récompense pour avoir terminé la chasse"
          }
        ]
      }
    }
  });

  return [hunt1, hunt2, hunt3];
}

async function seedParticipations(users, hunts) {
  const players = users.filter(user => user.role === "PLAYER");
  const participations = [];

  // Le premier joueur participe à la première chasse (Trésors de Paris)
  const participation1 = await prisma.participation.create({
    data: {
      userId: players[0].id,
      huntId: hunts[0].id,
      status: "ONGOING"
    }
  });
  participations.push(participation1);

  // Le deuxième joueur participe à la première et deuxième chasse
  const participation2 = await prisma.participation.create({
    data: {
      userId: players[1].id,
      huntId: hunts[0].id,
      status: "ONGOING"
    }
  });
  participations.push(participation2);

  const participation3 = await prisma.participation.create({
    data: {
      userId: players[1].id,
      huntId: hunts[1].id,
      status: "ONGOING"
    }
  });
  participations.push(participation3);

  // Le troisième joueur participe à la troisième chasse
  const participation4 = await prisma.participation.create({
    data: {
      userId: players[2].id,
      huntId: hunts[2].id,
      status: "ONGOING"
    }
  });
  participations.push(participation4);

  return participations;
}

async function seedVirtualCurrency(users) {
  // Ajouter de la monnaie virtuelle à chaque utilisateur
  for (const user of users) {
    await prisma.virtualCurrency.create({
      data: {
        userId: user.id,
        amount: 500,
        type: "EARNED",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
}

async function seedShopItems() {
  await prisma.shopItem.createMany({
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
        imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?q=80&w=1200",
      },
      {
        name: "Accès VIP",
        description: "Accès prioritaire aux nouvelles chasses pendant 30 jours",
        price: 300,
        type: "SPECIAL_ACCESS",
        imageUrl: "https://images.unsplash.com/photo-1623018035782-b269248df916?q=80&w=1200",
      },
      {
        name: "Costume d'Aventurier",
        description: "Personnalisez votre avatar avec ce costume exclusif",
        price: 200,
        type: "COSMETIC",
        imageUrl: "https://images.unsplash.com/photo-1535057929422-25924f8a7e88?q=80&w=1200",
      },
      {
        name: "Indices Premium",
        description: "Obtenez des indices supplémentaires pour les chasses difficiles",
        price: 100,
        type: "HINT",
        imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=1200",
      }
    ]
  });
}

main()
  .catch((e) => {
    console.error("Erreur pendant le seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
