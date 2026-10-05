import { Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import Button from '../../../shared/components/ui/Button';
import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarFichasPerfilCoordinador from './coordinador/ConsultarFichasPerfilCoordinador';

export default function CoordinadorView() {
  const navigate = useNavigate();
  const { search } = useLocation();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Fichas de perfil"
        descripcion="Consulta las fichas, sus estudiantes y su asesor."
        acciones={
          <Button
            icono={Plus}
            onClick={() => navigate({ pathname: '/fichas-perfil/nueva', search })}
          >
            Nueva ficha de perfil
          </Button>
        }
      />
      <ConsultarFichasPerfilCoordinador />
    </div>
  );
}
