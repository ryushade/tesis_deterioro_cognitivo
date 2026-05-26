import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { DynamicBreadcrumb } from "@/components/layout/DynamicBreadcrumb";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    email: string;
    name: string;
  };
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  user, 
  onLogout 
}) => {
  return (
    <SidebarProvider>
      <AppSidebar user={user} onLogout={onLogout} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <DynamicBreadcrumb />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
