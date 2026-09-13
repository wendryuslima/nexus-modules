import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getNameInitials } from "@/lib/get-name-initials";

type SidebarUserFooterProps = {
  name: string;
  email: string;
};

const SidebarUserFooter = ({ name, email }: SidebarUserFooterProps) => {
  return (
    <SidebarFooter className="items-center px-2 pb-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            type="button"
            tooltip={`${name} — ${email}`}
            aria-label={`Usuário atual: ${name}, ${email}`}
            className="h-12 justify-center p-1 hover:bg-transparent"
          >
            <Avatar className="size-9 border-0">
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {getNameInitials(name)}
              </AvatarFallback>
            </Avatar>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};

export { SidebarUserFooter };
