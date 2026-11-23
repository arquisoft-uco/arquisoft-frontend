import { useContextoDeNavegacion } from '../../../shared/hooks/useContextoDeNavegacion';
import { esquemaContextoVersiones } from '../utils/contexto-versiones';

interface ResultadoContextoVersiones {
  nombre: string | null;
  search: string;
}

export function useContextoVersionesRepositorio(repositorioId: string): ResultadoContextoVersiones {
  const { contexto } = useContextoDeNavegacion({
    tipo: 'repositorio',
    id: repositorioId,
    esquemaEstado: esquemaContextoVersiones,
    coincide: (valor) => valor.repositorio.id === repositorioId,
  });

  return { nombre: contexto?.repositorio.nombre ?? null, search: contexto?.search ?? '' };
}
