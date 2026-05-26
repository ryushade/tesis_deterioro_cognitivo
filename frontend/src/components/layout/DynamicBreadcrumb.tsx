import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Mapeo de rutas a etiquetas legibles en español
const routeLabels: Record<string, string> = {
  dashboard: 'Inicio',
  pacientes: 'Pacientes',
  'pruebas-cognitivas': 'Pruebas neuropsicológicas',
  'codigos-acceso': 'Códigos de acceso',
  neuropsicologos: 'Neuropsicólogos',
  resultados: 'Resultados',
  configuracion: 'Configuración',
  mmse: 'MMSE',
};

export const DynamicBreadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Si estamos en el home o en dashboard, mostrar solo "Inicio"
  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Inicio</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard">Inicio</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {pathnames.map((value, index) => {
          // Omitir el segmento 'dashboard' de forma redundante si ya iniciamos con 'Inicio'
          if (value === 'dashboard') return null;

          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = routeLabels[value] || decodeURIComponent(value.charAt(0).toUpperCase() + value.slice(1));

          return (
            <React.Fragment key={to}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={to}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
