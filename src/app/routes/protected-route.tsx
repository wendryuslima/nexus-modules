import { Navigate, Outlet } from "react-router-dom";

import SessionLoading from "@/app/components/auth/session-loading";
import { useAuthSession } from "@/hooks/auth/use-auth-session";
import { RealtimeProvider } from "@/app/components/chats/realtime-provider";
import RequestErrorAlert from "@/app/components/auth/request-error-alert";
import { Button } from "@/components/ui/button";

const ProtectedRoute = () => {
  const session = useAuthSession();

  if (session.isPending) {
    return <SessionLoading />;
  }
  if (session.error && !session.data) return <div className="m-auto max-w-lg space-y-4 p-6"><RequestErrorAlert message={session.error.message} /><Button onClick={() => session.refetch()}>Tentar novamente</Button></div>;

  if (!session.data?.isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <RealtimeProvider userId={session.data.user?.id}><Outlet /></RealtimeProvider>;
};

export default ProtectedRoute;
