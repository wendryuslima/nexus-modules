import { createContext, useContext } from "react";
import type { RealtimeStatus } from "@/services/realtime/controller";

const RealtimeContext = createContext<RealtimeStatus>("connecting");

const useRealtimeStatus = () => useContext(RealtimeContext);

export { RealtimeContext, useRealtimeStatus };
