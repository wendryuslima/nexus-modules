const withSessionLock = async <T>(operation: () => Promise<T>): Promise<T> => {
  if (typeof window === "undefined") return operation();
  if (!navigator.locks) throw new Error("Este navegador precisa oferecer Web Locks para renovar a sessão com segurança.");
  return navigator.locks.request("nexus-session-credentials", { signal: AbortSignal.timeout(20_000) }, operation);
};

export { withSessionLock };
