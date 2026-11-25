import type { OpcionFiltro, SeccionFiltro } from '../../../shared/components/ui/FilterBar';
import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import type { EstadoRevisionAsesor } from '../models/artefactos';

export const SIN_REVISION = 'sin-revision';

export const OPCIONES_ORDEN_ESTADO_REVISION: OpcionFiltro[] = [
  { id: 'estadoUltimaRevision:ASC', etiqueta: 'Estado de revisión (A-Z)' },
  { id: 'estadoUltimaRevision:DESC', etiqueta: 'Estado de revisión (Z-A)' },
];

export function resolverEstadoRevision(
  estados: EstadoRevisionAsesor[] | undefined,
  valor: string,
): EstadoRevisionAsesor | undefined {
  const buscado = valor.trim();
  if (!buscado || !estados) return undefined;
  return (
    estados.find((estado) => estado.id === buscado) ??
    estados.find((estado) => estado.nombre.toLowerCase() === buscado.toLowerCase())
  );
}

export function nodoEstadoUltimaRevision(consulta: string): NodoFiltroDTO[] {
  if (!consulta) return [];
  if (consulta === SIN_REVISION) {
    return [{ tipo: 'PREDICADO', campo: 'estadoUltimaRevision', operador: 'ES_NULO' }];
  }
  return [{ tipo: 'PREDICADO', campo: 'estadoUltimaRevision', operador: 'ES', valor: consulta }];
}

export function opcionesEstadoRevision(
  estados: EstadoRevisionAsesor[] | undefined,
  conSinRevision: boolean,
): OpcionFiltro[] {
  return [
    { id: '', etiqueta: 'Todos' },
    ...(conSinRevision ? [{ id: SIN_REVISION, etiqueta: 'Sin revisión' }] : []),
    ...(estados ?? []).map((estado) => ({ id: estado.id, etiqueta: estado.nombre })),
  ];
}

interface SeccionParams {
  estados: EstadoRevisionAsesor[] | undefined;
  valor: string;
  onCambiar: (valor: string) => void;
}

export function seccionEstadoRevision({ estados, valor, onCambiar }: SeccionParams): SeccionFiltro {
  return {
    id: 'estadoRevision',
    etiqueta: 'Estado de la última revisión',
    opciones: opcionesEstadoRevision(estados, true),
    valor,
    onCambiar,
    deshabilitada: !estados,
  };
}

interface AplicadoParams {
  estados: EstadoRevisionAsesor[] | undefined;
  valor: string;
  onQuitar: () => void;
}

export function aplicadoEstadoRevision({ estados, valor, onQuitar }: AplicadoParams) {
  if (!valor) return null;
  if (valor === SIN_REVISION) return { id: 'estadoRevision', etiqueta: 'Sin revisión', onQuitar };
  const nombre = estados?.find((estado) => estado.id === valor)?.nombre;
  return { id: 'estadoRevision', etiqueta: `Última revisión: ${nombre ?? valor}`, onQuitar };
}
