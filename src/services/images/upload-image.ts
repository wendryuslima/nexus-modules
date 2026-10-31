import { authenticatedApiRequest } from "@/services/http/authenticated-api-request";
import type { ImageMetadataDto, ImageUploadInput } from "@/types/images/image-dto";

const uploadImage = async ({ chatId, clientUploadId, file }: ImageUploadInput) => {
  const body = new FormData();
  body.append("chatId", chatId);
  body.append("clientUploadId", clientUploadId);
  body.append("file", file);
  const result = await authenticatedApiRequest<{ data: ImageMetadataDto }>("/v1/images", { method: "POST", body });
  return result.data;
};

export { uploadImage };
