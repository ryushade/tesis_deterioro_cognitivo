import { useEffect, useState } from 'react';
import PacientesForm from './PacientesForm';
import { FaPlus } from "react-icons/fa";
import ShowPacientes from '@/pages/Pacientes/ShowPacientes';
import { Button } from '@/components/ui/button';
import BarraSearch from './BarraSearch';
import { type Paciente, pacientesService } from '@/services/pacientes.services';

function Pacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [activeAdd, setModalOpen] = useState(false);

  // Input de búsqueda de pacientes
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearch = (term: string) => setSearchTerm(term);

  useEffect(() => {
    const fetchPacientes = async () => {
      const data = await pacientesService.getAllPacientes();
      setPacientes(data);
    };
    fetchPacientes();
  }, []);

  // Utilidad para transformar estado del paciente dinámicamente
  const transformPaciente = (paciente: Paciente): Paciente => ({
    ...paciente,
    estado_paciente: paciente.estado_paciente === 1 || paciente.estado_paciente === "1" ? "Activo" : "Inactivo",
    // Calcular edad si no viene calculada
    edad: paciente.edad || calculateAge(paciente.fecha_nacimiento)
  });

  // Calcular edad basada en fecha de nacimiento
  const calculateAge = (fechaNacimiento: string | null | undefined): number | undefined => {
    if (!fechaNacimiento) return undefined;
    const birth = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Al agregar paciente
  const addPaciente = (nuevoPaciente: Paciente) => {
    setPacientes(prev => [transformPaciente(nuevoPaciente), ...prev]);
  };

  // Eliminar paciente del array local
  const removePaciente = (id_paciente: number) => {
    setPacientes(prev => prev.filter(p => p.id_paciente !== id_paciente));
  };

  return (
    <div className="min-h-screen py-8 px-2 sm:px-6">
      <div className="mb-8">
        <h1 className="font-black text-5xl text-blue-900 tracking-tight mb-3">
          Gestión de pacientes
        </h1>
        <p className="text-lg font-medium text-blue-700/80 leading-relaxed">
          Administra y visualiza la información de todos los pacientes registrados en el sistema.
        </p>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <BarraSearch
          placeholder="Buscar paciente por nombre o cédula"
          className="h-10 text-sm w-full md:w-72 font-medium"
          onSearch={handleSearch}
        />
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
        >
          <FaPlus className="mr-2 text-lg" />
          Agregar Paciente
        </Button>
      </div>
      <ShowPacientes
        pacientes={pacientes.filter(p => 
          p.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.cedula.includes(searchTerm)
        )}
        onView={(paciente) => console.log('Ver paciente:', paciente)}
        onEdit={(paciente) => console.log('Editar paciente:', paciente)}
        onDelete={(paciente) => removePaciente(paciente.id_paciente!)}
      />
      {activeAdd && (
        <PacientesForm
          modalTitle="Nuevo Paciente"
          onClose={() => setModalOpen(false)}
          onSuccess={addPaciente}
          pacientes={pacientes}
        />
      )}
    </div>
  );
}

export default Pacientes;
