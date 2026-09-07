import { apiRequest } from "@/services/http/api-client";

const signOut = async (): Promise<void> => {
  await apiRequest<void>("/v1/auth/logout", {
    method: "POST",
  });
};

export { signOut };
