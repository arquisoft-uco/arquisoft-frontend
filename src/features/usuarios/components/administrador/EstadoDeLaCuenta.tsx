import { useId } from 'react';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Button from '../../../../shared/components/ui/Button';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import type { EstadoUsuario } from '../../models/EstadoUsuario';

const TARJETA = 'flex flex-col items-start gap-4 rounded-xl border border-border p-4 sm:p-5';
const TITULO = 'text-base font-semibold text-on-surface';
const ANCHO_COMPLETO = 'w-full';
const GRUPO = 'flex w-full flex-col gap-2.5';
const OPCION =
  'flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5';
const OPCION_LIBRE = 'border-border-strong';
const OPCION_ELEGIDA = 'border-primary bg-primary-muted';
const RADIO = 'checkbox-control shrink-0 accent-primary';
const TEXTOS = 'flex min-w-0 flex-1 flex-col';
const NOMBRE = 'text-sm font-semibold text-on-surface';
const DESCRIPCION = 'text-[13px] text-on-surface-secondary';

const clasesDeLaOpcion = (elegida: boolean) =>
  [OPCION, elegida ? OPCION_ELEGIDA : OPCION_LIBRE].join(' ');

interface Props {
  estados?: EstadoUsuario[];
  cargando: boolean;
  error: boolean;
  actual: string;
  valor: string;
  onCambiar: (id: string) => void;
  aplicando: boolean;
  onAplicar: () => void;
}

export default function EstadoDeLaCuenta({
  estados = [],
  cargando,
  error,
  actual,
  valor,
  onCambiar,
  aplicando,
  onAplicar,
}: Props) {
  const base = useId();
  const idTitulo = `${base}-titulo`;

  return (
    <section aria-labelledby={idTitulo} className={TARJETA}>
      <h2 id={idTitulo} className={TITULO}>
        Estado de la cuenta
      </h2>

      {cargando && (
        <Skeleton
          variante="lineas"
          etiqueta="Cargando estados de la cuenta…"
          className={ANCHO_COMPLETO}
        />
      )}

      {error && (
        <div className={ANCHO_COMPLETO}>
          <AvisoNoDisponible recurso="estados de usuario" />
        </div>
      )}

      {!cargando && !error && (
        <div role="radiogroup" aria-labelledby={idTitulo} className={GRUPO}>
          {estados.map((estado) => {
            const idNombre = `${base}-${estado.id}-nombre`;
            const idDescripcion = `${base}-${estado.id}-descripcion`;
            return (
              <label key={estado.id} className={clasesDeLaOpcion(estado.id === valor)}>
                <input
                  type="radio"
                  name={base}
                  value={estado.id}
                  checked={estado.id === valor}
                  onChange={() => onCambiar(estado.id)}
                  aria-labelledby={idNombre}
                  aria-describedby={idDescripcion}
                  className={RADIO}
                />
                <span className={TEXTOS}>
                  <span id={idNombre} className={NOMBRE}>
                    {estado.nombre}
                  </span>
                  <span id={idDescripcion} className={DESCRIPCION}>
                    {estado.descripcion}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}

      <Button
        variante="secundario"
        disabled={valor === actual || cargando || error || aplicando}
        onClick={onAplicar}
      >
        Aplicar cambio de estado
      </Button>
    </section>
  );
}
