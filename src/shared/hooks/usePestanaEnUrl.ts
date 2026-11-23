import { useSearchParams } from 'react-router';

const PARAM_PESTANA = 'pestana';

export function usePestanaEnUrl<T extends string>(
  validas: readonly T[],
  porDefecto: T,
): [T, (pestana: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const enUrl = searchParams.get(PARAM_PESTANA);
  const pestana = validas.find((valida) => valida === enUrl) ?? porDefecto;

  function cambiarPestana(siguiente: T) {
    setSearchParams(
      (prev) => {
        const parametros = new URLSearchParams(prev);
        if (siguiente === porDefecto) parametros.delete(PARAM_PESTANA);
        else parametros.set(PARAM_PESTANA, siguiente);
        return parametros;
      },
      { replace: true },
    );
  }

  return [pestana, cambiarPestana];
}
