import { ClipboardCheck, SearchX } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla, OrdenTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import { varianteEstadoEvaluacion } from '../../../../shared/utils/estado-variante';
import type { OrdenDireccion } from '../../hooks/useFichasParticipacion';
import type { FichaPerfilRepresentante } from '../../models/FichaPerfilRepresentante';
import type { OrdenCampoFicha } from '../../models/OrdenCampoFicha';
import type { ResumenFicha } from '../../models/ResumenFicha';
import { EstadoYFechaTarjeta, AsesorDeFicha, TituloFicha } from '../FichaCeldas';
import { columnaAsesor, columnasEstado } from '../columnasFicha';

function resumenDe(ficha: FichaPerfilRepresentante): ResumenFicha {
  return {
    id: ficha.id,
    titulo: ficha.titulo,
    asesorNombre: ficha.asesorNombre,
    asesorEmail: ficha.asesorEmail,
    estadoId: ficha.estadoId,
    estadoNombre: ficha.estadoActual,
    fechaActualizacion: ficha.estadoFechaActualizacion,
  };
}

function esOrdenCampo(clave: string): clave is OrdenCampoFicha {
  return clave === 'tituloProyecto' || clave === 'asesorNombre';
}

function InsigniaEvaluacion({ ficha }: { ficha: FichaPerfilRepresentante }) {
  return (
    <Badge variante={varianteEstadoEvaluacion(ficha.evaluacionEstadoId)}>
      {ficha.evaluacionEstadoNombre}
    </Badge>
  );
}

interface Props {
  fichas: FichaPerfilRepresentante[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoFicha, direccion: OrdenDireccion) => void;
  onLimpiarFiltros: () => void;
  onVerDisponibles: () => void;
}

export default function FichasParticipacionListado({
  fichas,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
  onVerDisponibles,
}: Props) {
  const titulo = (ficha: FichaPerfilRepresentante) => (
    <TituloFicha titulo={ficha.titulo} abrir={resumenDe(ficha)} />
  );
  const asesor = (ficha: FichaPerfilRepresentante) => (
    <AsesorDeFicha nombre={ficha.asesorNombre} email={ficha.asesorEmail} />
  );

  const [estado, actualizacion] = columnasEstado<FichaPerfilRepresentante>((ficha) => ({
    estadoId: ficha.estadoId,
    nombre: ficha.estadoActual,
    fechaActualizacion: ficha.estadoFechaActualizacion,
  }));

  const columnas: ColumnaTabla<FichaPerfilRepresentante>[] = [
    { id: 'ficha', encabezado: 'Ficha', clave: 'tituloProyecto', ordenable: true, celda: titulo },
    columnaAsesor<FichaPerfilRepresentante>((ficha) => ({
      nombre: ficha.asesorNombre,
      email: ficha.asesorEmail,
    })),
    estado,
    {
      id: 'evaluacion',
      encabezado: 'Mi evaluación',
      celda: (ficha) => <InsigniaEvaluacion ficha={ficha} />,
    },
    actualizacion,
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
      icono={ClipboardCheck}
      titulo="Aún no participas en ninguna ficha"
      descripcion="Cuando inicies la evaluación de una ficha, aparecerá aquí."
      accion={
        <Button variante="secundario" onClick={onVerDisponibles}>
          Ver fichas disponibles
        </Button>
      }
    />
  );

  return (
    <DataTable
      etiqueta="Fichas de perfil en las que participo"
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
          <EstadoYFechaTarjeta
            estadoId={ficha.estadoId}
            nombre={ficha.estadoActual}
            iso={ficha.estadoFechaActualizacion}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <InsigniaEvaluacion ficha={ficha} />
          </div>
        </>
      )}
    />
  );
}
