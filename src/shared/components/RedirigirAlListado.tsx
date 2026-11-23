import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router';
import { toast } from '../hooks/useToast';

interface Props {
  destino: string;
}

export default function RedirigirAlListado({ destino }: Props) {
  const avisado = useRef(false);

  useEffect(() => {
    if (avisado.current) return;
    avisado.current = true;
    toast.info(
      'Abre el detalle desde el listado',
      'No pudimos recuperar esta página. Elígela de nuevo desde el listado.',
    );
  }, []);

  return <Navigate to={destino} replace />;
}
