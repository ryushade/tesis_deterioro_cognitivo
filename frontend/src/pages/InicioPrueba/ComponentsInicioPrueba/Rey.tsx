import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, Eye } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { useGetPacientes, type Paciente } from '@/services/pacientesService';
import { evaluacionesLiveService } from '@/services/evaluacionesLive.service';
import type { EvaluacionCognitiva } from '@/types/evaluaciones';

const PAGE_SIZES = [5, 10, 20] as const;

type Estado = 'pendiente' | 'procesando' | 'completada' | 'fallida';

const estadoEvaluacionStyle: Record<Estado, string> = {
  pendiente: 'bg-slate-100 text-slate-700',
  procesando: 'bg-amber-100 text-amber-700',
  completada: 'bg-emerald-100 text-emerald-700',
  fallida: 'bg-red-100 text-red-700',
};

const estadoLabels: Record<Estado, string> = {
  pendiente: 'Pendiente',
  procesando: 'Procesando',
  completada: 'Completada',
  fallida: 'Fallida',
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatScore = (value?: number | null, max?: number | null) => {
  if (value === null || value === undefined) return 'Pendiente';
  if (max === null || max === undefined) return `${value.toFixed(1)}`;
  return `${value.toFixed(1)} / ${Number(max).toFixed(1)}`;
};

type EvalMap = Record<number, EvaluacionCognitiva | null>;

// Acepta códigos REY o ROCF por compatibilidad
const isReyCode = (code?: string | null) => {
  const c = (code || '').toUpperCase();
  return c === 'REY' || c === 'ROCF' || c.includes('REY');
};

export default function Rey() {
  const { pacientes, metadata, loading, error, refetch } = useGetPacientes();

  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(PAGE_SIZES[0]);

  const [reyByPaciente, setReyByPaciente] = useState<EvalMap>({});
  const [loadingEstados, setLoadingEstados] = useState(false);

  const [detalleOpen, setDetalleOpen] = useState(false);
  const [detallePaciente, setDetallePaciente] = useState<Paciente | null>(null);
  const [detalleEvaluaciones, setDetalleEvaluaciones] = useState<EvaluacionCognitiva[]>([]);
  const [detalleLoading, setDetalleLoading] = useState(false);

  useEffect(() => {
    if (metadata?.limit && PAGE_SIZES.includes(metadata.limit as any)) {
      setItemsPerPage(metadata.limit);
    }
  }, [metadata?.limit]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    refetch(1, itemsPerPage, value);
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    const targetPage = direction === 'prev' ? Math.max(1, (metadata?.page || 1) - 1) : (metadata?.page || 1) + 1;
    if ((direction === 'prev' && !metadata?.has_prev) || (direction === 'next' && !metadata?.has_next)) return;
    refetch(targetPage, itemsPerPage, searchTerm);
  };

  const handlePageSizeChange = (value: string) => {
    const size = Number(value) || PAGE_SIZES[0];
    setItemsPerPage(size);
    refetch(1, size, searchTerm);
  };

  const cargarEstadosPagina = useCallback(async () => {
    if (!pacientes?.length) return;
    setLoadingEstados(true);
    try {
      const entries = await Promise.all(
        pacientes.map(async (p) => {
          const resp = await evaluacionesLiveService.getByPaciente(p.id_paciente);
          if (!resp.success || !resp.data?.length) return [p.id_paciente, null] as const;
          const rey = resp.data
            .filter((e) => isReyCode(e.tipo_evaluacion_codigo))
            .sort((a, b) => new Date(b.fecha_evaluacion).getTime() - new Date(a.fecha_evaluacion).getTime())[0] || null;
          return [p.id_paciente, rey] as const;
        })
      );
      const map: EvalMap = {};
      for (const [id, evalItem] of entries) map[id] = evalItem;
      setReyByPaciente(map);
    } finally {
      setLoadingEstados(false);
    }
  }, [pacientes]);

  const abrirDetalle = async (pac: Paciente) => {
    setDetallePaciente(pac);
    setDetalleOpen(true);
    setDetalleLoading(true);
    try {
      const resp = await evaluacionesLiveService.getByPaciente(pac.id_paciente);
      const items = (resp.data || [])
        .filter((e) => isReyCode(e.tipo_evaluacion_codigo))
        .sort((a, b) => new Date(b.fecha_evaluacion).getTime() - new Date(a.fecha_evaluacion).getTime());
      setDetalleEvaluaciones(items);
    } finally {
      setDetalleLoading(false);
    }
  };

  const columnas = useMemo(
    () => [
      'Paciente',
      'Edad',
      'Sexo',
      'Escolaridad',
      'Última REY',
      'Puntaje',
      'Estado',
      'Acciones',
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-64"
          />
          <Select onValueChange={handlePageSizeChange} value={String(itemsPerPage)}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Filas" /></SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>{s} por página</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch(metadata?.page || 1, itemsPerPage, searchTerm)}>
            <RefreshCw className="mr-2 h-4 w-4" /> Recargar lista
          </Button>
          <Button size="sm" onClick={cargarEstadosPagina} disabled={loading || loadingEstados}>
            {loadingEstados ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Actualizar estados REY
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {columnas.map((c) => (
                <TableHead key={c} className="text-xs font-medium uppercase text-gray-500">{c}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columnas.length} className="py-8 text-center text-sm text-gray-500">
                  <div className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando pacientes…</div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columnas.length} className="py-6 text-center text-sm text-red-600">
                  {error}
                </TableCell>
              </TableRow>
            ) : pacientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnas.length} className="py-6 text-center text-sm text-gray-500">
                  No hay pacientes para mostrar
                </TableCell>
              </TableRow>
            ) : (
              pacientes.map((p) => {
                const evalItem = reyByPaciente[p.id_paciente] || null;
                return (
                  <TableRow key={p.id_paciente}>
                    <TableCell className="font-medium">{p.nombre_completo}</TableCell>
                    <TableCell className="whitespace-nowrap">{p.edad ?? '—'}</TableCell>
                    <TableCell className="whitespace-nowrap">{p.sexo_display || '—'}</TableCell>
                    <TableCell className="whitespace-nowrap">{p.escolaridad || '—'}</TableCell>
                    <TableCell className="whitespace-nowrap">{evalItem ? formatDateTime(evalItem.fecha_evaluacion) : '—'}</TableCell>
                    <TableCell className="whitespace-nowrap">{evalItem ? formatScore(evalItem.puntuacion_total, evalItem.puntuacion_maxima) : '—'}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {evalItem ? (
                        <span className={`rounded-full px-2 py-1 text-xs ${estadoEvaluacionStyle[evalItem.estado_procesamiento as Estado]}`}>
                          {estadoLabels[evalItem.estado_procesamiento as Estado]}
                        </span>
                      ) : (
                        <Badge variant="outline">Sin REY</Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => abrirDetalle(p)}>
                        <Eye className="mr-2 h-4 w-4" /> Ver detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Página {metadata.page} de {metadata.total_pages} • {metadata.total} pacientes
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange('prev'); }} isActive={false}>Anterior</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange('next'); }} isActive={false}>Siguiente</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <Sheet open={detalleOpen} onOpenChange={setDetalleOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Detalle REY {detallePaciente ? `— ${detallePaciente.nombre_completo}` : ''}</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4">
            {!detallePaciente ? (
              <div className="text-sm text-gray-500">Sin paciente seleccionado</div>
            ) : detalleLoading ? (
              <div className="flex items-center text-sm text-gray-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando evaluaciones…</div>
            ) : detalleEvaluaciones.length === 0 ? (
              <div className="text-sm text-gray-500">El paciente no registra evaluaciones REY.</div>
            ) : (
              <div className="space-y-2">
                {detalleEvaluaciones.map((ev) => (
                  <div key={ev.id_evaluacion} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{formatDateTime(ev.fecha_evaluacion)}</div>
                      <span className={`rounded-full px-2 py-1 text-xs ${estadoEvaluacionStyle[ev.estado_procesamiento as Estado]}`}>
                        {estadoLabels[ev.estado_procesamiento as Estado]}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      Puntaje: {formatScore(ev.puntuacion_total, ev.puntuacion_maxima)}
                    </div>
                    {ev.clasificacion && (
                      <div className="text-xs text-gray-500">Clasificación: {ev.clasificacion}</div>
                    )}
                    {ev.observaciones && (
                      <div className="mt-1 text-xs text-gray-500">Notas: {ev.observaciones}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
