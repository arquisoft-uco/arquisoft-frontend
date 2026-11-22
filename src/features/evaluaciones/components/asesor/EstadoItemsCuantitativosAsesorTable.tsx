import { Calculator } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { ItemCuantitativoAsesor } from '../../models/ItemCuantitativoAsesor';
import type { ItemEvaluacion } from '../../models/ItemEvaluacion';
import ValoracionPuntajeEnLinea from '../ValoracionPuntajeEnLinea';

const NOMBRE = 'font-medium text-on-surface';
const DESCRIPCION = 'text-[13px] text-on-surface-secondary';
const BLOQUE = 'flex flex-col gap-0.5';
const ROTULO = 'text-xs font-medium text-on-surface-secondary';

type Fila = ItemEvaluacion<ItemCuantitativoAsesor>;

interface Props {
  filas: Fila[];
  cargando: boolean;
  soloLectura: boolean;
  deshabilitado: boolean;
  borrador: Record<string, string>;
  errores: Record<string, string>;
  onCambiar: (itemId: string, puntaje: string) => void;
  onSalirDelCampo: (itemId: string) => void;
}

function Estado({ pendiente }: { pendiente: boolean }) {
  return pendiente ? (
    <Badge variante="advertencia">Pendiente</Badge>
  ) : (
    <Badge variante="exito">Evaluado</Badge>
  );
}

export default function EstadoItemsCuantitativosAsesorTable({
  filas,
  cargando,
  soloLectura,
  deshabilitado,
  borrador,
  errores,
  onCambiar,
  onSalirDelCampo,
}: Props) {
  function valoracion({ item, pendiente }: Fila) {
    if (!pendiente) return <span className={DESCRIPCION}>Ya evaluado: ver en Realizadas</span>;
    if (soloLectura) return <span className={DESCRIPCION}>Evaluación finalizada</span>;
    return (
      <ValoracionPuntajeEnLinea
        item={item}
        puntaje={borrador[item.id] ?? ''}
        error={errores[item.id]}
        onCambiar={(texto) => onCambiar(item.id, texto)}
        onSalirDelCampo={() => onSalirDelCampo(item.id)}
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
    { id: 'maximo', encabezado: 'Valor máximo', celda: ({ item }) => item.valor },
    { id: 'estado', encabezado: 'Estado', celda: (fila) => <Estado pendiente={fila.pendiente} /> },
    { id: 'valoracion', encabezado: 'Valoración', celda: valoracion },
  ];

  return (
    <DataTable
      etiqueta="Ítems cuantitativos del catálogo"
      columnas={columnas}
      filas={filas}
      idDeFila={({ item }) => item.id}
      cargando={cargando}
      resaltarFila={(fila) => fila.pendiente}
      vacio={
        <EmptyState
          icono={Calculator}
          titulo="Aún no hay ítems cuantitativos"
          descripcion="Aparecerán aquí cuando el administrador los registre."
        />
      }
      tarjeta={(fila) => (
        <>
          {bloque(fila)}
          <span className={DESCRIPCION}>Valor máximo: {fila.item.valor}</span>
          <Estado pendiente={fila.pendiente} />
          <span className={ROTULO}>Valoración</span>
          {valoracion(fila)}
        </>
      )}
    />
  );
}
