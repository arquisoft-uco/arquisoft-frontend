import { useState } from 'react';
import { Users } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import EstudiantesProyectoGradoPanel from './EstudiantesProyectoGradoPanel';

interface Props {
  proyectoGradoId: string;
  titulo: string;
  finalizado?: boolean;
}

export default function AccionesProyectoGradoCoordinador({
  proyectoGradoId,
  titulo,
  finalizado = false,
}: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Button variante="secundario" icono={Users} onClick={() => setAbierto(true)}>
        Ver estudiantes
      </Button>
      {abierto && (
        <EstudiantesProyectoGradoPanel
          proyectoGradoId={proyectoGradoId}
          titulo={titulo}
          finalizado={finalizado}
          onCerrar={() => setAbierto(false)}
        />
      )}
    </>
  );
}
