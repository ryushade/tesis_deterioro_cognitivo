import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Brain, AlertCircle, User, Phone, Heart } from 'lucide-react';
import type { Paciente } from '@/services/pacientes.services';

interface PacientesFormProps {
  modalTitle: string;
  onClose: () => void;
  onSuccess: (paciente: Paciente | any) => void;
  initialData?: {
    id_paciente: number;
    data: Paciente;
  };
  pacientes: Paciente[];
}

const PacientesForm = ({ modalTitle, onClose, initialData, onSuccess }: PacientesFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Paciente>({
    nombres: '',
    apellidos: '',
    cedula: '',
    fecha_nacimiento: '',
    telefono: '',
    direccion: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
    estado_cognitivo: 'No evaluado',
    medicamentos: '',
    estado_paciente: '1'
  });

  useEffect(() => {
    if (initialData?.data) {
      setFormData(initialData.data);
    }
  }, [initialData]);

  // Calcular edad basada en fecha de nacimiento
  const calculateAge = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return 0;
    const birth = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Calcular edad automáticamente cuando cambia la fecha de nacimiento
    if (name === 'fecha_nacimiento') {
      const edad = calculateAge(value);
      setFormData(prev => ({
        ...prev,
        edad
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validar que sea mayor de 65 años
      const edad = calculateAge(formData.fecha_nacimiento);
      if (edad < 65) {
        setError('El paciente debe ser mayor de 65 años para ingresar al programa.');
        setIsLoading(false);
        return;
      }

      const pacienteData = {
        ...formData,
        edad,
        estado_paciente: parseInt(formData.estado_paciente as string)
      };

      if (initialData) {
        // Editar paciente existente
        // await updatePaciente(initialData.id_paciente, pacienteData);
        onSuccess({ id_paciente: initialData.id_paciente, ...pacienteData });
      } else {
        // Crear nuevo paciente
        // const result = await addPaciente(pacienteData);
        onSuccess({ ...pacienteData, id_paciente: Date.now() }); // Simulado
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al procesar la información del paciente');
    } finally {
      setIsLoading(false);
    }
  };

  const isEdit = !!initialData;
  const edad = calculateAge(formData.fecha_nacimiento);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-blue-900">{modalTitle}</CardTitle>
              <CardDescription>
                {isEdit ? 'Actualizar información del paciente' : 'Registro de nuevo paciente de 65+ años'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Información Personal</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres *</Label>
                  <Input
                    id="nombres"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    placeholder="Nombres del paciente"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    placeholder="Apellidos del paciente"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cedula">Cédula de Identidad *</Label>
                  <Input
                    id="cedula"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleInputChange}
                    placeholder="1234567890"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                  <Input
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  {formData.fecha_nacimiento && (
                    <p className={`text-sm ${edad >= 65 ? 'text-green-600' : 'text-red-600'}`}>
                      Edad: {edad} años {edad < 65 && '(Mínimo 65 años requerido)'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Información de Contacto</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="0999999999"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Dirección completa"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contacto_emergencia">Contacto de Emergencia *</Label>
                  <Input
                    id="contacto_emergencia"
                    name="contacto_emergencia"
                    value={formData.contacto_emergencia}
                    onChange={handleInputChange}
                    placeholder="Nombre del familiar/cuidador"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefono_emergencia">Teléfono de Emergencia *</Label>
                  <Input
                    id="telefono_emergencia"
                    name="telefono_emergencia"
                    value={formData.telefono_emergencia}
                    onChange={handleInputChange}
                    placeholder="0999999999"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Información Médica */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Información Médica</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estado_cognitivo">Estado Cognitivo</Label>
                  <select
                    id="estado_cognitivo"
                    name="estado_cognitivo"
                    value={formData.estado_cognitivo}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={isLoading}
                  >
                    <option value="No evaluado">No evaluado</option>
                    <option value="Normal">Normal</option>
                    <option value="Leve">Deterioro Leve</option>
                    <option value="Moderado">Deterioro Moderado</option>
                    <option value="Severo">Deterioro Severo</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estado_paciente">Estado del Paciente</Label>
                  <select
                    id="estado_paciente"
                    name="estado_paciente"
                    value={formData.estado_paciente}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={isLoading}
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medicamentos">Medicamentos Actuales</Label>
                <textarea
                  id="medicamentos"
                  name="medicamentos"
                  value={formData.medicamentos}
                  onChange={handleInputChange}
                  placeholder="Liste los medicamentos que toma actualmente..."
                  className="w-full p-2 border border-gray-300 rounded-md h-20"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || edad < 65}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? 'Actualizando...' : 'Registrando...'}
                  </>
                ) : (
                  isEdit ? 'Actualizar Paciente' : 'Registrar Paciente'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PacientesForm;
