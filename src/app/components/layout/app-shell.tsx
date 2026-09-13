import type { CSSProperties, ReactNode } from "react";

import { AppSidebar } from "@/app/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

type AppShellProps = {
  children: ReactNode;
  currentUserEmail: string | null;
};

const AppShell = ({ children, currentUserEmail }: AppShellProps) => {
  return (
    <TooltipProvider>
      <SidebarProvider
        className="h-dvh min-h-0 overflow-hidden"
        style={{ "--sidebar-width": "5.25rem" } as CSSProperties}
      >
        <AppSidebar currentUserEmail={currentUserEmail} />
        {children}
      </SidebarProvider>
    </TooltipProvider>
  );
};

export { AppShell };
