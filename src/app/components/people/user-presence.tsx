import { AvatarBadge } from "@/components/ui/avatar";
import { useUserPresence } from "@/hooks/users/use-user-presence";
import { cn } from "@/lib/utils";

type UserPresenceProps = {
  userId?: string;
  badge?: boolean;
  className?: string;
};

const UserPresence = ({ userId, badge = false, className }: UserPresenceProps) => {
  const online = useUserPresence(userId);
  const label = online === undefined ? "Verificando presença..." : online ? "Online" : "Ausente";
  const color = online ? "bg-success" : "bg-muted-foreground";

  if (badge) {
    return <AvatarBadge aria-label={label} title={label} className={cn(color, online === undefined && "opacity-50", className)} />;
  }

  return (
    <span role="status" className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", color, online === undefined && "opacity-50")} />
      {label}
    </span>
  );
};

export { UserPresence };
