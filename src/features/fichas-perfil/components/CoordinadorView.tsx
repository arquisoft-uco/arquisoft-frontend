import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarFichasPerfilCoordinador from './coordinador/ConsultarFichasPerfilCoordinador';
import RegistrarFichaPerfil from './RegistrarFichaPerfil';

export default function CoordinadorView() {
  const [registrarAbierto, setRegistrarAbierto] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Fichas de perfil"
        descripcion="Consulta las fichas, sus estudiantes y su asesor."
        acciones={
          !registrarAbierto ? (
            <Button icono={Plus} onClick={() => setRegistrarAbierto(true)}>
              Nueva ficha de perfil
            </Button>
          ) : undefined
        }
      />
      {registrarAbierto && <RegistrarFichaPerfil onCerrar={() => setRegistrarAbierto(false)} />}
      <ConsultarFichasPerfilCoordinador />
    </div>
  );
}
