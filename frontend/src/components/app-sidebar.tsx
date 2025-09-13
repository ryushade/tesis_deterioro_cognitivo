import * as React from "react"
import {
  Brain,
  Users,
  BarChart3,
  Settings,
  FileText,
  Database,
  Home,
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
  };
  onLogout?: () => void;
}

export function AppSidebar({ user, onLogout, ...props }: AppSidebarProps) {
  // Navigation data for cognitive deterioration thesis
  const allNavData = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
      roles: ['Administrador', 'Neuropsicólogo', 'Paciente'], // Todos pueden ver el dashboard
    },
    {
      title: "Pacientes",
      url: "/pacientes",
      icon: Users,
      roles: ['Administrador', 'Neuropsicólogo'], // Solo admin y neuropsicólogos
      items: [
        {
          title: "Lista de Pacientes",
          url: "/pacientes",
        },
        {
          title: "Nuevo Paciente",
          url: "/pacientes?new=true",
        },
        {
          title: "Historial Médico",
          url: "/pacientes/historial",
        },
      ],
    },
    {
      title: "Evaluaciones",
      url: "/evaluaciones",
      icon: Brain,
      roles: ['Administrador', 'Neuropsicólogo', 'Paciente'], // Todos pueden acceder a evaluaciones
      items: [
        {
          title: "Test Cognitivos",
          url: "/evaluaciones/tests",
        },
        {
          title: "Resultados",
          url: "/evaluaciones/resultados",
        },
        {
          title: "Seguimiento",
          url: "/evaluaciones/seguimiento",
        },
      ],
    },
    {
      title: "Análisis",
      url: "/analisis",
      icon: BarChart3,
      roles: ['Administrador', 'Neuropsicólogo'], // Solo profesionales
      items: [
        {
          title: "Estadísticas",
          url: "/analisis/estadisticas",
        },
        {
          title: "Reportes",
          url: "/analisis/reportes",
        },
        {
          title: "Tendencias",
          url: "/analisis/tendencias",
        },
      ],
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
      title: "Reportes",
      url: "/reportes",
      icon: FileText,
      roles: ['Administrador', 'Neuropsicólogo'], // Solo profesionales
      items: [
        {
          title: "Generar Reporte",
          url: "/reportes/generar",
        },
        {
          title: "Plantillas",
          url: "/reportes/plantillas",
        },
        {
          title: "Historial",
          url: "/reportes/historial",
        },
      ],
    },
    {
      title: "Configuración",
      url: "/configuracion",
      icon: Settings,
      roles: ['Administrador', 'Neuropsicólogo', 'Paciente'], // Todos pueden acceder a su configuración
      items: [
        {
          title: "Perfil",
          url: "/configuracion/perfil",
        },
        {
          title: "Sistema",
          url: "/configuracion/sistema",
        },
        {
          title: "Seguridad",
          url: "/configuracion/seguridad",
        },
      ],
    },
  ];

  // Filter navigation based on user roles
  const navData = allNavData.filter(item => {
    if (!item.roles) return true; // Show items without role restrictions
    return AuthorizationService.hasRole(item.roles);
  });

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
            <span className="truncate font-semibold">Deterioro cognitivo</span>
            <span className="truncate text-xs text-sidebar-foreground/70">Sistema inteligente</span>
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
