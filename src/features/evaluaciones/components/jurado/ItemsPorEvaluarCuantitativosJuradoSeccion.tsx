import { useEffect, useId, useRef } from 'react';
import Button from '../../../../shared/components/ui/Button';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useBorradorEvaluacionesCuantitativasJurado } from '../../hooks/useBorradorEvaluacionesCuantitativasJurado';
import type { useItemsCuantitativosPendientesJurado } from '../../hooks/useItemsCuantitativosPendientesJurado';
import { enfocarElementoVisible } from '../../utils/enfocar-visible';
import EstadoItemsCuantitativosJuradoTable from './EstadoItemsCuantitativosJuradoTable';
import ObservacionesPendientesAviso from './ObservacionesPendientesAviso';

const RAIZ = 'flex flex-col gap-4';
const TITULO = 'text-base font-semibold text-on-surface';
const RAZON = 'text-[13px] text-on-surface-secondary';

interface Props {
  evaluacionJuradoId: string;
  proyecto: string;
  consulta: ReturnType<typeof useItemsCuantitativosPendientesJurado>;
  finalizada: boolean;
}

export default function ItemsPorEvaluarCuantitativosJuradoSeccion({
  evaluacionJuradoId,
  proyecto,
  consulta,
  finalizada,
}: Props) {
  const idTitulo = useId();
  const idRazon = `${idTitulo}-razon`;
  const raiz = useRef<HTMLElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const estabaEnviando = useRef(false);
  const borrador = useBorradorEvaluacionesCuantitativasJurado({
    evaluacionJuradoId,
    proyecto,
    filas: consulta.filas,
  });
  const { cantidad, enviando } = borrador;

  useEffect(() => {
    if (estabaEnviando.current && !enviando && cantidad === 0) titulo.current?.focus();
    estabaEnviando.current = enviando;
  }, [enviando, cantidad]);

  const puedeRegistrar =
    !finalizada &&
    !consulta.isError &&
    !consulta.isLoading &&
    consulta.filas.some((f) => f.pendiente);
  const nombresPorId = new Map(consulta.filas.map(({ item }) => [item.id, item.nombre]));

  function registrar() {
    const itemInvalido = borrador.registrar();
    if (itemInvalido) {
      enfocarElementoVisible(raiz.current, `[data-valoracion-item="${itemInvalido}"]`);
    }
  }

  return (
    <section ref={raiz} aria-labelledby={idTitulo} className={RAIZ}>
      <div className="section-header">
        <h2 id={idTitulo} ref={titulo} tabIndex={-1} className={TITULO}>
          Ítems del catálogo
        </h2>
        {puedeRegistrar && (
          <div className="header-action actions-row">
            {cantidad > 0 && (
              <Button variante="secundario" disabled={enviando} onClick={borrador.descartar}>
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
          Escribe el puntaje de al menos un ítem pendiente.
        </p>
      )}
      {borrador.pendientes.length > 0 && (
        <ObservacionesPendientesAviso
          pendientes={borrador.pendientes}
          nombresPorId={nombresPorId}
          reintentando={borrador.reintentando}
          onReintentar={borrador.reintentar}
          onSalir={borrador.descartarPendientes}
        />
      )}
      {consulta.isError ? (
        <ErrorState
          titulo="No se pudieron cargar los ítems cuantitativos"
          descripcion={getApiErrorMessage(consulta.error, 'Inténtalo nuevamente.')}
          onReintentar={consulta.refetch}
        />
      ) : (
        <EstadoItemsCuantitativosJuradoTable
          filas={consulta.filas}
          cargando={consulta.isLoading}
          soloLectura={finalizada}
          deshabilitado={enviando}
          borrador={borrador.borrador}
          errores={borrador.errores}
          onCambiar={borrador.cambiar}
          onSalirDelCampo={borrador.validarFila}
        />
      )}
    </section>
  );
}
