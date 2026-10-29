import type { QueryClient, QueryKey } from "@tanstack/react-query";

const invalidateBackendQuery = async (
  client: QueryClient,
  queryKey: QueryKey,
  isCurrent: () => boolean,
) => {
  if (!isCurrent()) return;
  const fetching = client.getQueryCache().findAll({ queryKey, type: "active", fetchStatus: "fetching" });
  if (fetching.length) {
    await client.refetchQueries({ queryKey, type: "active", fetchStatus: "fetching" }, { cancelRefetch: false });
    if (!isCurrent()) return;
  }
  await client.invalidateQueries(
    { queryKey, refetchType: "active" },
    { cancelRefetch: false, throwOnError: true },
  );
};

export { invalidateBackendQuery };
