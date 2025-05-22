import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UsersAdminUI } from "@/components/context/users/user-admin";
import { User } from "@/interfaces/user";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const prismaUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      image: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const users: User[] = prismaUsers.map((user) => ({
    ...user,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>
      <UsersAdminUI initialUsers={users} currentUserId={session.user.id} />
    </div>
  );
}
