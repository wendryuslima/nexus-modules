const usersQueryKeys = {
  all: () => ["users"] as const,
  list: (pageSize: number) => [...usersQueryKeys.all(), "list", pageSize] as const,
};

export { usersQueryKeys };
