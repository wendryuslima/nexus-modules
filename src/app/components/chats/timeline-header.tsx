import { Info, MoreHorizontal, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPresence } from "@/app/components/people/user-presence";
import { Button } from "@/components/ui/button";
import { getNameInitials } from "@/lib/get-name-initials";

type TimelineHeaderProps = {
  participantId?: string;
  participantName: string;
  onSearch?: () => void;
  searchOpen?: boolean;
};

const TimelineHeader = ({ participantId, participantName, onSearch, searchOpen }: TimelineHeaderProps) => (
  <header className="flex h-[4.5rem] shrink-0 items-center gap-3 border-b px-4 sm:px-6">
    <Avatar className="size-10">
      <AvatarFallback className="bg-ice-deep text-xs font-semibold text-foreground">
        {getNameInitials(participantName)}
      </AvatarFallback>
      <UserPresence userId={participantId} badge />
    </Avatar>

    <div className="min-w-0 flex-1">
      <h2 className="truncate text-sm font-semibold sm:text-base">{participantName}</h2>
      <UserPresence userId={participantId} />
    </div>

    <nav className="flex items-center gap-1" aria-label="Ações da conversa">
      <Button variant="ghost" size="icon" aria-label="Buscar na conversa" title="Buscar na conversa" onClick={onSearch} aria-expanded={searchOpen}>
        <Search aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Informações da conversa" title="Informações da conversa">
        <Info aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Mais opções" title="Mais opções">
        <MoreHorizontal aria-hidden="true" />
      </Button>
    </nav>
  </header>
);

export { TimelineHeader };
