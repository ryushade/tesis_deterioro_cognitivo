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
      title: "Pruebas cognitivas",
      url: "/pruebas-cognitivas",
      icon: Brain,
      roles: ['Administrador', 'Neuropsicologo'], // Todos pueden acceder a evaluaciones
      
    },
    {
      title: "Códigos de acceso",
      url: "/codigos-acceso",
      icon: Key,
      roles: ['Administrador', 'Neuropsicologo'], // Solo admin y neuropsicólogos
     
    },

    {
      title: "Evaluaciones",
      url: "/evaluaciones",
      icon: BarChart3,
      roles: ['Neuropsicologo'], // Solo neuropsicólogos
    },
    {
      title: "Resultados",
      url: "/resultados",
      icon: FileText,
      roles: ['Administrador', 'Neuropsicologo'], // Solo profesionales
      
    },

    {
      title: "Neuropsicólogos",
      url: "/neuropsicologos",
      icon: Users,
      roles: ['Administrador'], // Solo administradores
    },
     {
      title: "Permisos",
      url: "/configuracion/permisos",
      icon: Users,
      roles: ['Administrador'],
    },
    {
      title: "MMSE",
      url: "/configuracion/mmse",
      icon: Users,
      roles: ['Administrador', 'Neuropsicologo'],
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

  // Agrupar en secciones de navegación
  const pickByUrls = (urls: string[]) => navData.filter(i => urls.includes(i.url))
  const navMainItems = pickByUrls(["/dashboard","/pacientes","/pruebas-cognitivas","/codigos-acceso","/cdt-test"]) 
  const navReportsItems = pickByUrls(["/evaluaciones","/resultados"]) 
  const navGestionItems = pickByUrls(["/neuropsicologos","/roles-permisos"]) 
  const navConfigItems = pickByUrls(["/configuracion/permisos", "/configuracion/mmse"])

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
        {navMainItems.length > 0 && <NavMain label="Principal" items={navMainItems} />}
        {navGestionItems.length > 0 && <NavMain label="Gestión" items={navGestionItems} />}
        {navReportsItems.length > 0 && <NavMain label="Reportes" items={navReportsItems} />}
        {navConfigItems.length > 0 && <NavMain label="Configuracion" items={navConfigItems} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userWithAvatar} onLogout={onLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
