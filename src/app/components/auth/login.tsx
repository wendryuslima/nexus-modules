import { useState } from "react";

import AuthForm from "./auth-form";
import AuthVisual from "./auth-visual";
import LoginHeader from "./login-header";
import type { AuthMode } from "@/types/auth";

const Login = () => {
  const [mode, setMode] = useState<AuthMode>("login");

  const toggleMode = () => {
    setMode((currentMode) =>
      currentMode === "login" ? "register" : "login",
    );
  };

  return (
    <main className="grid h-dvh overflow-hidden bg-background lg:grid-cols-[49%_51%]">
      <section className="flex h-dvh items-center justify-center overflow-hidden px-6 py-[clamp(1rem,4vh,3rem)] sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          <LoginHeader mode={mode} />
          <AuthForm mode={mode} onToggleMode={toggleMode} />
        </div>
      </section>

      <AuthVisual />
    </main>
  );
};

export default Login;
