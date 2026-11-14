import ErrorState from '../../shared/components/ui/ErrorState';
import PageHeader from '../../shared/components/ui/PageHeader';
import Skeleton from '../../shared/components/ui/Skeleton';
import { useSecurityUi } from './hooks/useSecurityUi';

export default function Seguridad() {
  const { contenedorRef, cargando, error, reintentar } = useSecurityUi();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Administración de seguridad"
        descripcion="Gestiona el acceso a la aplicación."
      />
      {cargando && (
        <Skeleton variante="formulario" etiqueta="Cargando administración de seguridad…" />
      )}
      {error && (
        <ErrorState
          titulo="No pudimos cargar la administración de seguridad"
          descripcion="Inténtalo de nuevo en unos minutos."
          onReintentar={reintentar}
        />
      )}
      <div id="security-ui" ref={contenedorRef} />
    </div>
  );
}
