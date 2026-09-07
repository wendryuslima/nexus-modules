import { useMutation } from "@tanstack/react-query";

import { signUp } from "@/services/auth/sign-up";

const useSignUp = () => {
  return useMutation({ mutationFn: signUp });
};

export { useSignUp };
