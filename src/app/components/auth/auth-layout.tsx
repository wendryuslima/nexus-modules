import type { ReactNode } from "react";

import type { AuthMode } from "@/types/auth/auth-mode";

import AuthVisual from "./auth-visual";
import LoginHeader from "./login-header";

type AuthLayoutProps = {
  children: ReactNode;
  isAuthenticated?: boolean;
  mode?: AuthMode;
};

const AuthLayout = ({
  children,
  isAuthenticated = false,
  mode = "login",
}: AuthLayoutProps) => {
  return (
    <main className="grid h-dvh overflow-hidden bg-background lg:grid-cols-[49%_51%]">
      <section className="flex h-dvh items-center justify-center overflow-hidden px-6 py-[clamp(1rem,4vh,3rem)] sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          <LoginHeader mode={mode} isAuthenticated={isAuthenticated} />
          {children}
        </div>
      </section>

      <AuthVisual />
    </main>
  );
};

export default AuthLayout;
