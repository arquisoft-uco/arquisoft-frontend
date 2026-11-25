import Badge from '../../../../shared/components/ui/Badge';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import type { ArtefactoEstudiante } from '../../models/ArtefactoEstudiante';
import type { EstadoRevisionAsesor } from '../../models/artefactos';
import InsigniaEstadoUltimaRevision from '../InsigniaEstadoUltimaRevision';
import InsigniaOmitido from '../InsigniaOmitido';
import ProyectoConInsignia from '../ProyectoConInsignia';

const DATO_SECUNDARIO = 'text-on-surface-secondary';
const NOMBRE = 'font-medium text-on-surface';

export function columnasArtefactosEstudiante(
  estados: EstadoRevisionAsesor[],
): ColumnaTabla<ArtefactoEstudiante>[] {
  return [
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
          <span className={NOMBRE}>{artefacto.nombreDocumento}</span>
          {artefacto.omitido && <InsigniaOmitido />}
        </>
      ),
    },
    {
      id: 'version',
      encabezado: 'Versión del documento',
      clave: 'versionDocumento',
      ordenable: true,
      celda: (artefacto) => <Badge variante="neutro">Versión {artefacto.versionDocumento}</Badge>,
    },
    {
      id: 'estado',
      encabezado: 'Última revisión',
      clave: 'estadoUltimaRevision',
      ordenable: true,
      celda: (artefacto) => (
        <InsigniaEstadoUltimaRevision estado={artefacto.estadoUltimaRevision} estados={estados} />
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
      id: 'asesor',
      encabezado: 'Asesor',
      clave: 'nombreAsesor',
      ordenable: true,
      celda: (artefacto) => <span className={DATO_SECUNDARIO}>{artefacto.nombreAsesor}</span>,
    },
  ];
}
