import { useHasRole } from '../../../hooks/useHasRole';
import Tabs from '../../../shared/components/ui/Tabs';
import { Rol } from '../../../shared/models/rol';

const ROLES_VEN_POR_REGISTRAR = [Rol.Bibliotecario];

type PestanaBiblioteca = 'documentaciones' | 'por-registrar';

const ITEMS = [
  { id: 'documentaciones' as const, etiqueta: 'Documentaciones', to: '/biblioteca' },
  { id: 'por-registrar' as const, etiqueta: 'Por registrar', to: '/biblioteca/disponibles' },
];

interface Props {
  activa: PestanaBiblioteca;
}

export default function PestanasBiblioteca({ activa }: Props) {
  const puedeVerPorRegistrar = useHasRole(ROLES_VEN_POR_REGISTRAR);

  if (!puedeVerPorRegistrar) return null;

  return <Tabs items={ITEMS} valor={activa} etiqueta="Secciones de Biblioteca" />;
}
