import { useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "@/app/components/auth/auth-layout";
import SignInForm from "@/app/components/auth/sign-in-form";

type SignInLocationState = {
  registeredEmail?: unknown;
};

const SignInPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as SignInLocationState | null;
  const registeredEmail =
    typeof state?.registeredEmail === "string" ? state.registeredEmail : "";

  return (
    <AuthLayout>
      <SignInForm
        defaultEmail={registeredEmail}
        hasJustSignedUp={registeredEmail.length > 0}
        onAuthenticated={() => navigate("/", { replace: true })}
        onSignUpClick={() => navigate("/signup")}
      />
    </AuthLayout>
  );
};

export default SignInPage;
