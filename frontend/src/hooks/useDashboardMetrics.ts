import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboard.service';

export interface DashboardMetrics {
  usuarios_activos: number;
  pacientes_registrados: number;
  evaluaciones_realizadas: number;
  neuropsicologos_activos: number;
  evaluaciones_por_mes: Array<{
    mes: string;
    cantidad: number;
  }>;
  pacientes_por_edad: Array<{
    rango_edad: string;
    cantidad: number;
  }>;
  evaluaciones_por_tipo: Array<{
    tipo: string;
    cantidad: number;
  }>;
}

export interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardMetrics(): UseDashboardMetricsReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    usuarios_activos: 0,
    pacientes_registrados: 0,
    evaluaciones_realizadas: 0,
    neuropsicologos_activos: 0,
    evaluaciones_por_mes: [],
    pacientes_por_edad: [],
    evaluaciones_por_tipo: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getMetrics();
      
      if (response.success) {
        setMetrics(response.data);
      } else {
        setError(response.message || 'Error al cargar métricas');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
}
