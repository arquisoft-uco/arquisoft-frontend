import { useHasRole } from '../../../hooks/useHasRole';
import PageHeader from '../../../shared/components/ui/PageHeader';
import { Rol } from '../../../shared/models/rol';
import AyudaEstadosDocumentacion from './AyudaEstadosDocumentacion';
import ConsultarDocumentaciones from './ConsultarDocumentaciones';
import PestanasBiblioteca from './PestanasBiblioteca';

const ROLES_CONSULTAN_ESTADOS = [Rol.Bibliotecario];
const ROLES_VEN_AUTORES = [Rol.Bibliotecario];
const ROLES_CAMBIAN_ESTADO = [Rol.Bibliotecario];

export default function BibliotecaView() {
  const puedeConsultarEstados = useHasRole(ROLES_CONSULTAN_ESTADOS);
  const puedeVerAutores = useHasRole(ROLES_VEN_AUTORES);
  const puedeCambiarEstado = useHasRole(ROLES_CAMBIAN_ESTADO);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Biblioteca"
        descripcion="Consulta la documentación publicada de los proyectos de grado."
        acciones={puedeConsultarEstados ? <AyudaEstadosDocumentacion /> : undefined}
      />
      <PestanasBiblioteca activa="documentaciones" />
      <ConsultarDocumentaciones
        puedeFiltrarPorEstado={puedeConsultarEstados}
        puedeVerAutores={puedeVerAutores}
        puedeCambiarEstado={puedeCambiarEstado}
      />
    </div>
  );
}
