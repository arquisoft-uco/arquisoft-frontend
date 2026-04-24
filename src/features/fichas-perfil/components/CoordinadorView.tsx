import { useState } from 'react';
import { Plus } from 'lucide-react';
import ConsultarFichasPerfilCoordinador from './coordinador/ConsultarFichasPerfilCoordinador';
import RegistrarFichaPerfil from './RegistrarFichaPerfil';

export default function CoordinadorView() {
  const [registrarAbierto, setRegistrarAbierto] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <ConsultarFichasPerfilCoordinador
        accionHeader={
          !registrarAbierto ? (
            <button
              type="button"
              onClick={() => setRegistrarAbierto(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus size={16} aria-hidden />
              Nueva Ficha de Perfil
            </button>
          ) : undefined
        }
        formulario={
          registrarAbierto ? (
            <RegistrarFichaPerfil onCerrar={() => setRegistrarAbierto(false)} />
          ) : undefined
        }
      />
    </div>
  );
}
