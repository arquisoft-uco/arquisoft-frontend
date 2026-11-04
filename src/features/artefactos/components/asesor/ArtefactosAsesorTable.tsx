import { FileStack, SearchX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ArtefactoAsesorRowMenu from './ArtefactoAsesorRowMenu';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import EnlaceVersionesArtefacto from '../EnlaceVersionesArtefacto';
import InsigniaOmitido from '../InsigniaOmitido';

const DATO_SECUNDARIO = 'text-on-surface-secondary';
const DETALLE = 'block text-[13px] text-on-surface-secondary';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';

interface Props {
  artefactos: ArtefactoAsesor[];
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

  const columnas: ColumnaTabla<ArtefactoAsesor>[] = [
    {
      id: 'proyecto',
      encabezado: 'Proyecto',
      clave: 'nombreProyecto',
      ordenable: true,
      celda: (artefacto) => <span className={DATO_SECUNDARIO}>{artefacto.nombreProyecto}</span>,
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
  ];

  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay artefactos que coincidan con los filtros aplicados."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={FileStack}
      titulo="Aún no tienes artefactos asignados"
      descripcion="Aparecerán aquí cuando un proyecto de grado te asigne como asesor de un artefacto."
    />
  );

  return (
    <DataTable
      etiqueta="Artefactos asignados"
      columnas={columnas}
      filas={artefactos}
      idDeFila={(artefacto) => artefacto.id}
      orden={orden}
      onOrdenar={onOrdenar}
      cargando={cargando}
      vacio={vacio}
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
          <p className={TARJETA_DATO}>{artefacto.nombreProyecto}</p>
          <p className={TARJETA_DATO}>{artefacto.nombreRepositorio}</p>
          <p className={TARJETA_DATO}>Versión {artefacto.versionDocumento} del documento</p>
          {artefacto.omitido && <InsigniaOmitido />}
        </>
      )}
    />
  );
}
