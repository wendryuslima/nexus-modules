import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPresence } from "@/app/components/people/user-presence";
import { Button } from "@/components/ui/button";
import { getNameInitials } from "@/lib/get-name-initials";
import { getUserDisplayName } from "@/lib/get-user-display-name";
import { cn } from "@/lib/utils";
import type { ListedUserDto } from "@/types/users/list-users-dto";

type PersonListItemProps = {
  user: ListedUserDto;
  isActive?: boolean;
  disabled?: boolean;
  onSelect: (user: ListedUserDto) => void;
};

const PersonListItem = ({
  user,
  isActive = false,
  disabled = false,
  onSelect,
}: PersonListItemProps) => {
  const name = getUserDisplayName(user.email);

  return (
    <li>
      <Button
        type="button"
        variant="ghost"
        onClick={() => onSelect(user)}
        disabled={disabled}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "h-auto w-full min-w-0 justify-start gap-2 rounded-md px-2 py-1.5 text-left",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-secondary",
        )}
      >
        <div className="relative shrink-0">
          <Avatar className="size-7">
            <AvatarFallback
              className={cn(
                "text-[0.65rem] font-semibold",
                isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/15 text-primary",
              )}
            >
              {getNameInitials(name)}
            </AvatarFallback>
            <UserPresence userId={user.user_id} badge className={cn("size-2", isActive && "ring-primary")} />
          </Avatar>
        </div>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{name}</span>
          <span
            className={cn(
              "block truncate text-xs",
              isActive ? "text-primary-foreground/75" : "text-muted-foreground",
            )}
          >
            {user.email}
          </span>
          <UserPresence userId={user.user_id} className={cn(isActive && "text-primary-foreground/75")} />
        </span>
      </Button>
    </li>
  );
};

export { PersonListItem };
