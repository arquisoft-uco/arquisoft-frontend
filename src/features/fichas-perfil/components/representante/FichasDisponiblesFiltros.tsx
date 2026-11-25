import FilterBar from '../../../../shared/components/ui/FilterBar';
import type { SeccionFiltro } from '../../../../shared/components/ui/FilterBar';
import type { useFichasDisponibles } from '../../hooks/useFichasDisponibles';
import { OPCIONES_ORDEN } from './opciones-orden-ficha';

interface FiltroAplicado {
  id: string;
  etiqueta: string;
  onQuitar: () => void;
}

interface Props {
  listado: ReturnType<typeof useFichasDisponibles>;
}

export default function FichasDisponiblesFiltros({ listado }: Props) {
  const { filtros, setAsesorNombre, setAsesorEmail } = listado;

  const secciones: SeccionFiltro[] = [
    {
      id: 'asesor-nombre',
      tipo: 'texto',
      etiqueta: 'Nombre del asesor',
      valor: filtros.asesorNombre,
      onCambiar: setAsesorNombre,
    },
    {
      id: 'asesor-email',
      tipo: 'texto',
      etiqueta: 'Correo del asesor',
      valor: filtros.asesorEmail,
      onCambiar: setAsesorEmail,
    },
  ];

  const aplicados: FiltroAplicado[] = [];
  if (filtros.asesorNombre.trim()) {
    aplicados.push({
      id: 'asesor-nombre',
      etiqueta: `Asesor: ${filtros.asesorNombre.trim()}`,
      onQuitar: () => setAsesorNombre(''),
    });
  }
  if (filtros.asesorEmail.trim()) {
    aplicados.push({
      id: 'asesor-email',
      etiqueta: `Correo: ${filtros.asesorEmail.trim()}`,
      onQuitar: () => setAsesorEmail(''),
    });
  }

  function cambiarOrden(id: string) {
    const opcion = OPCIONES_ORDEN.find((candidata) => candidata.id === id);
    if (opcion) listado.setOrden(opcion.campo, opcion.direccion);
  }

  return (
    <FilterBar
      busqueda={{
        valor: filtros.titulo,
        onCambiar: listado.setTitulo,
        etiqueta: 'Buscar fichas',
        placeholder: 'Buscar por título del proyecto',
      }}
      popover={{ secciones }}
      orden={{
        etiqueta: 'Ordenar por',
        opciones: OPCIONES_ORDEN,
        valor: `${listado.ordenCampo}:${listado.ordenDireccion}`,
        onCambiar: cambiarOrden,
      }}
      aplicados={aplicados}
      onLimpiar={listado.limpiarFiltros}
      totalResultados={listado.data?.totalElements}
    />
  );
}
