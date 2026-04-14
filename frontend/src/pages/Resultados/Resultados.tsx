import { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService } from '@/services/auth';
import ResultadosIndividuales from './ComponentsResultados/ResultadosIndividuales';
import ResultadosGlobales from './ComponentsResultados/ResultadosGlobales';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetPacientes } from '@/services/pacienteServices';
import { useGetPruebas } from '@/services/pruebaServices';
import type { EvaluacionResultado } from '@/services/resultadosService';
import { resultadosService } from '@/services/resultadosService';

function Resultados() {
  const currentUser = authService.getUserFromStorage();
  const sidebarUser = {
    name: currentUser?.username || 'Usuario',
    email: currentUser?.role?.name || 'Rol no definido'
  };

  const { pacientes } = useGetPacientes();
  const { pruebas } = useGetPruebas();

  const [selectedPacienteId, setSelectedPacienteId] = useState<string>('');
  const [selectedPruebaId, setSelectedPruebaId] = useState<string>('');
  const [resultados, setResultados] = useState<EvaluacionResultado[]>([]);
  const [loadingResultados, setLoadingResultados] = useState(false);
  const [errorResultados, setErrorResultados] = useState<string | null>(null);

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  const handleBuscar = useCallback(async () => {
    if (!selectedPacienteId) return;
    setLoadingResultados(true);
    setErrorResultados(null);
    try {
      const idPrueba = selectedPruebaId ? parseInt(selectedPruebaId) : undefined;
      const resp = await resultadosService.getResultadosPaciente(parseInt(selectedPacienteId), idPrueba);
      if (resp.success) {
        setResultados(resp.data);
      } else {
        setErrorResultados(resp.message || 'Error al cargar resultados');
      }
    } catch (e: any) {
      setErrorResultados(e?.message || 'Error de red');
    } finally {
      setLoadingResultados(false);
    }
  }, [selectedPacienteId, selectedPruebaId]);

  return (
    <DashboardLayout user={sidebarUser} onLogout={handleLogout}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="mb-2">
            <h1 className="font-black text-5xl text-blue-900 tracking-tight mb-3">
              Resultados de las pruebas cognitivas
            </h1>
            <p className="text-lg font-medium text-blue-700/80 leading-relaxed">
              Consulta los resultados individuales y global de cada paciente.
            </p>
          </div>
        </div>
      </div>

      <Card className="p-4 mt-2">
        <div className="flex flex-row items-center justify-between w-full gap-4">
          <Select value={selectedPacienteId} onValueChange={setSelectedPacienteId}>
            <SelectTrigger className="w-xs">
              <SelectValue placeholder="Seleccione un paciente" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Pacientes</SelectLabel>
                {pacientes.map(p => (
                  <SelectItem key={p.id_paciente} value={p.id_paciente.toString()}>
                    {p.nombres} {p.apellidos}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={selectedPruebaId || 'todas'}
            onValueChange={(val) => setSelectedPruebaId(val === 'todas' ? '' : val)}
          >
            <SelectTrigger className="w-xs">
              <SelectValue placeholder="Seleccionar prueba cognitiva" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Prueba</SelectLabel>
                <SelectItem value="todas">Todas las pruebas</SelectItem>
                {pruebas.map(pr => (
                  <SelectItem key={pr.id_prueba} value={pr.id_prueba.toString()}>
                    {pr.nombre_prueba}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            onClick={handleBuscar}
            disabled={!selectedPacienteId || loadingResultados}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500"
          >
            <Plus className="h-4 w-4" />
            {loadingResultados ? 'Buscando...' : 'Buscar resultados'}
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="resu_indi" className="w-full mt-6">
        <TabsList>
          <TabsTrigger value="resu_indi">Resultados individuales</TabsTrigger>
          <TabsTrigger value="resu_global">Resultados globales</TabsTrigger>
        </TabsList>

        <TabsContent value="resu_indi">
          <ResultadosIndividuales
            resultados={resultados}
            loading={loadingResultados}
            error={errorResultados}
            mostrandoTodos={!selectedPacienteId}
          />
        </TabsContent>

        <TabsContent value="resu_global">
          <ResultadosGlobales />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

export default Resultados;
