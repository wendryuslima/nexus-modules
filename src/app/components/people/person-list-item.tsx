import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getNameInitials } from "@/lib/get-name-initials";
import { getUserDisplayName } from "@/lib/get-user-display-name";
import { cn } from "@/lib/utils";
import type { ListedUserDto } from "@/types/users/list-users-dto";

type PersonListItemProps = {
  user: ListedUserDto;
  isActive?: boolean;
  onSelect: (user: ListedUserDto) => void;
};

const PersonListItem = ({ user, isActive = false, onSelect }: PersonListItemProps) => {
  const name = getUserDisplayName(user.email);

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(user)}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "group flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
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
          </Avatar>
          <span
            aria-label="Disponível"
            className={cn(
              "absolute right-0 bottom-0 size-2 rounded-full border border-card bg-emerald-500",
              isActive && "border-primary",
            )}
          />
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
        </span>
      </button>
    </li>
  );
};

export { PersonListItem };
