import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getNameInitials } from "@/lib/get-name-initials";
import { getUserDisplayName } from "@/lib/get-user-display-name";
import type { ListedUserDto } from "@/types/users/list-users-dto";

type PersonListItemProps = {
  user: ListedUserDto;
};

const createdAtFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const PersonListItem = ({ user }: PersonListItemProps) => {
  const name = getUserDisplayName(user.email);

  return (
    <li className="flex min-w-0 items-center gap-4 px-4 py-4 sm:px-5">
      <Avatar className="size-11 border-0">
        <AvatarFallback className="bg-primary/15 font-heading text-sm font-semibold text-primary">
          {getNameInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{name}</p>
        <p className="truncate text-sm text-muted-foreground">{user.email}</p>
      </div>

      <time
        dateTime={user.created_at}
        className="hidden shrink-0 text-xs text-muted-foreground sm:block"
      >
        Desde {createdAtFormatter.format(new Date(user.created_at))}
      </time>
    </li>
  );
};

export { PersonListItem };
