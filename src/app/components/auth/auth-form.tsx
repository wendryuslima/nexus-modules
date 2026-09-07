import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import PasswordField from "./password-field";
import type { AuthMode } from "@/types/auth";

type AuthFormProps = {
  mode: AuthMode;
  onToggleMode: () => void;
};

const AuthForm = ({ mode, onToggleMode }: AuthFormProps) => {
  const isLogin = mode === "login";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <form
      className="mt-[clamp(1rem,5vh,2.75rem)] space-y-[clamp(0.625rem,2vh,1.25rem)]"
      onSubmit={handleSubmit}
    >
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Digite seu nome"
            required
            className="h-[clamp(2.5rem,6vh,3rem)]"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Digite seu e-mail"
          required
          className="h-[clamp(2.5rem,6vh,3rem)]"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="password">Senha</Label>
          {isLogin && (
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm font-medium"
            >
              Esqueci minha senha
            </Button>
          )}
        </div>
        <PasswordField
          id="password"
          placeholder="Digite sua senha"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
        />
      </div>

      {!isLogin && (
        <PasswordField
          id="password-confirmation"
          label="Confirmar senha"
          placeholder="Digite sua senha novamente"
          autoComplete="new-password"
          required
        />
      )}

      <Button
        type="submit"
        size="lg"
        className="mt-1 h-[clamp(2.5rem,6vh,3rem)] w-full text-base"
      >
        {isLogin ? "Entrar" : "Criar conta"}
      </Button>

      <p className="pt-[clamp(0.25rem,1vh,0.75rem)] text-center text-sm text-muted-foreground">
        {isLogin ? "Ainda não tem conta?" : "Já possui uma conta?"}{" "}
        <Button
          type="button"
          variant="link"
          onClick={onToggleMode}
          className="h-auto p-0 text-sm font-semibold"
        >
          {isLogin ? "Criar conta" : "Entrar"}
        </Button>
      </p>
    </form>
  );
};

export default AuthForm;
