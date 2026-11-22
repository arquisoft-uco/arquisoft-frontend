import type { ReactNode } from 'react';
import { ListChecks } from 'lucide-react';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { EvaluacionCuantitativaAsesor } from '../../models/EvaluacionCuantitativaAsesor';
import CasillaEvaluacionCuantitativa from '../CasillaEvaluacionCuantitativa';
import type { SeleccionCuantitativas } from '../EvaluacionesCuantitativasJuradoTable';

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

function textoPuntaje(fila: EvaluacionCuantitativaAsesor): string {
  return `${fila.puntaje} de ${fila.item.valor}`;
}

function columnasBase(
  celdaPuntaje?: (fila: EvaluacionCuantitativaAsesor) => ReactNode,
): ColumnaTabla<EvaluacionCuantitativaAsesor>[] {
  return [
    {
      id: 'item',
      encabezado: 'Ítem',
      celda: (fila) => <Bloque nombre={fila.item.nombre} descripcion={fila.item.descripcion} />,
    },
    {
      id: 'puntaje',
      encabezado: 'Puntaje',
      celda: (fila) => celdaPuntaje?.(fila) ?? textoPuntaje(fila),
    },
  ];
}

interface Props {
  evaluaciones: EvaluacionCuantitativaAsesor[];
  cargando: boolean;
  seleccion?: SeleccionCuantitativas;
  acciones?: (fila: EvaluacionCuantitativaAsesor) => ReactNode;
  celdaPuntaje?: (fila: EvaluacionCuantitativaAsesor) => ReactNode;
}

export default function EvaluacionesCuantitativasAsesorTable({
  evaluaciones,
  cargando,
  seleccion,
  acciones,
  celdaPuntaje,
}: Props) {
  const casilla = (fila: EvaluacionCuantitativaAsesor) =>
    seleccion ? (
      <CasillaEvaluacionCuantitativa
        fila={{ id: fila.item.id, item: fila.item }}
        marcada={seleccion.seleccionados.has(fila.item.id)}
        onAlternar={seleccion.onAlternar}
      />
    ) : null;
  const columnas: ColumnaTabla<EvaluacionCuantitativaAsesor>[] = seleccion
    ? [
        { id: 'seleccionar', encabezado: 'Seleccionar', celda: casilla },
        ...columnasBase(celdaPuntaje),
      ]
    : columnasBase(celdaPuntaje);

  return (
    <DataTable
      etiqueta="Evaluaciones cuantitativas del asesor"
      columnas={columnas}
      filas={evaluaciones}
      idDeFila={(fila) => fila.id}
      cargando={cargando}
      acciones={acciones}
      encabezadoAcciones={acciones ? 'Acciones' : undefined}
      vacio={
        <EmptyState
          icono={ListChecks}
          titulo="Aún no hay evaluaciones cuantitativas"
          descripcion="Aparecerán aquí cuando registres tus valoraciones cuantitativas."
        />
      }
      tarjeta={(fila) => (
        <>
          {casilla(fila)}
          <span className={ROTULO}>Ítem</span>
          <Bloque nombre={fila.item.nombre} descripcion={fila.item.descripcion} />
          <span className={ROTULO}>Puntaje</span>
          {celdaPuntaje?.(fila) ?? <span className={NOMBRE}>{textoPuntaje(fila)}</span>}
        </>
      )}
    />
  );
}
