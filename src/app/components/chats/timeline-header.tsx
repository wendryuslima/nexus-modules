import { Info, MoreHorizontal, Search } from "lucide-react";

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getNameInitials } from "@/lib/get-name-initials";

type TimelineHeaderProps = {
  participantName: string;
};

const TimelineHeader = ({ participantName }: TimelineHeaderProps) => (
  <header className="flex h-[4.5rem] shrink-0 items-center gap-3 border-b px-4 sm:px-6">
    <Avatar className="size-10">
      <AvatarFallback className="bg-ice-deep text-xs font-semibold text-foreground">
        {getNameInitials(participantName)}
      </AvatarFallback>
      <AvatarBadge className="bg-success" aria-label="Online" />
    </Avatar>

    <div className="min-w-0 flex-1">
      <h2 className="truncate text-sm font-semibold sm:text-base">{participantName}</h2>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
        Online
      </p>
    </div>

    <nav className="flex items-center gap-1" aria-label="Ações da conversa">
      <Button variant="ghost" size="icon" aria-label="Buscar na conversa" title="Buscar na conversa">
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
