import { ClipboardCheck, SearchX } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla, OrdenTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import { varianteEstadoEvaluacion } from '../../../../shared/utils/estado-variante';
import type {
  EvaluacionFichaPerfilAsesor,
  OrdenCampoEvaluacionAsesor,
} from '../../models/EvaluacionFichaPerfilAsesor';
import { FechaDeEstado, TituloFicha } from '../FichaCeldas';

type Direccion = 'ASC' | 'DESC';

const DATO_TARJETA = 'text-[13px] text-on-surface-secondary';

function esOrdenCampo(clave: string): clave is OrdenCampoEvaluacionAsesor {
  return clave === 'tituloProyecto' || clave === 'fechaCreacion';
}

function InsigniaEvaluacion({ evaluacion }: { evaluacion: EvaluacionFichaPerfilAsesor }) {
  return (
    <Badge
      variante={
        evaluacion.estadoEvaluacionId
          ? varianteEstadoEvaluacion(evaluacion.estadoEvaluacionId)
          : 'neutro'
      }
    >
      {evaluacion.estadoEvaluacionNombre ?? 'Sin estado'}
    </Badge>
  );
}

function tituloDe(evaluacion: EvaluacionFichaPerfilAsesor) {
  return (
    <TituloFicha
      titulo={evaluacion.tituloProyecto}
      abrir={{ id: evaluacion.fichaPerfilId, titulo: evaluacion.tituloProyecto }}
    />
  );
}

const COLUMNAS: ColumnaTabla<EvaluacionFichaPerfilAsesor>[] = [
  {
    id: 'ficha',
    encabezado: 'Ficha',
    clave: 'tituloProyecto',
    ordenable: true,
    celda: tituloDe,
  },
  {
    id: 'representante',
    encabezado: 'Representante',
    celda: (evaluacion) => <span>{evaluacion.representante.nombre}</span>,
  },
  {
    id: 'estado',
    encabezado: 'Estado de la evaluación',
    celda: (evaluacion) => <InsigniaEvaluacion evaluacion={evaluacion} />,
  },
  {
    id: 'creada',
    encabezado: 'Creada el',
    clave: 'fechaCreacion',
    ordenable: true,
    celda: (evaluacion) => <FechaDeEstado iso={evaluacion.fechaCreacion} />,
  },
];

interface Props {
  evaluaciones: EvaluacionFichaPerfilAsesor[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoEvaluacionAsesor, direccion: Direccion) => void;
  onLimpiarFiltros: () => void;
}

export default function EvaluacionesAsesorTable({
  evaluaciones,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
}: Props) {
  function ordenar(clave: string, direccion: Direccion) {
    if (esOrdenCampo(clave)) onOrdenar(clave, direccion);
  }

  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay evaluaciones que coincidan con tu búsqueda."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={ClipboardCheck}
      titulo="Aún no hay evaluaciones"
      descripcion="Cuando el comité de currículum evalúe una de tus fichas, aparecerá aquí."
    />
  );

  return (
    <DataTable
      etiqueta="Evaluaciones de las fichas que asesoras"
      columnas={COLUMNAS}
      filas={evaluaciones}
      idDeFila={(evaluacion) => evaluacion.id}
      orden={orden}
      onOrdenar={ordenar}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(evaluacion) => (
        <>
          {tituloDe(evaluacion)}
          <p className={DATO_TARJETA}>{evaluacion.representante.nombre}</p>
          <div>
            <InsigniaEvaluacion evaluacion={evaluacion} />
          </div>
          <p className={DATO_TARJETA}>
            <FechaDeEstado iso={evaluacion.fechaCreacion} />
          </p>
        </>
      )}
    />
  );
}
