import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import { inicioDelDiaSiguienteUtc, inicioDelDiaUtc } from './filtros-versiones-artefacto';
import { ESTADO_REVISION_PENDIENTE } from './revision-version';

interface Filtros {
  texto: string;
  desde: string;
  hasta: string;
  estadoIds: string[];
}

function filtroEstado(estadoIds: string[]): NodoFiltroDTO {
  const visibles = estadoIds.filter((id) => id !== ESTADO_REVISION_PENDIENTE);
  if (visibles.length > 0) {
    return {
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estadoRevisionAsesor',
      operador: 'IN',
      valores: visibles,
    };
  }
  return {
    tipo: 'PREDICADO',
    campo: 'estadoRevisionAsesor',
    operador: 'NO_ES',
    valor: ESTADO_REVISION_PENDIENTE,
  };
}

export function construirFiltrosRevisiones({
  texto,
  desde,
  hasta,
  estadoIds,
}: Filtros): NodoFiltroDTO {
  const nodos: NodoFiltroDTO[] = [filtroEstado(estadoIds)];
  const recortado = texto.trim();
  if (recortado !== '') {
    nodos.push({
      tipo: 'PREDICADO',
      campo: 'nombreDocumento',
      operador: 'CONTIENE',
      valor: recortado,
    });
  }
  if (desde) {
    nodos.push({
      tipo: 'PREDICADO',
      campo: 'fechaCreacion',
      operador: 'MAYOR_IGUAL_QUE',
      valor: inicioDelDiaUtc(desde),
    });
  }
  if (hasta) {
    nodos.push({
      tipo: 'PREDICADO',
      campo: 'fechaCreacion',
      operador: 'MENOR_QUE',
      valor: inicioDelDiaSiguienteUtc(hasta),
    });
  }
  if (nodos.length === 1) return nodos[0];
  return { tipo: 'GRUPO', conector: 'AND', nodos };
}
