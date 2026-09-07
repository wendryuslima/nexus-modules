import { ApiError } from "@/services/http/api-error";
import { isApiErrorDto } from "@/services/http/is-api-error-dto";

const apiUrl = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

const apiRequest = async <T>(path: string, init: RequestInit): Promise<T> => {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: "include",
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);

    if (isApiErrorDto(body)) {
      throw new ApiError(body.error.code, body.error.message, response.status);
    }

    throw new ApiError(
      "unexpected_response",
      `A API retornou uma resposta inválida (${response.status}).`,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export { apiRequest };
