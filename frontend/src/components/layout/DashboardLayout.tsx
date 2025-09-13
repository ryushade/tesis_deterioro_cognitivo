import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

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
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
