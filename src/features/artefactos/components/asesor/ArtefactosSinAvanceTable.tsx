import Badge from '../../../../shared/components/ui/Badge';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import { formatearFechaOpcional } from '../../../../shared/utils/formato-version';
import type { ArtefactoSinAvance } from '../../models/ArtefactoSinAvance';
import type { EstadoRevisionAsesor } from '../../models/artefactos';
import { varianteEstadoUltimaRevision } from '../../utils/estado-ultima-revision';

import VacioArtefactosSinAvance from './VacioArtefactosSinAvance';
import ProyectoConInsignia from '../ProyectoConInsignia';

const DATO_SECUNDARIO = 'text-on-surface-secondary';
const DETALLE = 'block text-[13px] text-on-surface-secondary';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';
const SIN_VERSIONES = 'Sin versiones';

interface Props {
  artefactos: ArtefactoSinAvance[];
  estados: EstadoRevisionAsesor[];
  dias: number;
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (clave: string, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
}

export default function ArtefactosSinAvanceTable({
  artefactos,
  estados,
  dias,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
}: Props) {
  function fecha(artefacto: ArtefactoSinAvance) {
    return formatearFechaOpcional(artefacto.fechaUltimaVersion ?? null, SIN_VERSIONES);
  }

  function diasSinAvance(artefacto: ArtefactoSinAvance) {
    return artefacto.diasSinAvance === undefined
      ? SIN_VERSIONES
      : `${artefacto.diasSinAvance} días`;
  }

  function estado(artefacto: ArtefactoSinAvance) {
    const nombre = artefacto.estadoUltimaRevision;
    if (!nombre) return <Badge variante="neutro">Sin revisión</Badge>;
    return <Badge variante={varianteEstadoUltimaRevision(estados, nombre)}>{nombre}</Badge>;
  }

  const columnas: ColumnaTabla<ArtefactoSinAvance>[] = [
    {
      id: 'proyecto',
      encabezado: 'Proyecto',
      clave: 'nombreProyecto',
      ordenable: true,
      celda: (artefacto) => (
        <ProyectoConInsignia proyecto={artefacto} className={DATO_SECUNDARIO} />
      ),
    },
    {
      id: 'documento',
      encabezado: 'Documento',
      clave: 'nombreDocumento',
      ordenable: true,
      celda: (artefacto) => (
        <>
          <span className="font-semibold">{artefacto.nombreDocumento}</span>
          <span className={DETALLE}>Versión {artefacto.versionDocumento} del documento</span>
        </>
      ),
    },
    {
      id: 'repositorio',
      encabezado: 'Repositorio',
      clave: 'nombreRepositorio',
      ordenable: true,
      celda: (artefacto) => <span className={DATO_SECUNDARIO}>{artefacto.nombreRepositorio}</span>,
    },
    {
      id: 'ultima-version',
      encabezado: 'Última versión',
      clave: 'fechaUltimaVersion',
      ordenable: true,
      celda: (artefacto) => <span className={DATO_SECUNDARIO}>{fecha(artefacto)}</span>,
    },
    {
      id: 'dias',
      encabezado: 'Días sin avance',
      celda: (artefacto) => <span className={DATO_SECUNDARIO}>{diasSinAvance(artefacto)}</span>,
    },
    {
      id: 'estado',
      encabezado: 'Última revisión',
      clave: 'estadoUltimaRevision',
      ordenable: true,
      celda: estado,
    },
  ];

  return (
    <DataTable
      etiqueta="Artefactos sin avance"
      columnas={columnas}
      filas={artefactos}
      idDeFila={(artefacto) => artefacto.id}
      orden={orden}
      onOrdenar={onOrdenar}
      cargando={cargando}
      vacio={
        <VacioArtefactosSinAvance
          hayFiltros={hayFiltros}
          dias={dias}
          onLimpiarFiltros={onLimpiarFiltros}
        />
      }
      tarjeta={(artefacto) => (
        <>
          <p className="font-semibold">{artefacto.nombreDocumento}</p>
          <p className={TARJETA_DATO}>
            <ProyectoConInsignia proyecto={artefacto} />
          </p>
          <p className={TARJETA_DATO}>{artefacto.nombreRepositorio}</p>
          <p className={TARJETA_DATO}>Versión {artefacto.versionDocumento} del documento</p>
          <p className={TARJETA_DATO}>Última versión: {fecha(artefacto)}</p>
          <p className={TARJETA_DATO}>Días sin avance: {diasSinAvance(artefacto)}</p>
          {estado(artefacto)}
        </>
      )}
    />
  );
}
