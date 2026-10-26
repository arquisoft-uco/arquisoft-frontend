import { Navigate, useParams } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import { useContextoVersionesRepositorio } from '../hooks/useContextoVersionesRepositorio';
import ConsultarVersionesRepositorio from './administrador/ConsultarVersionesRepositorio';

const NOMBRE_GENERICO = 'Repositorio';

export default function VersionesAdministradorView() {
  const { repositorioId = '' } = useParams();
  const { nombre, search } = useContextoVersionesRepositorio(repositorioId);

  if (!repositorioId) return <Navigate to="/repositorio-artefactos" replace />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        migas={[
          { etiqueta: 'Repositorio de artefactos', to: `/repositorio-artefactos${search}` },
          { etiqueta: nombre ?? NOMBRE_GENERICO },
        ]}
        titulo="Versiones del repositorio"
        meta={nombre ?? undefined}
        descripcion="Consulta la información de cada versión cargada"
      />
      <ConsultarVersionesRepositorio repositorioId={repositorioId} />
    </div>
  );
}
