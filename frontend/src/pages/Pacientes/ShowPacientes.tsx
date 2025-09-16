import React from 'react';
import { Eye, Edit, Trash2, Phone, MapPin, Calendar, Heart, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Paciente } from '@/services/pacientes.services';

interface ShowPacientesProps {
  pacientes: Paciente[];
  onView: (paciente: Paciente) => void;
  onEdit: (paciente: Paciente) => void;
  onDelete: (paciente: Paciente) => void;
}

const ShowPacientes: React.FC<ShowPacientesProps> = ({
  pacientes,
  onView,
  onEdit,
  onDelete
}) => {
  const getEstadoCognitivoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'leve':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderado':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'severo':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="grid gap-6">
      {pacientes.map((paciente) => (
        <Card key={paciente.id_paciente} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-blue-900">
                    {paciente.nombres} {paciente.apellidos}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>Cédula: {paciente.cedula}</span>
                    <span>•</span>
                    <span>{paciente.edad} años</span>
                    <div className={`ml-2 px-2 py-1 rounded-full text-xs border ${
                      paciente.estado_paciente === '1' || paciente.estado_paciente === 'Activo'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {paciente.estado_paciente === '1' || paciente.estado_paciente === 'Activo' ? 'Activo' : 'Inactivo'}
                    </div>
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(paciente)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(paciente)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(paciente)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Información Personal */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Información Personal
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">Nacimiento:</span>
                    <span>{formatDate(paciente.fecha_nacimiento)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">Teléfono:</span>
                    <span>{paciente.telefono}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">Dirección:</span>
                    <span className="flex-1">{paciente.direccion}</span>
                  </div>
                </div>
              </div>

              {/* Contacto de Emergencia */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-red-500" />
                  Contacto de Emergencia
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Nombre:</span>
                    <p className="font-medium">{paciente.contacto_emergencia}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">Teléfono:</span>
                    <span>{paciente.telefono_emergencia}</span>
                  </div>
                </div>
              </div>

              {/* Información Médica */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Información Médica
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Estado Cognitivo:</span>
                    <div className={`inline-block ml-2 px-2 py-1 rounded-full text-xs border ${getEstadoCognitivoColor(paciente.estado_cognitivo)}`}>
                      {paciente.estado_cognitivo}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Medicamentos:</span>
                    <p className="mt-1 text-gray-900">
                      {paciente.medicamentos || 'No especificado'}
                    </p>
                  </div>
                  {paciente.fecha_registro && (
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Registrado: {formatDate(paciente.fecha_registro)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ShowPacientes;
