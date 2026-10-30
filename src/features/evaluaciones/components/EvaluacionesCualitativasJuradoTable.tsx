import { ClipboardList } from 'lucide-react';
import DataTable from '../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import type { EvaluacionCualitativaJurado } from '../models/EvaluacionCualitativaJurado';
import CasillaEvaluacionCualitativa from './CasillaEvaluacionCualitativa';

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

const COLUMNAS: ColumnaTabla<EvaluacionCualitativaJurado>[] = [
  {
    id: 'item',
    encabezado: 'Ítem',
    celda: (fila) => <Bloque nombre={fila.item.nombre} descripcion={fila.item.descripcion} />,
  },
  {
    id: 'criterio',
    encabezado: 'Criterio',
    celda: (fila) => (
      <Bloque nombre={fila.criterio.nombre} descripcion={fila.criterio.descripcion} />
    ),
  },
];

export interface SeleccionCualitativas {
  seleccionados: ReadonlySet<string>;
  onAlternar: (id: string) => void;
}

interface Props {
  evaluaciones: EvaluacionCualitativaJurado[];
  cargando: boolean;
  seleccion?: SeleccionCualitativas;
}

export default function EvaluacionesCualitativasJuradoTable({
  evaluaciones,
  cargando,
  seleccion,
}: Props) {
  const casilla = (fila: EvaluacionCualitativaJurado) =>
    seleccion ? (
      <CasillaEvaluacionCualitativa
        fila={fila}
        marcada={seleccion.seleccionados.has(fila.id)}
        onAlternar={seleccion.onAlternar}
      />
    ) : null;
  const columnas: ColumnaTabla<EvaluacionCualitativaJurado>[] = seleccion
    ? [{ id: 'seleccionar', encabezado: 'Seleccionar', celda: casilla }, ...COLUMNAS]
    : COLUMNAS;

  return (
    <DataTable
      etiqueta="Evaluaciones cualitativas del jurado"
      columnas={columnas}
      filas={evaluaciones}
      idDeFila={(fila) => fila.id}
      cargando={cargando}
      vacio={
        <EmptyState
          icono={ClipboardList}
          titulo="Aún no hay evaluaciones cualitativas"
          descripcion="Aparecerán aquí cuando el jurado registre sus valoraciones."
        />
      }
      tarjeta={(fila) => (
        <>
          {casilla(fila)}
          <span className={ROTULO}>Ítem</span>
          <Bloque nombre={fila.item.nombre} descripcion={fila.item.descripcion} />
          <span className={ROTULO}>Criterio</span>
          <Bloque nombre={fila.criterio.nombre} descripcion={fila.criterio.descripcion} />
        </>
      )}
    />
  );
}
