import type { OpcionFiltro } from '../../../shared/components/ui/FilterBar';
import { OPCIONES_ORDEN_ESTADO_REVISION } from './filtro-estado-revision';

const PROYECTO_ASC = 'nombreProyecto:ASC';
const PROYECTO_DESC = 'nombreProyecto:DESC';
const DOCUMENTO_ASC = 'nombreDocumento:ASC';

export function ordenamientoParticipaciones(orden: string): string[] {
  if (orden === PROYECTO_ASC || orden === PROYECTO_DESC) return [orden, DOCUMENTO_ASC];
  return [PROYECTO_ASC, orden];
}

const DENTRO = 'Dentro de cada proyecto: ';

export const OPCIONES_ORDEN_PARTICIPACIONES: OpcionFiltro[] = [
  { id: PROYECTO_ASC, etiqueta: 'Proyecto (A-Z)' },
  { id: PROYECTO_DESC, etiqueta: 'Proyecto (Z-A)' },
  { id: 'nombreDocumento:DESC', etiqueta: `${DENTRO}Documento (Z-A)` },
  { id: 'versionDocumento:ASC', etiqueta: `${DENTRO}Versión del documento (menor a mayor)` },
  { id: 'versionDocumento:DESC', etiqueta: `${DENTRO}Versión del documento (mayor a menor)` },
  { id: 'nombreRepositorio:ASC', etiqueta: `${DENTRO}Repositorio (A-Z)` },
  { id: 'nombreRepositorio:DESC', etiqueta: `${DENTRO}Repositorio (Z-A)` },
  { id: 'nombreAsesor:ASC', etiqueta: `${DENTRO}Asesor (A-Z)` },
  { id: 'nombreAsesor:DESC', etiqueta: `${DENTRO}Asesor (Z-A)` },
  ...OPCIONES_ORDEN_ESTADO_REVISION.map((opcion) => ({
    ...opcion,
    etiqueta: `${DENTRO}${opcion.etiqueta}`,
  })),
];
