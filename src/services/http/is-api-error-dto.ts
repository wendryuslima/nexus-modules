import type { ApiErrorDto } from "@/types/http/api-error-dto";

const isApiErrorDto = (value: unknown): value is ApiErrorDto => {
  if (typeof value !== "object" || value === null || !("error" in value)) {
    return false;
  }

  const error = value.error;

  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    "message" in error &&
    typeof error.message === "string"
  );
};

export { isApiErrorDto };
