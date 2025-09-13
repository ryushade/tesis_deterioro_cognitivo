import { useEffect, useState } from 'react';
import PacientesForm from './PacientesForm';
import { FaPlus } from "react-icons/fa";
import { ShowPacientes } from '@/pages/Pacientes/ShowPacientes';
import { Button } from '@/components/ui/button';
import BarraSearch from './BarraSearch';
import { getPacientes } from '@/services/pacientes.services';

function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [activeAdd, setModalOpen] = useState(false);

  // Input de búsqueda de pacientes
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  useEffect(() => {
    const fetchPacientes = async () => {
      const data = await getPacientes();
      setPacientes(data);
    };
    fetchPacientes();
  }, []);

  // Utilidad para transformar estado del paciente dinámicamente
  const transformPaciente = (paciente) => ({
    ...paciente,
    estado_paciente: paciente.estado_paciente === 1 || paciente.estado_paciente === "1" ? "Activo" : "Inactivo",
    // Calcular edad si no viene calculada
    edad: paciente.edad || calculateAge(paciente.fecha_nacimiento)
  });

  // Calcular edad basada en fecha de nacimiento
  const calculateAge = (fechaNacimiento) => {
    if (!fechaNacimiento) return '';
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
  const addPaciente = (nuevoPaciente) => {
    setPacientes(prev => [transformPaciente(nuevoPaciente), ...prev]);
  };

  // Actualizar paciente en el array local
  const updatePacienteLocal = (id_paciente, updatedData) => {
    setPacientes(prev =>
      prev.map(p =>
        p.id_paciente === id_paciente
          ? { ...p, ...transformPaciente(updatedData) }
          : p
      )
    );
  };

  // Eliminar paciente del array local
  const removePaciente = (id_paciente) => {
    setPacientes(prev => prev.filter(p => p.id_paciente !== id_paciente));
  };

  return (
    <div className="min-h-screen py-8 px-2 sm:px-6">
      <Toaster />
      <h1 className="font-extrabold text-4xl text-blue-900 tracking-tight mb-2">
        Gestión de pacientes
      </h1>
      <p className="text-base text-blue-700/80 mb-4">
        Listado de pacientes registrados en el sistema.
      </p>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <BarraSearch
          placeholder="Buscar paciente por nombre o cédula"
          isClearable={true}
          className="h-9 text-sm w-full md:w-72"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <FaPlus className="mr-2 text-lg" />
          Agregar Paciente
        </Button>
      </div>
      <ShowPacientes
        searchTerm={searchTerm}
        pacientes={pacientes}
        addPaciente={addPaciente}
        updatePacienteLocal={updatePacienteLocal}
        removePaciente={removePaciente}
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
