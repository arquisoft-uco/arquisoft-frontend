import { ClipboardList, Pencil } from 'lucide-react';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import IconButton from '../../../../shared/components/ui/IconButton';
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

const COLUMNAS: ColumnaTabla<EvaluacionCualitativaAsesor>[] = [
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

interface Props {
  evaluaciones: EvaluacionCualitativaAsesor[];
  cargando: boolean;
  seleccion?: SeleccionCualitativas;
  onCambiarCriterio?: (fila: EvaluacionCualitativaAsesor) => void;
}

export default function EvaluacionesCualitativasAsesorTable({
  evaluaciones,
  cargando,
  seleccion,
  onCambiarCriterio,
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
    ? [{ id: 'seleccionar', encabezado: 'Seleccionar', celda: casilla }, ...COLUMNAS]
    : COLUMNAS;

  return (
    <DataTable
      etiqueta="Evaluaciones cualitativas del asesor"
      columnas={columnas}
      filas={evaluaciones}
      idDeFila={(fila) => fila.id}
      cargando={cargando}
      acciones={
        onCambiarCriterio &&
        ((fila) => (
          <div className="flex shrink-0 items-center justify-end gap-1">
            <IconButton
              etiqueta={`Cambiar criterio del ítem ${fila.item.nombre}`}
              icono={Pencil}
              rotulo="Cambiar criterio"
              onClick={() => onCambiarCriterio(fila)}
            />
          </div>
        ))
      }
      vacio={
        <EmptyState
          icono={ClipboardList}
          titulo="Aún no hay evaluaciones cualitativas"
          descripcion="Aparecerán aquí cuando registres tus valoraciones cualitativas."
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
