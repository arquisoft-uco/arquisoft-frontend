import { useState } from 'react';
import { Users } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import EstudiantesProyectoGradoPanel from './EstudiantesProyectoGradoPanel';

interface Props {
  proyectoGradoId: string;
  titulo: string;
}

export default function AccionesProyectoGradoCoordinador({ proyectoGradoId, titulo }: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Button variante="secundario" icono={Users} onClick={() => setAbierto(true)}>
        Asignar estudiantes
      </Button>
      {abierto && (
        <EstudiantesProyectoGradoPanel
          proyectoGradoId={proyectoGradoId}
          titulo={titulo}
          onCerrar={() => setAbierto(false)}
        />
      )}
    </>
  );
}
