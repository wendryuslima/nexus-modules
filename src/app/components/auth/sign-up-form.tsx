import type { FormEvent } from "react";
import { useState } from "react";

import PasswordField from "@/app/components/auth/password-field";
import RequestErrorAlert from "@/app/components/auth/request-error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignUp } from "@/hooks/auth/use-sign-up";

type SignUpFormProps = {
  onSignInClick: () => void;
  onSignedUp: (email: string) => void;
};

const SignUpForm = ({ onSignInClick, onSignedUp }: SignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [confirmationError, setConfirmationError] = useState("");
  const signUp = useSignUp();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== passwordConfirmation) {
      setConfirmationError("As senhas precisam ser iguais.");
      return;
    }

    setConfirmationError("");
    const normalizedEmail = email.trim().toLowerCase();
    signUp.mutate(
      { email: normalizedEmail, password },
      { onSuccess: () => onSignedUp(normalizedEmail) },
    );
  };

  return (
    <form
      className="mt-[clamp(1rem,5vh,2.75rem)] space-y-[clamp(0.625rem,2vh,1.25rem)]"
      onSubmit={handleSubmit}
    >
      {signUp.error && <RequestErrorAlert message={signUp.error.message} />}
      {confirmationError && (
        <RequestErrorAlert message={confirmationError} />
      )}

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

      <PasswordField
        id="password"
        value={password}
        onChange={setPassword}
        label="Senha"
        placeholder="Digite sua senha"
        autoComplete="new-password"
        minLength={12}
        maxLength={128}
        required
      />

      <PasswordField
        id="password-confirmation"
        value={passwordConfirmation}
        onChange={setPasswordConfirmation}
        label="Confirmar senha"
        placeholder="Digite sua senha novamente"
        autoComplete="new-password"
        minLength={12}
        maxLength={128}
        invalid={confirmationError.length > 0}
        required
      />

      <Button
        type="submit"
        size="lg"
        disabled={signUp.isPending}
        className="mt-1 h-[clamp(2.5rem,6vh,3rem)] w-full text-base"
      >
        {signUp.isPending ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="pt-[clamp(0.25rem,1vh,0.75rem)] text-center text-sm text-muted-foreground">
        Já possui uma conta?{" "}
        <Button
          type="button"
          variant="link"
          onClick={onSignInClick}
          className="h-auto p-0 text-sm font-semibold"
        >
          Entrar
        </Button>
      </p>
    </form>
  );
};

export default SignUpForm;
