import { useState, type ReactNode } from 'react';
import { FileText } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useTiposSolicitud } from '../../hooks/useTiposSolicitud';
import SelectorTipoSolicitud, {
  ID_TIPO_BACKEND,
  type OpcionTipo,
  type TipoSolicitudNuevaUi,
} from '../SelectorTipoSolicitud';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  opciones: OpcionTipo<TipoSolicitudNuevaUi>[];
  renderizar: (tipo: TipoSolicitudNuevaUi) => ReactNode;
}

export default function PanelPorTipoHabilitado({ opciones, renderizar }: Props) {
  const { data, isPending, isError, refetch } = useTiposSolicitud();
  const [tipo, setTipo] = useState<TipoSolicitudNuevaUi | null>(null);

  if (isPending) return <Skeleton variante="lineas" etiqueta="Cargando tipos de solicitud" />;

  if (isError) {
    return (
      <ErrorState
        titulo="No pudimos cargar los tipos de solicitud"
        onReintentar={() => void refetch()}
      />
    );
  }

  const nombrePorId = new Map(data.map((t) => [t.id, t.nombre]));
  const habilitadas = opciones.flatMap((o) => {
    const nombre = nombrePorId.get(ID_TIPO_BACKEND[o.value]);
    return nombre === undefined ? [] : [{ ...o, label: nombre }];
  });

  if (habilitadas.length === 0) {
    return (
      <EmptyState
        icono={FileText}
        titulo="No tienes tipos de solicitud habilitados"
        descripcion="Si crees que es un error, consulta con el coordinador de tu programa."
      />
    );
  }

  const tipoElegido = habilitadas.find((o) => o.value === tipo)?.value ?? habilitadas[0].value;

  return (
    <div className={RAIZ}>
      <SelectorTipoSolicitud valor={tipoElegido} onCambiar={setTipo} opciones={habilitadas} />

      {renderizar(tipoElegido)}
    </div>
  );
}
