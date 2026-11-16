import type { UseQueryResult } from '@tanstack/react-query';
import Badge from '../../../../shared/components/ui/Badge';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import type { VistaPreviaPaquete } from '../../models/VistaPreviaPaquete';
import {
  MOTIVO_SIN_ARTEFACTOS_PARA_PAQUETE,
  mensajeErrorConsultaEntregable,
} from '../../utils/errores-entregable';

const ADVERTENCIA_EMPAQUETADO =
  'Se empaqueta solo la última versión con revisión cerrada de cada artefacto. Lo que no tenga revisión cerrada queda fuera. Mientras el entregable exista, los estudiantes no podrán subir ni modificar artefactos del proyecto hasta que se cancele.';

interface Props {
  vistaPrevia: UseQueryResult<VistaPreviaPaquete>;
}

export default function VistaPreviaPaqueteSeccion({ vistaPrevia }: Props) {
  if (vistaPrevia.isLoading) {
    return <Skeleton variante="lineas" etiqueta="Cargando vista previa…" />;
  }

  if (vistaPrevia.isError) {
    return (
      <ErrorState
        titulo="No pudimos cargar la vista previa"
        descripcion={mensajeErrorConsultaEntregable(vistaPrevia.error)}
        onReintentar={() => void vistaPrevia.refetch()}
      />
    );
  }

  const datos = vistaPrevia.data;
  if (!datos) return null;

  if (datos.cantidad === 0) {
    return (
      <div aria-live="polite">
        <Notice variante="advertencia">{MOTIVO_SIN_ARTEFACTOS_PARA_PAQUETE}</Notice>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <p className="text-sm font-semibold text-on-surface">
        Contenido del paquete · {datos.cantidad} {datos.cantidad === 1 ? 'documento' : 'documentos'}
      </p>
      <ul aria-label="Documentos del paquete" className="flex flex-col gap-2">
        {datos.artefactos.map((artefacto) => (
          <li
            key={artefacto.artefacto}
            className="flex items-center justify-between gap-3 rounded-xl border border-border p-3.5"
          >
            <span className="text-sm font-semibold break-words text-on-surface">
              {artefacto.documento}
            </span>
            <Badge variante="neutro">Versión {artefacto.numeroVersion}</Badge>
          </li>
        ))}
      </ul>
      <Notice variante="advertencia">{ADVERTENCIA_EMPAQUETADO}</Notice>
    </div>
  );
}
