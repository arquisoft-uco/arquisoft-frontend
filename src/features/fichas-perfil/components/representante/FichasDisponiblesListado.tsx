import { ClipboardList, SearchX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla, OrdenTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { OrdenDireccion } from '../../hooks/useFichasDisponibles';
import type { FichaDisponibleEvaluacion } from '../../models/FichaDisponibleEvaluacion';
import type { OrdenCampoFicha } from '../../models/OrdenCampoFicha';
import type { ResumenFicha } from '../../models/ResumenFicha';
import { EstadoYFechaTarjeta, AsesorDeFicha, TituloFicha } from '../FichaCeldas';
import { columnaAsesor, columnasEstado } from '../columnasFicha';

function resumenDe(ficha: FichaDisponibleEvaluacion): ResumenFicha {
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

interface Props {
  fichas: FichaDisponibleEvaluacion[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoFicha, direccion: OrdenDireccion) => void;
  onLimpiarFiltros: () => void;
}

export default function FichasDisponiblesListado({
  fichas,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
}: Props) {
  const titulo = (ficha: FichaDisponibleEvaluacion) => (
    <TituloFicha titulo={ficha.titulo} abrir={resumenDe(ficha)} />
  );
  const asesor = (ficha: FichaDisponibleEvaluacion) => (
    <AsesorDeFicha nombre={ficha.asesorNombre} email={ficha.asesorEmail} />
  );

  const columnas: ColumnaTabla<FichaDisponibleEvaluacion>[] = [
    { id: 'ficha', encabezado: 'Ficha', clave: 'tituloProyecto', ordenable: true, celda: titulo },
    columnaAsesor<FichaDisponibleEvaluacion>((ficha) => ({
      nombre: ficha.asesorNombre,
      email: ficha.asesorEmail,
    })),
    ...columnasEstado<FichaDisponibleEvaluacion>((ficha) => ({
      estadoId: ficha.estadoId,
      nombre: ficha.estadoActual,
      fechaActualizacion: ficha.estadoFechaActualizacion,
    })),
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
      titulo="No hay fichas disponibles para evaluar"
      descripcion="Cuando una ficha esté lista para evaluación y no la hayas evaluado, aparecerá aquí."
    />
  );

  return (
    <DataTable
      etiqueta="Fichas de perfil disponibles para evaluar"
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
        </>
      )}
    />
  );
}
