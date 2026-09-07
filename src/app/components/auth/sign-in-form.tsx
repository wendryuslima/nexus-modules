import type { FormEvent } from "react";
import { useState } from "react";

import PasswordField from "@/app/components/auth/password-field";
import RequestErrorAlert from "@/app/components/auth/request-error-alert";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn } from "@/hooks/auth/use-sign-in";
import type { AuthUser } from "@/types/auth/auth-user";

type SignInFormProps = {
  defaultEmail: string;
  hasJustSignedUp: boolean;
  onAuthenticated: (user: AuthUser) => void;
  onSignUpClick: () => void;
};

const SignInForm = ({
  defaultEmail,
  hasJustSignedUp,
  onAuthenticated,
  onSignUpClick,
}: SignInFormProps) => {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const signIn = useSignIn();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    signIn.mutate(
      { email: email.trim(), password },
      { onSuccess: onAuthenticated },
    );
  };

  return (
    <form
      className="mt-[clamp(1rem,5vh,2.75rem)] space-y-[clamp(0.625rem,2vh,1.25rem)]"
      onSubmit={handleSubmit}
    >
      {hasJustSignedUp && (
        <Alert>
          <AlertDescription>
            Conta criada com sucesso. Entre para continuar.
          </AlertDescription>
        </Alert>
      )}

      {signIn.error && <RequestErrorAlert message={signIn.error.message} />}

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="Digite seu e-mail"
          maxLength={254}
          required
          className="h-[clamp(2.5rem,6vh,3rem)]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <PasswordField
          id="password"
          value={password}
          onChange={setPassword}
          placeholder="Digite sua senha"
          autoComplete="current-password"
          required
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={signIn.isPending}
        className="mt-1 h-[clamp(2.5rem,6vh,3rem)] w-full text-base"
      >
        {signIn.isPending ? "Entrando..." : "Entrar"}
      </Button>

      <p className="pt-[clamp(0.25rem,1vh,0.75rem)] text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Button
          type="button"
          variant="link"
          onClick={onSignUpClick}
          className="h-auto p-0 text-sm font-semibold"
        >
          Criar conta
        </Button>
      </p>
    </form>
  );
};

export default SignInForm;
