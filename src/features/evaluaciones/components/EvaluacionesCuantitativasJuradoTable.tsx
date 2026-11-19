import { ClipboardList } from 'lucide-react';
import type { ReactNode } from 'react';
import DataTable from '../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import type { EvaluacionCuantitativaJurado } from '../models/EvaluacionCuantitativaJurado';
import CasillaEvaluacionCuantitativa from './CasillaEvaluacionCuantitativa';

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

function textoPuntaje(fila: EvaluacionCuantitativaJurado): string {
  return `${fila.puntaje} de ${fila.item.valor}`;
}

const COLUMNAS: ColumnaTabla<EvaluacionCuantitativaJurado>[] = [
  {
    id: 'item',
    encabezado: 'Ítem',
    celda: (fila) => <Bloque nombre={fila.item.nombre} descripcion={fila.item.descripcion} />,
  },
  {
    id: 'puntaje',
    encabezado: 'Puntaje',
    celda: (fila) => textoPuntaje(fila),
  },
];

export interface SeleccionCuantitativas {
  seleccionados: ReadonlySet<string>;
  onAlternar: (id: string) => void;
}

const ETIQUETA_POR_DEFECTO = 'Evaluaciones cuantitativas del jurado';

interface Props {
  evaluaciones: EvaluacionCuantitativaJurado[];
  cargando: boolean;
  etiqueta?: string;
  vacio?: ReactNode;
  acciones?: (fila: EvaluacionCuantitativaJurado) => ReactNode;
  seleccion?: SeleccionCuantitativas;
}

export default function EvaluacionesCuantitativasJuradoTable({
  evaluaciones,
  cargando,
  etiqueta,
  vacio,
  acciones,
  seleccion,
}: Props) {
  const casilla = (fila: EvaluacionCuantitativaJurado) =>
    seleccion ? (
      <CasillaEvaluacionCuantitativa
        fila={fila}
        marcada={seleccion.seleccionados.has(fila.id)}
        onAlternar={seleccion.onAlternar}
      />
    ) : null;
  const columnas: ColumnaTabla<EvaluacionCuantitativaJurado>[] = seleccion
    ? [{ id: 'seleccionar', encabezado: 'Seleccionar', celda: casilla }, ...COLUMNAS]
    : COLUMNAS;

  return (
    <DataTable
      etiqueta={etiqueta ?? ETIQUETA_POR_DEFECTO}
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
            titulo="Aún no hay evaluaciones cuantitativas"
            descripcion="Aparecerán aquí cuando el jurado registre sus puntajes."
          />
        )
      }
      tarjeta={(fila) => (
        <>
          {casilla(fila)}
          <span className={ROTULO}>Ítem</span>
          <Bloque nombre={fila.item.nombre} descripcion={fila.item.descripcion} />
          <span className={ROTULO}>Puntaje</span>
          <span className={NOMBRE}>{textoPuntaje(fila)}</span>
        </>
      )}
    />
  );
}
