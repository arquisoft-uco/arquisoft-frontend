import Notice from './ui/Notice';

interface Props {
  recurso: string;
}

export default function AvisoNoDisponible({ recurso }: Props) {
  return (
    <Notice variante="advertencia" etiqueta={`No disponible: ${recurso}`}>
      Esta opción aún no está disponible.
    </Notice>
  );
}
