import { BookOpen, SearchX } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import DataTable from '../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import type { EntregableDisponible } from '../models/EntregableDisponible';
import { AutoresProyecto, TituloProyecto } from './DocumentacionCeldas';

const DATO_SECUNDARIO = 'text-on-surface-secondary';
const ARCHIVO = 'line-clamp-2 max-w-xs break-all text-on-surface-secondary';

function Archivo({ nombre }: { nombre: string }) {
  return (
    <span title={nombre} className={ARCHIVO}>
      {nombre}
    </span>
  );
}

const COLUMNAS: ColumnaTabla<EntregableDisponible>[] = [
  {
    id: 'titulo',
    encabezado: 'Título',
    celda: (entregable) => <TituloProyecto titulo={entregable.tituloProyecto} />,
  },
  {
    id: 'version',
    encabezado: 'Versión',
    celda: (entregable) => <span>Versión {entregable.versionEntregable}</span>,
  },
  {
    id: 'archivo',
    encabezado: 'Archivo',
    celda: (entregable) => <Archivo nombre={entregable.nombreArchivo} />,
  },
  {
    id: 'autores',
    encabezado: 'Autores',
    celda: (entregable) => <AutoresProyecto autores={entregable.autores} />,
  },
];

interface Props {
  entregables: EntregableDisponible[];
  cargando: boolean;
  hayFiltros: boolean;
  onLimpiarFiltros: () => void;
}

export default function EntregablesDisponiblesTable({
  entregables,
  cargando,
  hayFiltros,
  onLimpiarFiltros,
}: Props) {
  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay entregables por registrar cuyo proyecto contenga ese título."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={BookOpen}
      titulo="No hay entregables por registrar"
      descripcion="Aquí aparecen los entregables aprobados que aún no tienen documentación en la biblioteca."
    />
  );

  // Pendiente: la fila ofrecerá «Registrar» cuando exista el frontend de HU-307
  return (
    <DataTable
      etiqueta="Entregables por registrar"
      columnas={COLUMNAS}
      filas={entregables}
      idDeFila={(entregable) => entregable.id}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(entregable) => (
        <>
          <TituloProyecto titulo={entregable.tituloProyecto} />
          <span className={DATO_SECUNDARIO}>Versión {entregable.versionEntregable}</span>
          <Archivo nombre={entregable.nombreArchivo} />
          <span className="sr-only">Autores: </span>
          <AutoresProyecto autores={entregable.autores} />
        </>
      )}
    />
  );
}
