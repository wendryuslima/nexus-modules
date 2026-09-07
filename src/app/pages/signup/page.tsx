import { useNavigate } from "react-router-dom";

import AuthLayout from "@/app/components/auth/auth-layout";
import SignUpForm from "@/app/components/auth/sign-up-form";

const SignUpPage = () => {
  const navigate = useNavigate();

  const handleSignedUp = (registeredEmail: string) => {
    navigate("/signin", {
      replace: true,
      state: { registeredEmail },
    });
  };

  return (
    <AuthLayout mode="register">
      <SignUpForm
        onSignInClick={() => navigate("/signin")}
        onSignedUp={handleSignedUp}
      />
    </AuthLayout>
  );
};

export default SignUpPage;
