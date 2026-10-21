import { useNavigate } from 'react-router';
import { UserPlus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import { useResumenUsuarios } from '../hooks/useResumenUsuarios';
import CifrasUsuariosPanel from './administrador/CifrasUsuariosPanel';
import UsuariosPorRolPanel from './administrador/UsuariosPorRolPanel';
import { COLUMNA_LATERAL, COLUMNA_PRINCIPAL, CONTENEDOR, PAGINA } from './disposicion';
import EncabezadoInicio from './EncabezadoInicio';

function fraseDeUsuarios(vigentes?: number): string | undefined {
  if (vigentes === undefined) return undefined;
  return vigentes === 1 ? 'Hay 1 usuario vigente.' : `Hay ${vigentes} usuarios vigentes.`;
}

export default function AdministradorView() {
  const navigate = useNavigate();
  const { vigentes } = useResumenUsuarios();

  return (
    <div className={PAGINA}>
      <EncabezadoInicio
        frase={fraseDeUsuarios(vigentes)}
        acciones={
          <Button icono={UserPlus} onClick={() => navigate('/usuarios')}>
            Registrar usuario
          </Button>
        }
      />
      <div className={CONTENEDOR}>
        <div className={COLUMNA_PRINCIPAL}>
          <UsuariosPorRolPanel />
        </div>
        <div className={COLUMNA_LATERAL}>
          <CifrasUsuariosPanel />
        </div>
      </div>
    </div>
  );
}
