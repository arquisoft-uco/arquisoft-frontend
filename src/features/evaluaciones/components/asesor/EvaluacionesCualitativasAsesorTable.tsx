import type { ReactNode } from 'react';
import { ClipboardList } from 'lucide-react';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { EvaluacionCualitativaAsesor } from '../../models/EvaluacionCualitativaAsesor';
import CasillaEvaluacionCualitativa from '../CasillaEvaluacionCualitativa';
import type { SeleccionCualitativas } from '../EvaluacionesCualitativasJuradoTable';

const NOMBRE = 'font-medium text-on-surface';
const DESCRIPCION = 'text-[13px] text-on-surface-secondary';
const BLOQUE = 'flex flex-col gap-0.5';
const ROTULO = 'text-xs font-medium text-on-surface-secondary';

function Bloque({ nombre, descripcion }: { nombre: string; descripcion: string }) {
  return (
    <div className={BLOQUE}>
      <span className={NOMBRE}>{nombre}</span>
      <span className={DESCRIPCION}>{descripcion}</span>
    </div>
  );
}

function criterioDe(
  fila: EvaluacionCualitativaAsesor,
  celdaCriterio?: (fila: EvaluacionCualitativaAsesor) => ReactNode,
) {
  return (
    celdaCriterio?.(fila) ?? (
      <Bloque nombre={fila.criterio.nombre} descripcion={fila.criterio.descripcion} />
    )
  );
}

function columnasBase(
  celdaCriterio?: (fila: EvaluacionCualitativaAsesor) => ReactNode,
): ColumnaTabla<EvaluacionCualitativaAsesor>[] {
  return [
    {
      id: 'item',
      encabezado: 'Ítem',
      celda: (fila) => <Bloque nombre={fila.item.nombre} descripcion={fila.item.descripcion} />,
    },
    { id: 'criterio', encabezado: 'Criterio', celda: (fila) => criterioDe(fila, celdaCriterio) },
  ];
}

interface Props {
  evaluaciones: EvaluacionCualitativaAsesor[];
  cargando: boolean;
  seleccion?: SeleccionCualitativas;
  acciones?: (fila: EvaluacionCualitativaAsesor) => ReactNode;
  celdaCriterio?: (fila: EvaluacionCualitativaAsesor) => ReactNode;
  etiqueta?: string;
  vacio?: ReactNode;
}

export default function EvaluacionesCualitativasAsesorTable({
  evaluaciones,
  cargando,
  seleccion,
  acciones,
  celdaCriterio,
  etiqueta,
  vacio,
}: Props) {
  const casilla = (fila: EvaluacionCualitativaAsesor) =>
    seleccion ? (
      <CasillaEvaluacionCualitativa
        fila={{ id: fila.item.id, item: fila.item }}
        marcada={seleccion.seleccionados.has(fila.item.id)}
        onAlternar={seleccion.onAlternar}
      />
    ) : null;
  const columnas: ColumnaTabla<EvaluacionCualitativaAsesor>[] = seleccion
    ? [
        { id: 'seleccionar', encabezado: 'Seleccionar', celda: casilla },
        ...columnasBase(celdaCriterio),
      ]
    : columnasBase(celdaCriterio);

  return (
    <DataTable
      etiqueta={etiqueta ?? 'Evaluaciones cualitativas del asesor'}
      columnas={columnas}
      filas={evaluaciones}
      idDeFila={(fila) => fila.id}
      cargando={cargando}
      acciones={acciones}
      encabezadoAcciones={acciones ? 'Acciones' : undefined}
      vacio={
        vacio ?? (
          <EmptyState
            icono={ClipboardList}
            titulo="Aún no hay evaluaciones cualitativas"
            descripcion="Aparecerán aquí cuando registres tus valoraciones cualitativas."
          />
        )
      }
      tarjeta={(fila) => (
        <>
          {casilla(fila)}
          <span className={ROTULO}>Ítem</span>
          <Bloque nombre={fila.item.nombre} descripcion={fila.item.descripcion} />
          <span className={ROTULO}>Criterio</span>
          {criterioDe(fila, celdaCriterio)}
        </>
      )}
    />
  );
}
