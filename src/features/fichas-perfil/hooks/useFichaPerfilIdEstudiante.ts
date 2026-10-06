import { useSearchParams } from 'react-router';
import { useFichasPerfilEstudiante } from './useFichasPerfilEstudiante';

const PARAM_FICHA = 'ficha';

export function useFichaPerfilIdEstudiante() {
  const { fichas, isLoading, isError, isSuccess, refetch } = useFichasPerfilEstudiante();
  const [searchParams, setSearchParams] = useSearchParams();

  const idEnUrl = searchParams.get(PARAM_FICHA);
  const ficha = fichas.find((f) => f.id === idEnUrl) ?? fichas[0] ?? null;

  function seleccionarFicha(id: string) {
    setSearchParams(
      (prev) => {
        const siguiente = new URLSearchParams(prev);
        siguiente.set(PARAM_FICHA, id);
        return siguiente;
      },
      { replace: true },
    );
  }

  return {
    fichaPerfilId: ficha?.id ?? null,
    ficha,
    fichas,
    seleccionarFicha,
    isLoading,
    isError,
    isSuccess,
    refetch,
  };
}
