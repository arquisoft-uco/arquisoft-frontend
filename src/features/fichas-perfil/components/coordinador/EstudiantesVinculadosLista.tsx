import { UserMinus } from 'lucide-react';
import IconButton from '../../../../shared/components/ui/IconButton';
import ListaPersonas from '../../../../shared/components/ui/ListaPersonas';
import type { EstudianteVinculado } from '../../models/EstudianteVinculado';

interface Props {
  estudiantes: EstudianteVinculado[];
  quitando: boolean;
  onQuitar: (estudiante: EstudianteVinculado) => void;
}

export default function EstudiantesVinculadosLista({ estudiantes, quitando, onQuitar }: Props) {
  return (
    <ListaPersonas
      personas={estudiantes}
      etiqueta="Estudiantes vinculados"
      accion={(estudiante) => (
        <IconButton
          etiqueta={`Quitar a ${estudiante.nombre} de la ficha`}
          icono={UserMinus}
          tono="peligro"
          disabled={quitando}
          onClick={() => onQuitar(estudiante)}
        />
      )}
    />
  );
}
