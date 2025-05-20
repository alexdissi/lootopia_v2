"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "../../../../generated/prisma";

interface UserRoleSelectorProps {
  userId: string;
  currentRole: UserRole;
  disabled?: boolean;
  onRoleChange: (userId: string, role: UserRole) => void;
}

export function UserRoleSelector({
  userId,
  currentRole,
  disabled = false,
  onRoleChange,
}: UserRoleSelectorProps) {
  return (
    <Select
      value={currentRole}
      onValueChange={(value) => onRoleChange(userId, value as UserRole)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UserRole.PLAYER}>Player</SelectItem>
        <SelectItem value={UserRole.ORGANIZER}>Organizer</SelectItem>
        <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}
