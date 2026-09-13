import type { LucideIcon } from "lucide-react";
import {
  FolderClosed,
  MessageCircle,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { SidebarUserFooter } from "@/app/components/layout/sidebar-user-footer";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { getUserDisplayName } from "@/lib/get-user-display-name";

type AppSidebarProps = {
  currentUserEmail: string | null;
};

type NavigationItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

const navigationItems: NavigationItem[] = [
  { label: "Conversas", icon: MessageCircle },
  { label: "Grupos", icon: UsersRound },
  { label: "Pessoas", icon: UserRound, href: "/people" },
  { label: "Arquivos", icon: FolderClosed },
];

const AppSidebar = ({ currentUserEmail }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();
  const currentUserName = currentUserEmail
    ? getUserDisplayName(currentUserEmail)
    : "Nexus";

  const navigateTo = (href?: string) => {
    if (!href) {
      return;
    }

    navigate(href);
    setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-sidebar-border">
      <SidebarHeader className="items-center px-2 pt-5 pb-3">
        <img
          src="/nexuslogo-png.jpg"
          alt="Nexus"
          className="size-11 rounded-xl object-cover"
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-2 py-3">
          <SidebarMenu className="gap-2">
            {navigationItems.map(({ label, icon: Icon, href }) => {
              const isActive = href === location.pathname;

              return (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton
                    type="button"
                    isActive={isActive}
                    tooltip={href ? label : `${label} — em breve`}
                    aria-current={isActive ? "page" : undefined}
                    aria-disabled={!href}
                    onClick={() => navigateTo(href)}
                    className="h-14 flex-col justify-center gap-1 rounded-lg px-1 py-2 text-[0.68rem] text-muted-foreground data-active:bg-sidebar-accent data-active:text-sidebar-primary hover:text-sidebar-primary aria-disabled:cursor-default aria-disabled:hover:bg-transparent aria-disabled:hover:text-muted-foreground [&_svg]:size-5"
                  >
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarUserFooter
        name={currentUserName}
        email={currentUserEmail ?? "E-mail indisponível"}
      />
    </Sidebar>
  );
};

export { AppSidebar };
