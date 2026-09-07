import { useNavigate } from "react-router-dom";

import AuthLayout from "@/app/components/auth/auth-layout";
import AuthenticatedSession from "@/app/components/auth/authenticated-session";
import { useAuthSession } from "@/hooks/auth/use-auth-session";

const HomePage = () => {
  const navigate = useNavigate();
  const session = useAuthSession();

  return (
    <AuthLayout isAuthenticated>
      <AuthenticatedSession
        user={session.data?.user ?? null}
        onSignedOut={() => navigate("/signin", { replace: true })}
      />
    </AuthLayout>
  );
};

export default HomePage;
