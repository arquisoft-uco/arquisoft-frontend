import { CloudUpload, SearchX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { RepositorioArtefacto } from '../../models/RepositorioArtefacto';
import EnlaceRepositorio from './EnlaceRepositorio';

const DATO_SECUNDARIO = 'text-on-surface-secondary';
const TARJETA_ENLACE =
  'hover:text-primary hover:underline hover:underline-offset-4 focus-visible:underline';
const DETALLE = 'block text-[13px] text-on-surface-secondary';
const TARJETA_NOMBRE = 'font-semibold text-on-surface';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';

function nombreAdministrador(repositorio: RepositorioArtefacto): string {
  return repositorio.administrador?.nombre || 'Sin administrador asignado';
}

function descripcionDe(repositorio: RepositorioArtefacto): string {
  return repositorio.descripcion || 'Sin descripción';
}

function Administrador({ repositorio }: { repositorio: RepositorioArtefacto }) {
  const { identificador, email } = repositorio.administrador ?? {};
  const secundario = [identificador, email].filter(Boolean).join(' · ');
  return (
    <>
      <span>{nombreAdministrador(repositorio)}</span>
      {secundario && <span className={DETALLE}>{secundario}</span>}
    </>
  );
}

interface Props {
  repositorios: RepositorioArtefacto[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (clave: string, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
}

export default function RepositoriosTable({
  repositorios,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
}: Props) {
  const columnas: ColumnaTabla<RepositorioArtefacto>[] = [
    {
      id: 'nombre',
      encabezado: 'Nombre',
      clave: 'nombreRepositorio',
      ordenable: true,
      celda: (repositorio) => <EnlaceRepositorio repositorio={repositorio} />,
    },
    {
      id: 'descripcion',
      encabezado: 'Descripción',
      clave: 'descripcion',
      ordenable: true,
      celda: (repositorio) => <span className={DATO_SECUNDARIO}>{descripcionDe(repositorio)}</span>,
    },
    {
      id: 'administrador',
      encabezado: 'Administrador',
      clave: 'administradorNombre',
      ordenable: true,
      celda: (repositorio) => <Administrador repositorio={repositorio} />,
    },
  ];

  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay repositorios que coincidan con la búsqueda."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar búsqueda
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={CloudUpload}
      titulo="Aún no hay repositorios"
      descripcion="Aparecerán aquí cuando se registren repositorios de artefactos."
    />
  );

  return (
    <DataTable
      etiqueta="Repositorios de artefactos"
      columnas={columnas}
      filas={repositorios}
      idDeFila={(repositorio) => repositorio.id}
      orden={orden}
      onOrdenar={onOrdenar}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(repositorio) => (
        <>
          <p className={TARJETA_NOMBRE}>
            <EnlaceRepositorio repositorio={repositorio} clase={TARJETA_ENLACE} />
          </p>
          <p className={TARJETA_DATO}>{descripcionDe(repositorio)}</p>
          <p className={TARJETA_DATO}>{nombreAdministrador(repositorio)}</p>
        </>
      )}
    />
  );
}
