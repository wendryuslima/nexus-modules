import type { AuthUser } from "@/types/auth/auth-user";
import type { AuthMode } from "@/types/auth/auth-mode";

import SignInForm from "./sign-in-form";
import SignUpForm from "./sign-up-form";

type AuthFormProps = {
  mode: AuthMode;
  registeredEmail: string;
  onAuthenticated: (user: AuthUser) => void;
  onModeChange: (mode: AuthMode) => void;
  onSignedUp: (email: string) => void;
};

const AuthForm = ({
  mode,
  registeredEmail,
  onAuthenticated,
  onModeChange,
  onSignedUp,
}: AuthFormProps) => {
  if (mode === "register") {
    return (
      <SignUpForm
        onSignInClick={() => onModeChange("login")}
        onSignedUp={onSignedUp}
      />
    );
  }

  return (
    <SignInForm
      defaultEmail={registeredEmail}
      hasJustSignedUp={registeredEmail.length > 0}
      onAuthenticated={onAuthenticated}
      onSignUpClick={() => onModeChange("register")}
    />
  );
};

export default AuthForm;
