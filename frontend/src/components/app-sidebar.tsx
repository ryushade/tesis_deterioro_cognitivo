import * as React from "react"
import {
  Brain,
  Users,
  BarChart3,
  Settings,
  FileText,
  Database,
  Home,
  Activity,
  Key,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { AuthorizationService } from "@/services/auth.middleware"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import "./sidebar-fallback.css"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
  };
  onLogout?: () => void;
}

export function AppSidebar({ user, onLogout, ...props }: AppSidebarProps) {
  // Debug: Log current user info
  React.useEffect(() => {
    const currentUser = AuthorizationService.hasRole(['Administrador', 'Neuropsicologo', 'Paciente']);
    console.log('AppSidebar - User prop:', user);
    console.log('AppSidebar - Has any role:', currentUser);
    console.log('AppSidebar - User from auth service:', AuthorizationService.isNeuropsicologo());
  }, [user]);

  // Navigation data for cognitive deterioration thesis
  const allNavData = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: window.location.pathname === "/dashboard",
      roles: ['Administrador', 'Neuropsicologo', 'Paciente'], // Todos pueden ver el dashboard
    },
    {
      title: "Pacientes",
      url: "/pacientes",
      icon: Users,
      roles: ['Administrador', 'Neuropsicologo'], // Solo admin y neuropsicólogos
     
    },
    {
      title: "Evaluaciones",
      url: "/evaluaciones",
      icon: Brain,
      roles: ['Administrador', 'Neuropsicologo', 'Paciente'], // Todos pueden acceder a evaluaciones
      
    },
    {
      title: "Códigos de acceso",
      url: "/codigos-acceso",
      icon: Key,
      roles: ['Administrador', 'Neuropsicologo'], // Solo admin y neuropsicólogos
     
    },
    {
      title: "Informes",
      url: "/informes",
      icon: FileText,
      roles: ['Administrador', 'Neuropsicologo'], // Solo profesionales
      
    },
    
    {
      title: "CDT Test (Demo)",
      url: "/cdt-test",
      icon: Activity,
      // Sin restricción de roles - todos pueden acceder
    },
    
    {
      title: "Gestión de Usuarios",
      url: "/usuarios",
      icon: Database,
      roles: ['Administrador'], // Solo administradores
      items: [
        {
          title: "Usuarios",
          url: "/usuarios/lista",
        },
        {
          title: "Roles",
          url: "/usuarios/roles",
        },
        {
          title: "Permisos",
          url: "/usuarios/permisos",
        },
      ],
    },
    {
      title: "Configuración",
      url: "/configuracion",
      icon: Settings,
      roles: ['Administrador', 'Neuropsicologo', 'Paciente'], // Todos pueden acceder a su configuración
      
    },
  ];

  // Filter navigation based on user roles
  const navData = React.useMemo(() => {
    const filtered = allNavData.filter(item => {
      if (!item.roles || item.roles.length === 0) return true; // Show items without role restrictions
      
      const hasRole = AuthorizationService.hasRole(item.roles);
      console.log(`Item "${item.title}" - Required roles: ${item.roles.join(', ')} - Has access: ${hasRole}`);
      
      return hasRole;
    });
    
    console.log('Filtered navigation items:', filtered.map(item => item.title));
    return filtered;
  }, [user]); // Re-compute when user changes

  const userWithAvatar = {
    ...user,
    avatar: "", // No avatar for now
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Brain className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold text-base tracking-tight">Deterioro cognitivo</span>
            <span className="truncate text-xs text-sidebar-foreground/70 font-medium">Sistema inteligente</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userWithAvatar} onLogout={onLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
