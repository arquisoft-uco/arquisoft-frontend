import type { ReactNode } from 'react';
import PageHeader from '../../../shared/components/ui/PageHeader';
import { useNombreUsuario } from '../../../hooks/useAuth';

interface Props {
  frase?: string;
  acciones?: ReactNode;
}

export default function EncabezadoInicio({ frase, acciones }: Props) {
  const { nombre } = useNombreUsuario();

  return <PageHeader titulo={`Hola, ${nombre}`} descripcion={frase} acciones={acciones} />;
}
