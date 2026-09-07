import { apiRequest } from "@/services/http/api-client";
import type { AuthUser } from "@/types/auth/auth-user";
import type {
  SignInRequestDto,
  SignInResponseDto,
} from "@/types/auth/sign-in-dto";

const signIn = async (payload: SignInRequestDto): Promise<AuthUser> => {
  const response = await apiRequest<SignInResponseDto>("/v1/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return {
    id: response.data.user_id,
    email: response.data.email,
  };
};

export { signIn };
