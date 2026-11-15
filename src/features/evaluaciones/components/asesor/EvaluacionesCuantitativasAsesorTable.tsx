import { ListChecks } from 'lucide-react';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { EvaluacionCuantitativaAsesor } from '../../models/EvaluacionCuantitativaAsesor';

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

const COLUMNAS: ColumnaTabla<EvaluacionCuantitativaAsesor>[] = [
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

interface Props {
  evaluaciones: EvaluacionCuantitativaAsesor[];
  cargando: boolean;
}

export default function EvaluacionesCuantitativasAsesorTable({ evaluaciones, cargando }: Props) {
  return (
    <DataTable
      etiqueta="Evaluaciones cuantitativas del asesor"
      columnas={COLUMNAS}
      filas={evaluaciones}
      idDeFila={(fila) => fila.id}
      cargando={cargando}
      vacio={
        <EmptyState
          icono={ListChecks}
          titulo="Aún no hay evaluaciones cuantitativas"
          descripcion="Aparecerán aquí cuando registres tus valoraciones cuantitativas."
        />
      }
      tarjeta={(fila) => (
        <>
          <span className={ROTULO}>Ítem</span>
          <Bloque nombre={fila.item.nombre} descripcion={fila.item.descripcion} />
          <span className={ROTULO}>Puntaje</span>
          <span className={NOMBRE}>{textoPuntaje(fila)}</span>
        </>
      )}
    />
  );
}
