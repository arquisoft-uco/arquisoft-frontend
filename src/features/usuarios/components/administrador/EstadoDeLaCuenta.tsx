import { useId } from 'react';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Button from '../../../../shared/components/ui/Button';
import OpcionRadio from '../../../../shared/components/ui/OpcionRadio';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import type { EstadoUsuario } from '../../models/EstadoUsuario';

const TARJETA = 'flex flex-col items-start gap-4 rounded-xl border border-border p-4 sm:p-5';
const TITULO = 'text-base font-semibold text-on-surface';
const ANCHO_COMPLETO = 'w-full';
const GRUPO = 'flex w-full flex-col gap-2.5';

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
          {estados.map((estado) => (
            <OpcionRadio
              key={estado.id}
              nombre={base}
              valor={estado.id}
              titulo={estado.nombre}
              descripcion={estado.descripcion}
              elegida={estado.id === valor}
              onElegir={onCambiar}
            />
          ))}
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
