import type { AuthMode } from "@/types/auth";

type LoginHeaderProps = {
  mode: AuthMode;
};

const LoginHeader = ({ mode }: LoginHeaderProps) => {
  const isLogin = mode === "login";

  return (
    <header className="flex flex-col items-start">
      <img
        src="/nexuslogo-png.jpg"
        alt="Nexus"
        className="mb-[clamp(0.75rem,4vh,2.25rem)] size-[clamp(2.5rem,6vh,3rem)] rounded-xl object-cover"
      />
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
        {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
      </h1>
      <p className="mt-[clamp(0.25rem,1vh,0.5rem)] text-base text-muted-foreground">
        {isLogin
          ? "Entre na sua conta para continuar."
          : "Comece agora a conectar sua equipe."}
      </p>
    </header>
  );
};

export default LoginHeader;
