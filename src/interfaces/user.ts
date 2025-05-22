import { UserRole } from "../../generated/prisma";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
}