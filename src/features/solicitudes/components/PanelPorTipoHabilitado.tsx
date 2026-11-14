import { useState, type ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Skeleton from '../../../shared/components/ui/Skeleton';
import type { TipoSolicitud } from '../models/TipoSolicitud';
import SelectorTipoSolicitud, { type OpcionTipo } from './SelectorTipoSolicitud';

const RAIZ = 'flex flex-col gap-4';

const VACIO_POR_DEFECTO = {
  titulo: 'No tienes tipos de solicitud habilitados',
  descripcion: 'Si crees que es un error, consulta con el coordinador de tu programa.',
};

interface Props<T extends string> {
  opciones: OpcionTipo<T>[];
  idBackend: Record<T, string>;
  consulta: UseQueryResult<TipoSolicitud[]>;
  vacio?: { titulo: string; descripcion: string };
  renderizar: (tipo: T) => ReactNode;
}

export default function PanelPorTipoHabilitado<T extends string>({
  opciones,
  idBackend,
  consulta,
  vacio = VACIO_POR_DEFECTO,
  renderizar,
}: Props<T>) {
  const { data, isPending, isError, refetch } = consulta;
  const [tipo, setTipo] = useState<T | null>(null);

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
    const nombre = nombrePorId.get(idBackend[o.value]);
    return nombre === undefined ? [] : [{ ...o, label: nombre }];
  });

  if (habilitadas.length === 0) {
    return <EmptyState icono={FileText} titulo={vacio.titulo} descripcion={vacio.descripcion} />;
  }

  const tipoElegido = habilitadas.find((o) => o.value === tipo)?.value ?? habilitadas[0].value;

  return (
    <div className={RAIZ}>
      <SelectorTipoSolicitud valor={tipoElegido} onCambiar={setTipo} opciones={habilitadas} />

      {renderizar(tipoElegido)}
    </div>
  );
}
