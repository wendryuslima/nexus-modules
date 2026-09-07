import { apiRequest } from "@/services/http/api-client";
import type {
  SignUpRequestDto,
  SignUpResponseDto,
} from "@/types/auth/sign-up-dto";

const signUp = async (
  payload: SignUpRequestDto,
): Promise<SignUpResponseDto["data"]> => {
  const response = await apiRequest<SignUpResponseDto>("/v1/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return response.data;
};

export { signUp };
