import RequestErrorAlert from "@/app/components/auth/request-error-alert";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/auth/use-sign-out";
import type { AuthUser } from "@/types/auth/auth-user";

type AuthenticatedSessionProps = {
  user: AuthUser;
  onSignedOut: () => void;
};

const AuthenticatedSession = ({
  user,
  onSignedOut,
}: AuthenticatedSessionProps) => {
  const signOut = useSignOut();

  const handleSignOut = () => {
    signOut.mutate(undefined, { onSuccess: onSignedOut });
  };

  return (
    <div className="mt-[clamp(1rem,5vh,2.75rem)] space-y-5">
      {signOut.error && <RequestErrorAlert message={signOut.error.message} />}

      <div className="space-y-1 border-l-2 border-primary pl-4">
        <p className="text-sm text-muted-foreground">Sessão iniciada como</p>
        <p className="font-medium break-all">{user.email}</p>
      </div>

      <Button
        type="button"
        size="lg"
        variant="outline"
        disabled={signOut.isPending}
        onClick={handleSignOut}
        className="h-[clamp(2.5rem,6vh,3rem)] w-full text-base"
      >
        {signOut.isPending ? "Saindo..." : "Sair"}
      </Button>
    </div>
  );
};

export default AuthenticatedSession;
