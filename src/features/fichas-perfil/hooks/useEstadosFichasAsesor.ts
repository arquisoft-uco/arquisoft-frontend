import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import { fichasPerfilService } from '../services/fichasPerfilService';

const PAGE_SIZE = 10;
const ORDENAMIENTO = ['tituloProyecto:ASC'];

export function construirFiltros(estadoId: string, titulo: string): NodoFiltroDTO | undefined {
  const nodos: NodoFiltroDTO[] = [];
  if (estadoId) {
    nodos.push({ tipo: 'PREDICADO', campo: 'estadoFicha', operador: 'ES', valor: estadoId });
  }
  const tituloLimpio = titulo.trim();
  if (tituloLimpio) {
    nodos.push({
      tipo: 'PREDICADO',
      campo: 'tituloProyecto',
      operador: 'CONTIENE',
      valor: tituloLimpio,
    });
  }

  if (nodos.length === 0) {
    return undefined;
  }
  if (nodos.length === 1) {
    return nodos[0];
  }
  return { tipo: 'GRUPO', conector: 'AND', nodos };
}

export function useEstadosFichasAsesor() {
  const [page, setPage] = useState(0);
  const [estadoId, setEstadoId] = useState('');
  const [titulo, setTitulo] = useState('');

  function aplicarFiltros(nuevoEstadoId: string, nuevoTitulo: string) {
    setEstadoId(nuevoEstadoId);
    setTitulo(nuevoTitulo);
    setPage(0);
  }

  const query = useQuery({
    queryKey: ['fichas-perfil', 'estados-ficha-asesor', page, estadoId, titulo],
    queryFn: () =>
      fichasPerfilService.getEstadosFichasAsesor({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: ORDENAMIENTO,
        filtros: construirFiltros(estadoId, titulo),
      }),
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: setPage,
    estadoId,
    titulo,
    aplicarFiltros,
  };
}
