# 🗺️ Lootopia

Lootopia est une plateforme gamifiée de chasses au trésor immersive, construite avec Next.js, Prisma, Zod et Stripe.

---

## 🚀 Stack

- **Frontend** : Next.js 15, TailwindCSS, Radix UI, React 19
- **Backend** : API Routes (Next.js), Prisma ORM, Zod
- **Auth** : [BetterAuth](https://www.npmjs.com/package/better-auth)
- **DB** : PostgreSQL
- **Paiements** : Stripe
- **3D & Carte** : Three.js, Leaflet

---

## 🛠️ Setup du projet (développeur)

### 1. 🔁 Cloner le projet

```bash
git clone git@github.com:alexdissi/lootopia_v2.git
cd lootopia
```

---

### 2. 📦 Installer les dépendances

```bash
pnpm install
```

ou

```bash
npm install
```

---

### 3. 🔐 Configurer les variables d’environnement

Créer un fichier `.env` :

```env
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
DATABASE_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_BASE_URL=
```

```bash
openssl rand -base64 32
```

---

### 4. 📐 Générer le client Prisma

```bash
npx prisma generate
```

---

### 5. 🧱 Lancer la migration de la DB

```bash
npx prisma migrate dev --name init
```

> 📝 Pour visualiser la base :
```bash
npx prisma studio
```

---

### 6. 🌱 (Optionnel) Seeder la base

```bash
pnpm seed
```

---

### 7. 🧪 Lancer le projet

```bash
pnpm dev
```

Accessible sur [http://localhost:3000](http://localhost:3000)

---

## 📦 Scripts utiles

| Commande | Description |
|---------|-------------|
| `pnpm dev` | Démarrer le projet en dev avec Turbopack |
| `pnpm build` | Build + Prisma generate |
| `pnpm start` | Lancer le build en prod |
| `pnpm lint` | Vérifie le lint |
| `pnpm lint:fix` | Corrige automatiquement le code |
| `pnpm format` | Formate le code avec Prettier |
| `pnpm seed` | Exécute le script de seed DB |

---

## 🧠 Conventions de dev

- Utilise `Zod` pour toutes les validations côté API
- Authentification basée sur BetterAuth (email/password ou OAuth)
- Prisma pour toutes les interactions avec la base
- UI composants via `shadcn/ui` + `Radix`

---

## 🧾 Licence

MIT — 2025 © Lootopia Team.
