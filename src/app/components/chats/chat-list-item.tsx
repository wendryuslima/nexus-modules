import { Link } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatChatDate } from "@/lib/format-chat-date";
import { getNameInitials } from "@/lib/get-name-initials";
import { cn } from "@/lib/utils";
import type { ChatDto } from "@/types/chats/list-chats-dto";

type ChatListItemProps = {
  chat: ChatDto;
  name: string;
  isActive: boolean;
};

const ChatListItem = ({ chat, name, isActive }: ChatListItemProps) => (
  <li>
    <Button
      render={<Link to={`/chats/${chat.id}`} />}
      nativeButton={false}
      variant="ghost"
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "h-auto w-full justify-start gap-3 rounded-md px-3 py-3 text-left",
        isActive && "bg-accent text-accent-foreground",
      )}
    >
      <Avatar className="size-10">
        <AvatarFallback className="bg-primary/15 text-xs font-semibold text-foreground">
          {getNameInitials(name)}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
      <time dateTime={chat.summarySortAt} title={new Date(chat.summarySortAt).toLocaleString("pt-BR")} className="self-start pt-0.5 text-[0.65rem] font-normal text-muted-foreground">
        {formatChatDate(chat.summarySortAt)}
      </time>
    </Button>
  </li>
);

export { ChatListItem };
