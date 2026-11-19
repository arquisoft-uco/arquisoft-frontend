import { useId, type Ref } from 'react';
import { CircleAlert } from 'lucide-react';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import OpcionRadio from '../../../../shared/components/ui/OpcionRadio';
import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import type { AsesorProyecto } from '../../models/AsesorProyecto';

const RAIZ = 'flex min-w-0 flex-col gap-2';
const OPCIONES = 'flex flex-col gap-2';
const ERROR = 'field-error flex items-start gap-1.5';

interface Props {
  opciones: AsesorProyecto[];
  elegido: string;
  onElegir: (id: string) => void;
  cargando: boolean;
  hayError: boolean;
  onReintentar: () => void;
  descripcionError: string;
  error?: string;
  grupoRef?: Ref<HTMLDivElement>;
}

export default function ElegirAsesorTarea({
  opciones,
  elegido,
  onElegir,
  cargando,
  hayError,
  onReintentar,
  descripcionError,
  error,
  grupoRef,
}: Props) {
  const id = useId();
  const idEtiqueta = `${id}-etiqueta`;
  const idError = `${id}-error`;

  return (
    <div className={RAIZ}>
      <span id={idEtiqueta} className="field-label">
        Asesor
      </span>
      <div
        ref={grupoRef}
        role="radiogroup"
        tabIndex={-1}
        aria-labelledby={idEtiqueta}
        aria-invalid={!!error}
        aria-describedby={error ? idError : undefined}
        className={OPCIONES}
      >
        {cargando && <Skeleton variante="lineas" etiqueta="Cargando asesores…" />}
        {!cargando &&
          opciones.map((asesor) => (
            <OpcionRadio
              key={asesor.id}
              nombre={`${id}-asesor`}
              valor={asesor.id}
              titulo={asesor.nombre}
              descripcion={asesor.email}
              elegida={elegido === asesor.id}
              onElegir={onElegir}
            />
          ))}
      </div>
      {!cargando && !hayError && opciones.length === 0 && (
        <Notice variante="info">
          Tu proyecto de grado aún no tiene asesores asignados. Cuando los tenga, podrás elegirlos
          aquí.
        </Notice>
      )}
      {hayError && (
        <ErrorState
          titulo="No pudimos cargar los asesores de tu proyecto"
          descripcion={descripcionError}
          onReintentar={onReintentar}
        />
      )}
      {error && (
        <p id={idError} role="alert" className={ERROR}>
          <CircleAlert size={14} className="mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
