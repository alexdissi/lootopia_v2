"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { User } from "@/interfaces/user";
import { UserRole } from "../../../../generated/prisma";
import { UsersTable } from "./user-table";

interface UsersAdminUIProps {
  initialUsers: User[];
  currentUserId: string;
}

export function UsersAdminUI({
  initialUsers,
  currentUserId,
}: UsersAdminUIProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useQueryState("search");
  const [currentPage, setCurrentPage] = useQueryState("page", {
    parse: (value) => parseInt(value, 10),
  });
  const itemsPerPage = 10;

  const activePage = currentPage || 1;
  const activeSearch = searchTerm || "";
  const filteredUsers = useMemo(() => users.filter(
      (user) =>
        user.name?.toLowerCase().includes(activeSearch.toLowerCase()) ||
        user.email?.toLowerCase().includes(activeSearch.toLowerCase()),
    ), [users, activeSearch]);

  const totalFilteredUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalFilteredUsers / itemsPerPage);

  const currentUsers = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, activePage]);

  useEffect(() => {
    if (activeSearch && activePage !== 1) {
      setCurrentPage(1);
    }
  }, [activeSearch, activePage, setCurrentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value || null);
  };

  const updateUserRole = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: UserRole;
    }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) throw new Error("Failed to update user role");
      return res.json();
    },
    onMutate: ({ userId, role }) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role } : user,
        ),
      );
    },
    onSuccess: () => {
      toast.success("Rôle mis à jour avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du rôle");
      router.refresh();
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onMutate: (userId) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    },
    onSuccess: () => {
      toast.success("Utilisateur supprimé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de l'utilisateur");
      router.refresh();
    },
  });

  const handleRoleChange = (userId: string, role: UserRole) => {
    updateUserRole.mutate({ userId, role });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser.mutate(userId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Rechercher par nom ou email"
          value={activeSearch}
          onChange={handleSearch}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          {totalFilteredUsers} utilisateur{totalFilteredUsers > 1 ? "s" : ""} au
          total
        </div>
      </div>

      <UsersTable
        users={currentUsers}
        currentUserId={currentUserId}
        onRoleChange={handleRoleChange}
        onDeleteUser={handleDeleteUser}
        totalPages={totalPages}
        currentPage={activePage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
