import type { AuthUser } from "@/types/auth/auth-user";

type AuthSession = {
  isAuthenticated: boolean;
  user: AuthUser | null;
};

export type { AuthSession };
