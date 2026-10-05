import { SearchX, UserCog, Users } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla, OrdenTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import type { OrdenDireccion } from '../../hooks/useFichasPerfilCoordinador';
import type { FichaPerfil } from '../../models/FichaPerfil';
import type { OrdenCampoFicha } from '../../models/OrdenCampoFicha';
import { AsesorDeFicha, TituloFicha } from '../FichaCeldas';

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
    {
      id: 'asesor',
      encabezado: 'Asesor',
      clave: 'asesorNombre',
      ordenable: true,
      celda: (ficha) => (
        <AsesorDeFicha nombre={ficha.asesorFicha.nombre} email={ficha.asesorFicha.email} />
      ),
    },
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
        </>
      )}
    />
  );
}
