import { ClipboardList, SearchX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla, OrdenTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { OrdenDireccion } from '../../hooks/useFichasRepresentante';
import type { FichaPerfilRepresentante } from '../../models/FichaPerfilRepresentante';
import type { OrdenCampoFicha } from '../../models/OrdenCampoFicha';
import { AsesorDeFicha, FechaDeEstado, InsigniaEstadoFicha, TituloFicha } from '../FichaCeldas';

const INSIGNIAS_TARJETA = 'flex flex-wrap items-center gap-1.5';
const DATO_TARJETA = 'text-[13px] text-on-surface-secondary';

function esOrdenCampo(clave: string): clave is OrdenCampoFicha {
  return clave === 'tituloProyecto' || clave === 'asesorNombre';
}

interface Props {
  fichas: FichaPerfilRepresentante[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoFicha, direccion: OrdenDireccion) => void;
  onSeleccionar: (ficha: FichaPerfilRepresentante) => void;
  onLimpiarFiltros: () => void;
}

export default function FichasRepresentanteListado({
  fichas,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onSeleccionar,
  onLimpiarFiltros,
}: Props) {
  const titulo = (ficha: FichaPerfilRepresentante) => (
    <TituloFicha titulo={ficha.titulo} onAbrir={() => onSeleccionar(ficha)} />
  );
  const asesor = (ficha: FichaPerfilRepresentante) => (
    <AsesorDeFicha nombre={ficha.asesorNombre} email={ficha.asesorEmail} />
  );
  const estado = (ficha: FichaPerfilRepresentante) => (
    <InsigniaEstadoFicha estadoId={ficha.estadoId} nombre={ficha.estadoActual} />
  );

  const columnas: ColumnaTabla<FichaPerfilRepresentante>[] = [
    { id: 'ficha', encabezado: 'Ficha', clave: 'tituloProyecto', ordenable: true, celda: titulo },
    { id: 'asesor', encabezado: 'Asesor', clave: 'asesorNombre', ordenable: true, celda: asesor },
    { id: 'estado', encabezado: 'Estado actual', celda: estado },
    {
      id: 'actualizacion',
      encabezado: 'Última actualización',
      celda: (ficha) => <FechaDeEstado iso={ficha.estadoFechaActualizacion} />,
    },
  ];

  function ordenar(clave: string, direccion: OrdenDireccion) {
    if (esOrdenCampo(clave)) onOrdenar(clave, direccion);
  }

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
      icono={ClipboardList}
      titulo="Aún no hay fichas para evaluar"
      descripcion="Cuando se registren fichas de perfil, aparecerán aquí."
    />
  );

  return (
    <DataTable
      etiqueta="Fichas de perfil a evaluar"
      columnas={columnas}
      filas={fichas}
      idDeFila={(ficha) => ficha.id}
      orden={orden}
      onOrdenar={ordenar}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(ficha) => (
        <>
          {titulo(ficha)}
          {asesor(ficha)}
          <div className={INSIGNIAS_TARJETA}>{estado(ficha)}</div>
          <p className={DATO_TARJETA}>
            <FechaDeEstado iso={ficha.estadoFechaActualizacion} />
          </p>
        </>
      )}
    />
  );
}
