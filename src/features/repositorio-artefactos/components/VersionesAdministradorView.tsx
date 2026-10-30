import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Navigate, useParams } from 'react-router';
import Button from '../../../shared/components/ui/Button';
import PageHeader from '../../../shared/components/ui/PageHeader';
import { useContextoVersionesRepositorio } from '../hooks/useContextoVersionesRepositorio';
import ConsultarVersionesRepositorio from './administrador/ConsultarVersionesRepositorio';
import SubirVersionPanel from './administrador/SubirVersionPanel';

const NOMBRE_GENERICO = 'Repositorio';

export default function VersionesAdministradorView() {
  const { repositorioId = '' } = useParams();
  const [subiendo, setSubiendo] = useState(false);
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
        acciones={
          <Button icono={Upload} onClick={() => setSubiendo(true)}>
            Subir versión
          </Button>
        }
      />
      <ConsultarVersionesRepositorio
        repositorioId={repositorioId}
        onSubir={() => setSubiendo(true)}
      />
      {subiendo && (
        <SubirVersionPanel repositorioId={repositorioId} onCerrar={() => setSubiendo(false)} />
      )}
    </div>
  );
}
