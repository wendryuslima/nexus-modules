const usersQueryKeys = {
  all: () => ["users"] as const,
  list: () => [...usersQueryKeys.all(), "list"] as const,
};

export { usersQueryKeys };
