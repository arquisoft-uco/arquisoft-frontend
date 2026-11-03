import type { ArtefactoAsesor } from '../models/ArtefactoAsesor';
import { excluirVersionActual } from '../utils/cambio-version-repositorio';
import { useVersionesRepositorioCatalogo } from './useVersionesRepositorioCatalogo';

export function useVersionesElegiblesArtefacto(artefacto: ArtefactoAsesor, habilitado: boolean) {
  const catalogo = useVersionesRepositorioCatalogo(habilitado, {
    nombreRepositorio: artefacto.nombreRepositorio,
    nombreDocumento: artefacto.nombreDocumento,
  });

  return {
    versiones: excluirVersionActual(catalogo.versiones, artefacto.versionRepositorioArtefacto),
    isLoading: catalogo.isLoading,
    isError: catalogo.isError,
    refetch: catalogo.refetch,
    hayMas: catalogo.hayMas,
    cargandoMas: catalogo.cargandoMas,
    cargarMas: catalogo.cargarMas,
  };
}
