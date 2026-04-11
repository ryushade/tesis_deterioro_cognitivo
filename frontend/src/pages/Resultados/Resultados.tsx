import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService } from '@/services/auth';
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
import {
  Card,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"


function Resultados() {


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
     <div className="flex flex-row items-center justify-between w-full"> 
        <Select>
            <SelectTrigger className="w-xs">
            <SelectValue placeholder="Seleccione un paciente" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Pacientes</SelectLabel>
                    <SelectItem value="manzana">Manzana</SelectItem>
                    <SelectItem value="pera">Pera</SelectItem>
                    <SelectItem value="uva">Uva</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>

        <Select>
            <SelectTrigger className="w-xs">
            <SelectValue placeholder="Seleccionar prueba cognitiva" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="manzana">Prueba Mini-Mental (MMSE)</SelectItem>
                    <SelectItem value="pera">Prueba del reloj</SelectItem>
                    <SelectItem value="uva">Prueba de fluidez verbal</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
        

         <Button
            // onClick={}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Generar informe
          </Button>
        </div>
    </Card>
        <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="resu_indi">Resultados individuales</TabsTrigger>
        <TabsTrigger value="resu_global">Resultados globales</TabsTrigger>
        <TabsTrigger value="analitica">Analitica</TabsTrigger>
      </TabsList>
      </Tabs>

            
    </DashboardLayout>
  );
}

export default Resultados;
