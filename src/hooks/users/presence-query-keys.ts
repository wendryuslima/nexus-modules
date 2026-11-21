const presenceQueryKeys = {
  session: (userId: string) => ["presence", userId] as const,
};

export { presenceQueryKeys };
