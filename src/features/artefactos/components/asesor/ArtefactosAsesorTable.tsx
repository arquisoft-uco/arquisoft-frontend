import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import ArtefactosAsesorVacio from './ArtefactosAsesorVacio';
import ArtefactoAsesorRowMenu, { type AccionesArtefactoAsesor } from './ArtefactoAsesorRowMenu';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import type { EstadoRevisionAsesor } from '../../models/artefactos';
import { estaCerrado } from '../../utils/estado-proyecto';
import { guiaArtefactoAsesor } from '../../utils/guia-artefacto';
import { etiquetaVersionDocumento } from '../../utils/version-documento';
import EnlaceVersionesArtefacto from '../EnlaceVersionesArtefacto';
import InsigniaEstadoUltimaRevision from '../InsigniaEstadoUltimaRevision';
import InsigniaOmitido from '../InsigniaOmitido';
import ProyectoConInsignia from '../ProyectoConInsignia';

const DATO_SECUNDARIO = 'text-on-surface-secondary';
const DETALLE = 'block text-[13px] text-on-surface-secondary';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';

interface Props extends AccionesArtefactoAsesor {
  artefactos: ArtefactoAsesor[];
  ultimaVersion: (artefactoId: string) => VersionArtefacto | null | undefined;
  estados: EstadoRevisionAsesor[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (clave: string, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
}

export default function ArtefactosAsesorTable({
  artefactos,
  ultimaVersion,
  estados,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
  ...accionesFila
}: Props) {
  function enlaceVersiones(artefacto: ArtefactoAsesor) {
    return (
      <EnlaceVersionesArtefacto
        artefactoId={artefacto.id}
        nombreDocumento={artefacto.nombreDocumento}
        vista="versiones-artefactos"
      />
    );
  }

  function versionDelDocumento(artefacto: ArtefactoAsesor): string {
    return etiquetaVersionDocumento(artefacto, ultimaVersion, ' del documento');
  }

  function guia(artefacto: ArtefactoAsesor): string | null {
    if (artefacto.omitido || estaCerrado(artefacto)) return null;
    const ultima = ultimaVersion(artefacto.id);
    return ultima === undefined ? null : guiaArtefactoAsesor(ultima);
  }

  function estadoRevision(artefacto: ArtefactoAsesor) {
    return (
      <InsigniaEstadoUltimaRevision estado={artefacto.estadoUltimaRevision} estados={estados} />
    );
  }

  const columnas: ColumnaTabla<ArtefactoAsesor>[] = [
    {
      id: 'documento',
      encabezado: 'Documento',
      clave: 'nombreDocumento',
      ordenable: true,
      celda: (artefacto) => (
        <>
          {enlaceVersiones(artefacto)}
          <span className={DETALLE}>{versionDelDocumento(artefacto)}</span>
          {artefacto.omitido && <InsigniaOmitido />}
          {guia(artefacto) && <span className={DETALLE}>{guia(artefacto)}</span>}
        </>
      ),
    },
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
      id: 'revision',
      encabezado: 'Última revisión',
      clave: 'estadoUltimaRevision',
      ordenable: true,
      celda: estadoRevision,
    },
    {
      id: 'repositorio',
      encabezado: 'Repositorio',
      clave: 'nombreRepositorio',
      ordenable: true,
      celda: (artefacto) => <span className={DATO_SECUNDARIO}>{artefacto.nombreRepositorio}</span>,
    },
  ];

  return (
    <DataTable
      etiqueta="Artefactos asignados"
      columnas={columnas}
      filas={artefactos}
      idDeFila={(artefacto) => artefacto.id}
      orden={orden}
      onOrdenar={onOrdenar}
      cargando={cargando}
      vacio={<ArtefactosAsesorVacio hayFiltros={hayFiltros} onLimpiarFiltros={onLimpiarFiltros} />}
      acciones={(artefacto) => <ArtefactoAsesorRowMenu artefacto={artefacto} {...accionesFila} />}
      tarjeta={(artefacto) => (
        <>
          <p className="font-semibold">{enlaceVersiones(artefacto)}</p>
          <p className={TARJETA_DATO}>
            <ProyectoConInsignia proyecto={artefacto} />
          </p>
          <p className={TARJETA_DATO}>{artefacto.nombreRepositorio}</p>
          <p className={TARJETA_DATO}>{versionDelDocumento(artefacto)}</p>
          {artefacto.omitido && <InsigniaOmitido />}
          {estadoRevision(artefacto)}
          {guia(artefacto) && <p className={TARJETA_DATO}>{guia(artefacto)}</p>}
        </>
      )}
    />
  );
}
