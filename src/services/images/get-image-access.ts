import { authenticatedApiRequest } from "@/services/http/authenticated-api-request";
import type { ImageAccessDto } from "@/types/images/image-dto";

const getImageAccess = async (imageId: string, signal?: AbortSignal) => {
  const result = await authenticatedApiRequest<{ data: ImageAccessDto }>(
    `/v1/images/${encodeURIComponent(imageId)}/access`, { method: "GET", signal },
  );
  return result.data;
};

export { getImageAccess };
