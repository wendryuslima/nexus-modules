import { Navigate, Outlet } from "react-router-dom";

import SessionLoading from "@/app/components/auth/session-loading";
import { useAuthSession } from "@/hooks/auth/use-auth-session";

const GuestRoute = () => {
  const session = useAuthSession();

  if (session.isPending) {
    return <SessionLoading />;
  }

  if (session.data?.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
