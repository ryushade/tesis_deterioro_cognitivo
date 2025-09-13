import { useState } from 'react';
import { Plus, Users, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService } from '@/services/auth';
import ShowPacientes from './ShowPacientes';

interface Paciente {
  id_paciente: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  fecha_nacimiento: string;
  edad: number;
  telefono: string;
  direccion: string;
  contacto_emergencia: string;
  telefono_emergencia: string;
  estado_cognitivo: string;
  medicamentos: string;
  estado_paciente: string;
  fecha_registro: string;
}

function Pacientes() {
  const [pacientes] = useState<Paciente[]>([
    {
      id_paciente: 1,
      nombres: 'María',
      apellidos: 'González',
      cedula: '1234567890',
      fecha_nacimiento: '1950-05-15',
      edad: 74,
      telefono: '0999123456',
      direccion: 'Av. Principal 123',
      contacto_emergencia: 'Juan González',
      telefono_emergencia: '0998765432',
      estado_cognitivo: 'Normal',
      medicamentos: 'Aspirina 100mg',
      estado_paciente: '1',
      fecha_registro: '2024-01-15'
    },
    {
      id_paciente: 2,
      nombres: 'Carlos',
      apellidos: 'Rodríguez',
      cedula: '0987654321',
      fecha_nacimiento: '1948-12-03',
      edad: 76,
      telefono: '0999987654',
      direccion: 'Calle Secundaria 456',
      contacto_emergencia: 'Ana Rodríguez',
      telefono_emergencia: '0998123456',
      estado_cognitivo: 'Leve',
      medicamentos: 'Donepezilo 5mg',
      estado_paciente: '1',
      fecha_registro: '2024-02-20'
    }
  ]);

  // Get user data from localStorage
  const currentUser = authService.getUserFromStorage();
  
  const sidebarUser = {
    name: currentUser?.username || 'Usuario',
    email: currentUser?.role?.name || 'Rol no definido'
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  return (
    <DashboardLayout 
      user={sidebarUser}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Pacientes</h1>
              <p className="text-gray-600">Sistema de seguimiento cognitivo para adultos mayores (65+)</p>
            </div>
          </div>
          
          <Button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Nuevo Paciente
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Pacientes</p>
                  <p className="text-2xl font-bold text-blue-600">{pacientes.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {pacientes.filter(p => p.estado_paciente === '1').length}
                  </p>
                </div>
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En Evaluación</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pacientes.filter(p => p.estado_cognitivo === 'No evaluado').length}
                  </p>
                </div>
                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de pacientes */}
        <ShowPacientes
          pacientes={pacientes}
          onView={(paciente: Paciente) => alert(`Ver paciente: ${paciente.nombres} ${paciente.apellidos}`)}
          onEdit={(paciente: Paciente) => alert(`Editar paciente: ${paciente.nombres} ${paciente.apellidos}`)}
          onDelete={(paciente: Paciente) => {
            if (confirm(`¿Está seguro de eliminar a ${paciente.nombres} ${paciente.apellidos}?`)) {
              alert('Paciente eliminado (simulación)');
            }
          }}
        />
      </div>
    </DashboardLayout>
  );
}

export default Pacientes;
