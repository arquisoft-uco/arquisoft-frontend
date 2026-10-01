export interface PredicadoFiltro {
  tipo: 'PREDICADO';
  campo: string;
  operador: string;
  valor: string;
}

export interface PredicadoMultivalorFiltro {
  tipo: 'PREDICADO_MULTIVALOR';
  campo: string;
  operador: string;
  valores: string[];
}

export interface GrupoFiltro {
  tipo: 'GRUPO';
  conector: 'AND' | 'OR';
  nodos: NodoFiltroDTO[];
}

export type NodoFiltroDTO = PredicadoFiltro | PredicadoMultivalorFiltro | GrupoFiltro;

export interface ConsultaPaginadaRequest {
  pagina: number;
  tamanio: number;
  ordenamiento?: string[];
  filtros?: NodoFiltroDTO;
}
