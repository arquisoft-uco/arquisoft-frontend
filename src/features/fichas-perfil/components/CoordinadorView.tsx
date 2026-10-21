import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarFichasPerfilCoordinador from './coordinador/ConsultarFichasPerfilCoordinador';
import RegistrarFichaPerfilPanel from './coordinador/RegistrarFichaPerfilPanel';

export default function CoordinadorView() {
  const [registrando, setRegistrando] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Fichas de perfil"
        descripcion="Consulta las fichas, sus estudiantes y su asesor."
        acciones={
          <Button icono={Plus} onClick={() => setRegistrando(true)}>
            Nueva ficha de perfil
          </Button>
        }
      />
      <ConsultarFichasPerfilCoordinador />
      {registrando && <RegistrarFichaPerfilPanel onCerrar={() => setRegistrando(false)} />}
    </div>
  );
}
