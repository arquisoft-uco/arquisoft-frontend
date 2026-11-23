import { ClipboardList } from 'lucide-react';
import Badge from '../../../shared/components/ui/Badge';
import DataTable from '../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import type { ItemEvaluacion } from '../models/ItemEvaluacion';
import ValoracionCualitativaEnLinea from './ValoracionCualitativaEnLinea';

const NOMBRE = 'font-medium text-on-surface';
const DESCRIPCION = 'text-[13px] text-on-surface-secondary';
const BLOQUE = 'flex flex-col gap-0.5';
const ROTULO = 'text-xs font-medium text-on-surface-secondary';

interface ItemCatalogo {
  id: string;
  nombre: string;
  descripcion: string;
}

type Fila = ItemEvaluacion<ItemCatalogo>;

interface Props {
  filas: Fila[];
  criterios: { id: string; nombre: string }[];
  cargando: boolean;
  soloLectura: boolean;
  deshabilitado: boolean;
  borrador: Record<string, string>;
  onCambiar: (itemId: string, criterioId: string) => void;
}

function Estado({ pendiente }: { pendiente: boolean }) {
  return pendiente ? (
    <Badge variante="advertencia">Pendiente</Badge>
  ) : (
    <Badge variante="exito">Evaluado</Badge>
  );
}

export default function EstadoItemsCualitativosTable({
  filas,
  criterios,
  cargando,
  soloLectura,
  deshabilitado,
  borrador,
  onCambiar,
}: Props) {
  function valoracion({ item, pendiente }: Fila) {
    if (!pendiente) return <span className={DESCRIPCION}>Ya evaluado: ver en Realizadas</span>;
    if (soloLectura) return <span className={DESCRIPCION}>Evaluación finalizada</span>;
    return (
      <ValoracionCualitativaEnLinea
        item={item}
        criterios={criterios}
        valor={borrador[item.id] ?? ''}
        onCambiar={(criterioId) => onCambiar(item.id, criterioId)}
        deshabilitado={deshabilitado}
      />
    );
  }

  const bloque = ({ item }: Fila) => (
    <div className={BLOQUE}>
      <span className={NOMBRE}>{item.nombre}</span>
      <span className={DESCRIPCION}>{item.descripcion}</span>
    </div>
  );

  const columnas: ColumnaTabla<Fila>[] = [
    { id: 'item', encabezado: 'Ítem', celda: bloque },
    { id: 'estado', encabezado: 'Estado', celda: (fila) => <Estado pendiente={fila.pendiente} /> },
    { id: 'valoracion', encabezado: 'Valoración', celda: valoracion },
  ];

  return (
    <DataTable
      etiqueta="Ítems cualitativos del catálogo"
      columnas={columnas}
      filas={filas}
      idDeFila={({ item }) => item.id}
      cargando={cargando}
      resaltarFila={(fila) => fila.pendiente}
      vacio={
        <EmptyState
          icono={ClipboardList}
          titulo="Aún no hay ítems cualitativos"
          descripcion="Aparecerán aquí cuando el administrador los registre."
        />
      }
      tarjeta={(fila) => (
        <>
          {bloque(fila)}
          <Estado pendiente={fila.pendiente} />
          <span className={ROTULO}>Valoración</span>
          {valoracion(fila)}
        </>
      )}
    />
  );
}
