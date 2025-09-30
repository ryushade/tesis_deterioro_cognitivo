import React from 'react';
import ReactDOM from 'react-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, User, Calendar, Clock, Users, GraduationCap, Hash } from 'lucide-react';

interface Paciente {
  id?: number;
  id_paciente?: number;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: 'M' | 'F' | null;
  escolaridad?: 'primaria_basica' | 'secundaria_completa' | 'superior_completa' | string | null;
  fecha_registro?: string;
  fecha_actualizacion?: string;
  estado?: boolean;
}

interface ViewPacienteModalProps {
  open: boolean;
  onClose: () => void;
  paciente: Paciente | null;
}

function formatDate(dateString: string) {
  if (!dateString) return 'No especificada';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatSexo(sexo: string | null) {
  if (!sexo) return 'No especificado';
  return sexo === 'M' ? 'Masculino' : 'Femenino';
}

function calcularEdad(fechaNacimiento: string) {
  if (!fechaNacimiento) return 'N/A';
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return `${edad} años`;
}

function formatEscolaridad(value?: string | null) {
  switch (value) {
    case 'primaria_basica':
      return 'Primaria básica';
    case 'secundaria_completa':
      return 'Secundaria completa';
    case 'superior_completa':
      return 'Superior completa';
    default:
      return 'No especificado';
  }
}

const ViewPacienteModal: React.FC<ViewPacienteModalProps> = ({ open, onClose, paciente }) => {
  if (!open || !paciente) return null;

  return ReactDOM.createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px) saturate(180%) brightness(0.8)',
        WebkitBackdropFilter: 'blur(8px) saturate(180%) brightness(0.8)'
      }}
    >
      <Card
        className="relative w-full max-w-md max-h-[90vh] overflow-hidden bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h2 className="text-xl font-semibold">Detalles del paciente</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="px-6 py-2 space-y-4 overflow-y-auto">
         

          {/* Nombre Completo */}
          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Nombre Completo</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {paciente.nombres} {paciente.apellidos}
            </p>
          </div>

          {/* Información Personal */}
          <div className="grid grid-cols-1 gap-4">
            {/* Fecha de Nacimiento y Edad */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Fecha de nacimiento</span>
              </div>
              <p className="text-sm text-gray-900">{formatDate(paciente.fecha_nacimiento)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  {calcularEdad(paciente.fecha_nacimiento)}
                </span>
              </div>
            </div>

            {/* Sexo */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Sexo</span>
              </div>
              <Badge variant="secondary" className="capitalize">
                {formatSexo(paciente.sexo)}
              </Badge>
            </div>

            {/* Escolaridad */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Escolaridad</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {formatEscolaridad(paciente.escolaridad)}
              </Badge>
            </div>
          </div>

          {/* Información de Sistema */}
          {(paciente.fecha_registro || paciente.fecha_actualizacion) && (
            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Información del sistema</h4>
              <div className="text-xs text-gray-500 space-y-1">
                {paciente.fecha_registro && (
                  <p>Registrado: {new Date(paciente.fecha_registro).toLocaleString('es-ES')}</p>
                )}
                {paciente.fecha_actualizacion && (
                  <p>Actualizado: {new Date(paciente.fecha_actualizacion).toLocaleString('es-ES')}</p>
                )}
                {paciente.estado !== undefined && (
                  <p>Estado: {paciente.estado ? 'Activo' : 'Inactivo'}</p>
                )}
              </div>
            </div>
          )}

          {/* Botón de Cerrar */}
          <div className="pt-2">
            <Button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-700">
              Cerrar
            </Button>
          </div>
        </div>
      </Card>
    </div>,
    document.body
  );
};

export default ViewPacienteModal;

