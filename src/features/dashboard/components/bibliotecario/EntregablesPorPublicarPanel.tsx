import { BookOpen } from 'lucide-react';
import { useEntregablesPorPublicar } from '../../hooks/useEntregablesPorPublicar';
import { LISTA } from '../disposicion';
import BandejaInicio from '../BandejaInicio';

export default function EntregablesPorPublicarPanel() {
  const { entregables, cargado, hayError, reintentar } = useEntregablesPorPublicar();

  return (
    <BandejaInicio
      titulo="Entregables por publicar"
      nombre="los entregables por publicar"
      verTodos={{ etiqueta: 'Ver todos', destino: '/biblioteca/disponibles' }}
      cargado={cargado}
      hayError={hayError}
      reintentar={() => void reintentar()}
      vacia={entregables.length === 0}
      vacio={{
        icono: BookOpen,
        titulo: 'No hay entregables por publicar',
        descripcion: 'Cuando un proyecto de grado tenga un entregable disponible, aparecerá aquí.',
      }}
    >
      <ul className={LISTA}>
        {entregables.map((entregable) => (
          <li key={entregable.id} className="flex flex-col gap-1 py-3">
            <p className="font-medium text-on-surface">
              {entregable.tituloProyecto ?? 'Proyecto sin título'}
            </p>
            <p className="text-sm text-on-surface-secondary">
              Versión {entregable.versionEntregable}
              {entregable.autores.length > 0 && ` · ${entregable.autores.join(', ')}`}
            </p>
          </li>
        ))}
      </ul>
    </BandejaInicio>
  );
}
