type ImageMetadataDto = {
  id: string;
  contentType: "image/jpeg" | "image/png";
  sizeBytes: number;
  width: number;
  height: number;
};

type ImageAccessDto = ImageMetadataDto & { url: string; expiresAt: string };
type ImageUploadInput = { chatId: string; clientUploadId: string; file: File };

export type { ImageMetadataDto, ImageAccessDto, ImageUploadInput };
