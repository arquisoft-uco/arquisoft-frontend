import { History, SearchX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla, OrdenTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { OrdenDireccion } from '../../hooks/useEstadosFichasAsesor';
import type { EstadoFichaPerfilAsesor } from '../../models/EstadoFichaPerfilAsesor';
import { FechaDeEstado, InsigniaEstadoFicha, TituloFicha } from '../FichaCeldas';

const INSIGNIAS_TARJETA = 'flex flex-wrap items-center gap-1.5';
const DATO_TARJETA = 'text-[13px] text-on-surface-secondary';

function idDeFila(fila: EstadoFichaPerfilAsesor): string {
  return `${fila.fichaPerfilId}-${fila.fechaActualizacion}-${fila.estadoId}`;
}

interface Props {
  filas: EstadoFichaPerfilAsesor[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (direccion: OrdenDireccion) => void;
  onLimpiarFiltros: () => void;
}

export default function EstadosFichasAsesorListado({
  filas,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
}: Props) {
  const columnas: ColumnaTabla<EstadoFichaPerfilAsesor>[] = [
    {
      id: 'ficha',
      encabezado: 'Ficha',
      clave: 'tituloProyecto',
      ordenable: true,
      celda: (fila) => <TituloFicha titulo={fila.tituloProyecto} />,
    },
    {
      id: 'estado',
      encabezado: 'Estado',
      celda: (fila) => <InsigniaEstadoFicha estadoId={fila.estadoId} nombre={fila.estadoNombre} />,
    },
    {
      id: 'fecha',
      encabezado: 'Fecha de actualización',
      celda: (fila) => <FechaDeEstado iso={fila.fechaActualizacion} />,
    },
  ];

  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay fichas que coincidan con tu búsqueda o tus filtros."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={History}
      titulo="Aún no hay estados registrados"
      descripcion="Cuando una de tus fichas cambie de estado, lo verás aquí."
    />
  );

  return (
    <DataTable
      etiqueta="Estados de mis fichas"
      columnas={columnas}
      filas={filas}
      idDeFila={idDeFila}
      orden={orden}
      onOrdenar={(_clave, direccion) => onOrdenar(direccion)}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(fila) => (
        <>
          <TituloFicha titulo={fila.tituloProyecto} />
          <div className={INSIGNIAS_TARJETA}>
            <InsigniaEstadoFicha estadoId={fila.estadoId} nombre={fila.estadoNombre} />
          </div>
          <p className={DATO_TARJETA}>
            <FechaDeEstado iso={fila.fechaActualizacion} />
          </p>
        </>
      )}
    />
  );
}
