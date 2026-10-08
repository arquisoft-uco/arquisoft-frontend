import { CheckCircle2, SearchX, UserCog, Users, XCircle } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla, OrdenTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import type { OrdenDireccion } from '../../hooks/useFichasPerfilCoordinador';
import type { FichaPerfil } from '../../models/FichaPerfil';
import type { OrdenCampoFicha } from '../../models/OrdenCampoFicha';
import { EstadoYFechaTarjeta, AsesorDeFicha, TituloFicha } from '../FichaCeldas';
import { columnaAsesor, columnasEstado } from '../columnasFicha';

const ESTADO_DISPONIBLE_PARA_EVALUACION = 'DISPONIBLE_PARA_EVALUACION';

function esOrdenCampo(clave: string): clave is OrdenCampoFicha {
  return clave === 'tituloProyecto' || clave === 'asesorNombre';
}

interface Props {
  fichas: FichaPerfil[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoFicha, direccion: OrdenDireccion) => void;
  onVerEstudiantes: (ficha: FichaPerfil) => void;
  onCambiarAsesor: (ficha: FichaPerfil) => void;
  onAprobar: (ficha: FichaPerfil) => void;
  onNoAprobar: (ficha: FichaPerfil) => void;
  onLimpiarFiltros: () => void;
}

export default function FichasPerfilTable({
  fichas,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onVerEstudiantes,
  onCambiarAsesor,
  onAprobar,
  onNoAprobar,
  onLimpiarFiltros,
}: Props) {
  const columnas: ColumnaTabla<FichaPerfil>[] = [
    {
      id: 'ficha',
      encabezado: 'Ficha',
      clave: 'tituloProyecto',
      ordenable: true,
      celda: (ficha) => <TituloFicha titulo={ficha.tituloProyecto} />,
    },
    columnaAsesor<FichaPerfil>((ficha) => ficha.asesorFicha),
    ...columnasEstado<FichaPerfil>((ficha) => ({
      estadoId: ficha.estado.id,
      nombre: ficha.estado.nombre,
      fechaActualizacion: ficha.estado.fechaActualizacion,
    })),
  ];

  function ordenar(clave: string, direccion: OrdenDireccion) {
    if (esOrdenCampo(clave)) onOrdenar(clave, direccion);
  }

  function acciones(ficha: FichaPerfil) {
    return (
      <RowMenu
        etiqueta={`Acciones de la ficha ${ficha.tituloProyecto}`}
        acciones={[
          {
            etiqueta: 'Ver estudiantes',
            icono: Users,
            onSeleccionar: () => onVerEstudiantes(ficha),
          },
          {
            etiqueta: 'Cambiar asesor',
            icono: UserCog,
            onSeleccionar: () => onCambiarAsesor(ficha),
          },
          ...(ficha.estado.id === ESTADO_DISPONIBLE_PARA_EVALUACION
            ? [
                {
                  etiqueta: 'Aprobar ficha',
                  icono: CheckCircle2,
                  onSeleccionar: () => onAprobar(ficha),
                },
                {
                  etiqueta: 'No aprobar ficha',
                  icono: XCircle,
                  onSeleccionar: () => onNoAprobar(ficha),
                },
              ]
            : []),
        ]}
      />
    );
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
      icono={Users}
      titulo="Aún no hay fichas de perfil"
      descripcion="Registra la primera con «Nueva ficha de perfil»."
    />
  );

  return (
    <DataTable
      etiqueta="Fichas de perfil"
      columnas={columnas}
      filas={fichas}
      idDeFila={(ficha) => ficha.id}
      orden={orden}
      onOrdenar={ordenar}
      acciones={acciones}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(ficha) => (
        <>
          <TituloFicha titulo={ficha.tituloProyecto} />
          <AsesorDeFicha nombre={ficha.asesorFicha.nombre} email={ficha.asesorFicha.email} />
          <EstadoYFechaTarjeta
            estadoId={ficha.estado.id}
            nombre={ficha.estado.nombre}
            iso={ficha.estado.fechaActualizacion}
          />
        </>
      )}
    />
  );
}
