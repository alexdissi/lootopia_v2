"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { UsersTable } from "./user-table";
import { toast } from "sonner";
import { User } from "@/interfaces/user";
import { UserRole } from "../../../../generated/prisma";

interface UsersAdminUIProps {
  initialUsers: User[];
  currentUserId: string;
  initialSearch: string;
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}

export function UsersAdminUI({
  initialUsers,
  currentUserId,
  initialSearch,
  totalUsers,
  totalPages,
  currentPage,
}: UsersAdminUIProps) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  useEffect(() => {
    const search = searchParams.get("search") || "";
    setSearchTerm(search);
  }, [searchParams]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }

      params.set("page", "1");
      router.push(`?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const updateUserRole = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: UserRole;
    }) => {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
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
      router.refresh(); // Refresh to get the actual state
    },
  });

  const handleRoleChange = (userId: string, role: UserRole) => {
    updateUserRole.mutate({ userId, role });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser.mutate(userId);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Rechercher par nom ou email"
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          {totalUsers} utilisateur{totalUsers > 1 ? "s" : ""} au total
        </div>
      </div>

      <UsersTable
        users={users}
        currentUserId={currentUserId}
        onRoleChange={handleRoleChange}
        onDeleteUser={handleDeleteUser}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
