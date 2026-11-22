import { useEffect, useId, useRef } from 'react';
import Button from '../../../../shared/components/ui/Button';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useBorradorEvaluacionesCualitativasJurado } from '../../hooks/useBorradorEvaluacionesCualitativasJurado';
import { useCriteriosItemCualitativoJurado } from '../../hooks/useCriteriosItemCualitativoJurado';
import type { useItemsCualitativosPendientesJurado } from '../../hooks/useItemsCualitativosPendientesJurado';
import EstadoItemsCualitativosJuradoTable from './EstadoItemsCualitativosJuradoTable';

const RAIZ = 'flex flex-col gap-4';
const TITULO = 'text-base font-semibold text-on-surface';
const RAZON = 'text-[13px] text-on-surface-secondary';

interface Props {
  evaluacionJuradoId: string;
  proyecto: string;
  consulta: ReturnType<typeof useItemsCualitativosPendientesJurado>;
  finalizada: boolean;
}

export default function ItemsPorEvaluarCualitativosJuradoSeccion({
  evaluacionJuradoId,
  proyecto,
  consulta,
  finalizada,
}: Props) {
  const idTitulo = useId();
  const idRazon = `${idTitulo}-razon`;
  const titulo = useRef<HTMLHeadingElement>(null);
  const estabaEnviando = useRef(false);
  const criterios = useCriteriosItemCualitativoJurado();
  const { borrador, cantidad, elegir, registrar, descartar, enviando } =
    useBorradorEvaluacionesCualitativasJurado({
      evaluacionJuradoId,
      proyecto,
      filas: consulta.filas,
      criterios: criterios.data ?? [],
    });

  useEffect(() => {
    if (estabaEnviando.current && !enviando && cantidad === 0) titulo.current?.focus();
    estabaEnviando.current = enviando;
  }, [enviando, cantidad]);

  const hayError = consulta.isError || criterios.isError;
  const cargando = consulta.isLoading || criterios.isLoading;
  const puedeRegistrar =
    !finalizada && !hayError && !cargando && consulta.filas.some((fila) => fila.pendiente);

  function reintentar() {
    if (consulta.isError) consulta.refetch();
    if (criterios.isError) void criterios.refetch();
  }

  return (
    <section aria-labelledby={idTitulo} className={RAIZ}>
      <div className="section-header">
        <h2 id={idTitulo} ref={titulo} tabIndex={-1} className={TITULO}>
          Ítems del catálogo
        </h2>
        {puedeRegistrar && (
          <div className="header-action actions-row">
            {cantidad > 0 && (
              <Button variante="secundario" disabled={enviando} onClick={descartar}>
                Descartar selección
              </Button>
            )}
            <Button
              cargando={enviando}
              disabled={cantidad === 0}
              aria-describedby={cantidad === 0 ? idRazon : undefined}
              onClick={registrar}
            >
              {enviando ? 'Registrando…' : `Registrar valoraciones (${cantidad})`}
            </Button>
          </div>
        )}
      </div>
      {puedeRegistrar && cantidad === 0 && (
        <p id={idRazon} className={RAZON}>
          Elige un criterio en al menos un ítem pendiente.
        </p>
      )}
      {hayError ? (
        <ErrorState
          titulo="No se pudieron cargar los ítems cualitativos"
          descripcion={getApiErrorMessage(
            consulta.error ?? criterios.error,
            'Inténtalo nuevamente.',
          )}
          onReintentar={reintentar}
        />
      ) : (
        <EstadoItemsCualitativosJuradoTable
          filas={consulta.filas}
          criterios={criterios.data ?? []}
          cargando={cargando}
          soloLectura={finalizada}
          deshabilitado={enviando}
          borrador={borrador}
          onCambiar={elegir}
        />
      )}
    </section>
  );
}
