const imagesQueryKeys = {
  all: () => ["images"] as const,
  access: (generation: number, imageId: string) => [...imagesQueryKeys.all(), generation, imageId, "access"] as const,
};

export { imagesQueryKeys };
