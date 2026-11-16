import { useHasRole } from '../../../hooks/useHasRole';
import PageHeader from '../../../shared/components/ui/PageHeader';
import { Rol } from '../../../shared/models/rol';
import ConsultarDocumentaciones from './ConsultarDocumentaciones';

const ROLES_FILTRAN_ESTADO = [Rol.Bibliotecario];
const ROLES_VEN_AUTORES = [Rol.Bibliotecario];

export default function BibliotecaView() {
  const puedeFiltrarPorEstado = useHasRole(ROLES_FILTRAN_ESTADO);
  const puedeVerAutores = useHasRole(ROLES_VEN_AUTORES);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Biblioteca"
        descripcion="Consulta la documentación publicada de los proyectos de grado."
      />
      <ConsultarDocumentaciones
        puedeFiltrarPorEstado={puedeFiltrarPorEstado}
        puedeVerAutores={puedeVerAutores}
      />
    </div>
  );
}
