import { useMutation } from "@tanstack/react-query";

import { signIn } from "@/services/auth/sign-in";

const useSignIn = () => {
  return useMutation({ mutationFn: signIn });
};

export { useSignIn };
