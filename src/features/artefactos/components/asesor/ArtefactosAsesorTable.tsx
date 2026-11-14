import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import ArtefactosAsesorVacio from './ArtefactosAsesorVacio';
import ArtefactoAsesorRowMenu from './ArtefactoAsesorRowMenu';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { estaCerrado } from '../../utils/estado-proyecto';
import { guiaArtefactoAsesor } from '../../utils/guia-artefacto';
import EstadoUltimaRevision from '../EstadoUltimaRevision';
import EnlaceVersionesArtefacto from '../EnlaceVersionesArtefacto';
import InsigniaOmitido from '../InsigniaOmitido';

import ProyectoConInsignia from '../ProyectoConInsignia';

const DATO_SECUNDARIO = 'text-on-surface-secondary';
const DETALLE = 'block text-[13px] text-on-surface-secondary';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';

interface Props {
  artefactos: ArtefactoAsesor[];
  ultimaVersion: (artefactoId: string) => VersionArtefacto | null | undefined;
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (clave: string, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
  onOmitir: (artefacto: ArtefactoAsesor) => void;
  onReactivar: (artefacto: ArtefactoAsesor) => void;
  onGestionarEstudiantes: (artefacto: ArtefactoAsesor) => void;
  onCambiarAsesor: (artefacto: ArtefactoAsesor) => void;
  onCambiarVersionRepositorio: (artefacto: ArtefactoAsesor) => void;
}

export default function ArtefactosAsesorTable({
  artefactos,
  ultimaVersion,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
  onOmitir,
  onReactivar,
  onGestionarEstudiantes,
  onCambiarAsesor,
  onCambiarVersionRepositorio,
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

  function guia(artefacto: ArtefactoAsesor): string | null {
    if (artefacto.omitido || estaCerrado(artefacto)) return null;
    const ultima = ultimaVersion(artefacto.id);
    return ultima === undefined ? null : guiaArtefactoAsesor(ultima);
  }

  const columnas: ColumnaTabla<ArtefactoAsesor>[] = [
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
          {enlaceVersiones(artefacto)}
          <span className={DETALLE}>Versión {artefacto.versionDocumento} del documento</span>
          {artefacto.omitido && <InsigniaOmitido />}
          {guia(artefacto) && <span className={DETALLE}>{guia(artefacto)}</span>}
        </>
      ),
    },
    {
      id: 'revision',
      encabezado: 'Revisión',
      celda: (artefacto) => (
        <EstadoUltimaRevision ultima={ultimaVersion(artefacto.id)} omitido={artefacto.omitido} />
      ),
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
      acciones={(artefacto) => (
        <ArtefactoAsesorRowMenu
          artefacto={artefacto}
          onCambiarAsesor={onCambiarAsesor}
          onCambiarVersionRepositorio={onCambiarVersionRepositorio}
          onGestionarEstudiantes={onGestionarEstudiantes}
          onOmitir={onOmitir}
          onReactivar={onReactivar}
        />
      )}
      tarjeta={(artefacto) => (
        <>
          <p className="font-semibold">{enlaceVersiones(artefacto)}</p>
          <p className={TARJETA_DATO}>
            <ProyectoConInsignia proyecto={artefacto} />
          </p>
          <p className={TARJETA_DATO}>{artefacto.nombreRepositorio}</p>
          <p className={TARJETA_DATO}>Versión {artefacto.versionDocumento} del documento</p>
          {artefacto.omitido && <InsigniaOmitido />}
          <EstadoUltimaRevision ultima={ultimaVersion(artefacto.id)} omitido={artefacto.omitido} />
          {guia(artefacto) && <p className={TARJETA_DATO}>{guia(artefacto)}</p>}
        </>
      )}
    />
  );
}
