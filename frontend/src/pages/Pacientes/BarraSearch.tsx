import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BarraSearchProps {
  onSearch: (searchTerm: string) => void;
  onFilterChange?: (filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}

interface SearchFilters {
  estadoCognitivo: string;
  edadMin: number;
  edadMax: number;
  estadoPaciente: string;
}

const BarraSearch: React.FC<BarraSearchProps> = ({
  onSearch,
  onFilterChange,
  placeholder = 'Buscar pacientes...',
  showFilters = true,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    estadoCognitivo: '',
    edadMin: 65,
    edadMax: 100,
    estadoPaciente: ''
  });

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearch]);

  // Apply filters when they change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  const clearFilters = () => {
    setFilters({
      estadoCognitivo: '',
      edadMin: 65,
      edadMax: 100,
      estadoPaciente: ''
    });
  };

  const hasActiveFilters = filters.estadoCognitivo !== '' || 
                          filters.edadMin !== 65 || 
                          filters.edadMax !== 100 || 
                          filters.estadoPaciente !== '';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10 pr-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {showFilters && (
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-1.5 rounded-md transition-colors ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Filtros avanzados"
            >
              <Filter className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filtros avanzados */}
      {showFilters && showAdvancedFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Filtros Avanzados</h3>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Estado Cognitivo */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Estado Cognitivo
              </label>
              <select
                value={filters.estadoCognitivo}
                onChange={(e) => handleFilterChange('estadoCognitivo', e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="No evaluado">No evaluado</option>
                <option value="Normal">Normal</option>
                <option value="Leve">Deterioro Leve</option>
                <option value="Moderado">Deterioro Moderado</option>
                <option value="Severo">Deterioro Severo</option>
              </select>
            </div>

            {/* Edad Mínima */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Edad Mínima
              </label>
              <Input
                type="number"
                min="65"
                max="120"
                value={filters.edadMin}
                onChange={(e) => handleFilterChange('edadMin', parseInt(e.target.value) || 65)}
                className="text-sm"
              />
            </div>

            {/* Edad Máxima */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Edad Máxima
              </label>
              <Input
                type="number"
                min="65"
                max="120"
                value={filters.edadMax}
                onChange={(e) => handleFilterChange('edadMax', parseInt(e.target.value) || 100)}
                className="text-sm"
              />
            </div>

            {/* Estado del Paciente */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Estado
              </label>
              <select
                value={filters.estadoPaciente}
                onChange={(e) => handleFilterChange('estadoPaciente', e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Resumen de filtros activos */}
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {filters.estadoCognitivo && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Estado: {filters.estadoCognitivo}
                    <button
                      onClick={() => handleFilterChange('estadoCognitivo', '')}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(filters.edadMin !== 65 || filters.edadMax !== 100) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Edad: {filters.edadMin}-{filters.edadMax} años
                    <button
                      onClick={() => {
                        handleFilterChange('edadMin', 65);
                        handleFilterChange('edadMax', 100);
                      }}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.estadoPaciente && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    Estado: {filters.estadoPaciente === '1' ? 'Activo' : 'Inactivo'}
                    <button
                      onClick={() => handleFilterChange('estadoPaciente', '')}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BarraSearch;
