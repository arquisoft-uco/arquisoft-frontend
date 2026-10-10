import { ClipboardCheck, SearchX, UserCog, Users } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla, OrdenTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import type { OrdenDireccion } from '../../hooks/useFichasPerfilCoordinador';
import type { FichaPerfil } from '../../models/FichaPerfil';
import type { OrdenCampoFicha } from '../../models/OrdenCampoFicha';
import { EstadoYFechaTarjeta, AsesorDeFicha, TituloFicha } from '../FichaCeldas';
import { resumenConAsesor } from '../../utils/resumen-ficha';
import { columnaAsesor, columnasEstado } from '../columnasFicha';

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
  onVerEvaluaciones: (ficha: FichaPerfil) => void;
  onCambiarAsesor: (ficha: FichaPerfil) => void;
  onLimpiarFiltros: () => void;
}

export default function FichasPerfilTable({
  fichas,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onVerEstudiantes,
  onVerEvaluaciones,
  onCambiarAsesor,
  onLimpiarFiltros,
}: Props) {
  const columnas: ColumnaTabla<FichaPerfil>[] = [
    {
      id: 'ficha',
      encabezado: 'Ficha',
      clave: 'tituloProyecto',
      ordenable: true,
      celda: (ficha) => (
        <TituloFicha
          titulo={ficha.tituloProyecto}
          abrir={resumenConAsesor(ficha)}
          pestana="evaluaciones"
        />
      ),
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
            etiqueta: 'Ver evaluaciones',
            icono: ClipboardCheck,
            onSeleccionar: () => onVerEvaluaciones(ficha),
          },
          {
            etiqueta: 'Cambiar asesor',
            icono: UserCog,
            onSeleccionar: () => onCambiarAsesor(ficha),
          },
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
          <TituloFicha
            titulo={ficha.tituloProyecto}
            abrir={resumenConAsesor(ficha)}
            pestana="evaluaciones"
          />
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
