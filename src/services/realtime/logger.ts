type RealtimeLogLevel = "info" | "warn" | "error";
type RealtimeLogDetails = Record<string, string | number | boolean>;

const logRealtime = (level: RealtimeLogLevel, message: string, details: RealtimeLogDetails = {}) => {
  console[level](`[WS] ${message}`, details);
};

export { logRealtime };
