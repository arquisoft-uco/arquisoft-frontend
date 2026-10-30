import { useState } from 'react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import type { SeccionFiltro } from '../../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useMapasRutaCoordinador } from '../../hooks/useMapasRutaCoordinador';
import type { MapaRuta } from '../../models/MapaRuta';
import type { FechasFiltro } from '../../utils/filtros-mapa-ruta';
import { formatearFechaCivil } from '../../utils/formato-fecha';
import CambiarFechaFinMapaRutaPanel from './CambiarFechaFinMapaRutaPanel';
import MapasRutaTable from './MapasRutaTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

const ETIQUETAS: Record<keyof FechasFiltro, string> = {
  inicioDesde: 'Inicia desde',
  inicioHasta: 'Inicia hasta',
  finDesde: 'Termina desde',
  finHasta: 'Termina hasta',
};

const CLAVES = Object.keys(ETIQUETAS) as (keyof FechasFiltro)[];

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'mapa de ruta' : 'mapas de ruta'}`;
}

interface Props {
  onNuevoMapa: () => void;
}

export default function ConsultarMapasRutaCoordinador({ onNuevoMapa }: Props) {
  const listado = useMapasRutaCoordinador();
  const [mapaEnEdicion, setMapaEnEdicion] = useState<MapaRuta | null>(null);

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch, fechas } =
    listado;
  const mapas = data?.content ?? [];
  const recargandoSinFilas = isPlaceholderData && mapas.length === 0 && !listado.hayFiltros;

  const limites: Record<keyof FechasFiltro, { min?: string; max?: string }> = {
    inicioDesde: { max: fechas.inicioHasta },
    inicioHasta: { min: fechas.inicioDesde },
    finDesde: { max: fechas.finHasta },
    finHasta: { min: fechas.finDesde },
  };

  const secciones: SeccionFiltro[] = CLAVES.map((clave) => ({
    id: clave,
    tipo: 'fecha',
    etiqueta: ETIQUETAS[clave],
    valor: fechas[clave],
    onCambiar: (valor: string) => listado.setFecha(clave, valor),
    ...limites[clave],
  }));

  const aplicados = CLAVES.filter((clave) => fechas[clave] !== '').map((clave) => ({
    id: clave,
    etiqueta: `${ETIQUETAS[clave]}: ${formatearFechaCivil(fechas[clave])}`,
    onQuitar: () => listado.setFecha(clave, ''),
  }));

  return (
    <div className={RAIZ}>
      <FilterBar
        popover={{ secciones }}
        alineacionPanel="inicio"
        aplicados={aplicados}
        onLimpiar={listado.limpiarFiltros}
        totalResultados={data?.totalElements}
      />

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar los mapas de ruta"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <MapasRutaTable
            mapas={mapas}
            cargando={isLoading || recargandoSinFilas}
            hayFiltros={listado.hayFiltros}
            orden={{ clave: listado.ordenCampo, direccion: listado.ordenDireccion }}
            onOrdenar={listado.setOrden}
            onLimpiarFiltros={listado.limpiarFiltros}
            onNuevoMapa={onNuevoMapa}
            onCambiarFechaFin={setMapaEnEdicion}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={mapas.length}
          etiquetaPlural="mapas de ruta"
          onPageChange={listado.goToPage}
        />
      )}

      {mapaEnEdicion && (
        <CambiarFechaFinMapaRutaPanel
          mapa={mapaEnEdicion}
          onCerrar={() => setMapaEnEdicion(null)}
        />
      )}
    </div>
  );
}
