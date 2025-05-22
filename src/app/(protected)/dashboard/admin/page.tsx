import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UsersAdminUI } from "@/components/context/users/user-admin";
import { User } from "@/interfaces/user";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export default async function Page({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { search, page } = await searchParams;

  const searchQuery = search || "";
  const currentPage = parseInt(page || "1", 10);

  let whereClause = {};

  if (searchQuery) {
    whereClause = {
      OR: [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { email: { contains: searchQuery, mode: "insensitive" } },
      ],
    };
  }

  const totalUsers = await prisma.user.count({
    where: whereClause,
  });

  const totalPages = Math.ceil(totalUsers / 10);

  const validatedPage = Math.min(
    Math.max(1, currentPage),
    Math.max(1, totalPages),
  );

  const prismaUsers = await prisma.user.findMany({
    where: whereClause,
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
    skip: (validatedPage - 1) * 10,
    take: 10,
  });

  const users: User[] = prismaUsers.map((user) => ({
    ...user,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>
      <UsersAdminUI
        initialUsers={users}
        currentUserId={session.user.id}
        initialSearch={searchQuery}
        totalUsers={totalUsers}
        totalPages={totalPages}
        currentPage={validatedPage}
      />
    </div>
  );
}
