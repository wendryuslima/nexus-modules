import { ChevronsUpDown, LogOut, Settings, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSignOut } from "@/hooks/auth/use-sign-out";
import { getNameInitials } from "@/lib/get-name-initials";

type SidebarUserFooterProps = {
  name: string;
  email: string;
};

const SidebarUserFooter = ({ name, email }: SidebarUserFooterProps) => {
  const signOut = useSignOut();

  return (
    <SidebarFooter className="items-center px-2 pb-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  type="button"
                  aria-label={`Abrir menu de ${name}`}
                  title={name}
                  className="h-12 justify-center gap-1 p-1 data-popup-open:bg-sidebar-accent"
                />
              }
            >
              <Avatar className="size-9 border-0">
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                  {getNameInitials(name)}
                </AvatarFallback>
              </Avatar>
              <ChevronsUpDown
                aria-hidden="true"
                className="size-3 text-muted-foreground"
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex items-center gap-2 px-2 py-2">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-secondary text-xs font-semibold text-foreground">
                      {getNameInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-foreground">
                      {name}
                    </span>
                    <span className="block truncate text-[0.68rem] font-normal text-muted-foreground">
                      {email}
                    </span>
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Settings aria-hidden="true" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ShieldCheck aria-hidden="true" />
                  Segurança
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={signOut.isPending}
                  onClick={() => signOut.mutate()}
                >
                  <LogOut aria-hidden="true" />
                  {signOut.isPending ? "Saindo..." : "Sair"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {signOut.error && (
                <p role="alert" className="px-1.5 py-1 text-xs text-destructive">
                  {signOut.error.message}
                </p>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};

export { SidebarUserFooter };
