import { useSearchParams } from 'react-router';

const PARAM_PAGINA = 'pagina';

type ValorParametro = string | string[] | undefined;

export function leerOrden<T extends string>(
  valor: string,
  permitidos: readonly T[],
  porDefecto: T,
): T {
  return permitidos.find((orden) => orden === valor) ?? porDefecto;
}

function leerPagina(valor: string | null): number {
  if (!valor || !/^\d+$/.test(valor)) return 0;
  return Math.max(Number(valor) - 1, 0);
}

export function useParametrosListado() {
  const [parametros, setParametros] = useSearchParams();

  const pagina = leerPagina(parametros.get(PARAM_PAGINA));

  function texto(clave: string): string {
    return parametros.get(clave) ?? '';
  }

  function lista(clave: string): string[] {
    return parametros.getAll(clave);
  }

  function cambiar(cambios: Record<string, ValorParametro>) {
    setParametros(
      (previos) => {
        const siguientes = new URLSearchParams(previos);
        Object.entries(cambios).forEach(([clave, valor]) => {
          siguientes.delete(clave);
          const valores = Array.isArray(valor) ? valor : [valor];
          valores.forEach((v) => {
            if (v) siguientes.append(clave, v);
          });
        });
        siguientes.delete(PARAM_PAGINA);
        return siguientes;
      },
      { replace: true },
    );
  }

  function irAPagina(numero: number) {
    setParametros(
      (previos) => {
        const siguientes = new URLSearchParams(previos);
        if (numero > 0) siguientes.set(PARAM_PAGINA, String(numero + 1));
        else siguientes.delete(PARAM_PAGINA);
        return siguientes;
      },
      { replace: true },
    );
  }

  return { texto, lista, pagina, cambiar, irAPagina };
}
