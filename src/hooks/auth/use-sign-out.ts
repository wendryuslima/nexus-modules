import { useMutation } from "@tanstack/react-query";

import { signOut } from "@/services/auth/sign-out";

const useSignOut = () => {
  return useMutation({ mutationFn: signOut });
};

export { useSignOut };
