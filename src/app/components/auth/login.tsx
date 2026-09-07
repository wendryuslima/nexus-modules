import { useState } from "react";

import AuthForm from "./auth-form";
import AuthVisual from "./auth-visual";
import AuthenticatedSession from "./authenticated-session";
import LoginHeader from "./login-header";
import type { AuthMode } from "@/types/auth/auth-mode";
import type { AuthUser } from "@/types/auth/auth-user";

const Login = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);

  const handleModeChange = (nextMode: AuthMode) => {
    setRegisteredEmail("");
    setMode(nextMode);
  };

  const handleSignedUp = (email: string) => {
    setRegisteredEmail(email);
    setMode("login");
  };

  return (
    <main className="grid h-dvh overflow-hidden bg-background lg:grid-cols-[49%_51%]">
      <section className="flex h-dvh items-center justify-center overflow-hidden px-6 py-[clamp(1rem,4vh,3rem)] sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          <LoginHeader mode={mode} isAuthenticated={user !== null} />
          {user ? (
            <AuthenticatedSession user={user} onSignedOut={() => setUser(null)} />
          ) : (
            <AuthForm
              mode={mode}
              registeredEmail={registeredEmail}
              onAuthenticated={setUser}
              onModeChange={handleModeChange}
              onSignedUp={handleSignedUp}
            />
          )}
        </div>
      </section>

      <AuthVisual />
    </main>
  );
};

export default Login;
