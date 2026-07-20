import { lazy, type ReactElement } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import AuthGuard from './guards/AuthGuard';
import RoleGuard from './guards/RoleGuard';
import AppLayout from './layout/AppLayout';
import { ROLES_POR_RUTA } from './layout/nav-items';
import ForbiddenPage from './shared/components/ForbiddenPage';
import RouteErrorPage from './shared/components/RouteErrorPage';

// Lazy feature imports — AppLayout's <Suspense> handles loading states
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
const FichasPerfil = lazy(() => import('./features/fichas-perfil/FichasPerfil'));
const ProyectosGrado = lazy(() => import('./features/proyectos-grado/ProyectosGrado'));
const Artefactos = lazy(() => import('./features/artefactos/Artefactos'));
const Entregables = lazy(() => import('./features/entregables/Entregables'));
const Evaluaciones = lazy(() => import('./features/evaluaciones/Evaluaciones'));
const MapasRuta = lazy(() => import('./features/mapas-ruta/MapasRuta'));
const RepositorioArtefactos = lazy(
  () => import('./features/repositorio-artefactos/RepositorioArtefactos'),
);
const Biblioteca = lazy(() => import('./features/biblioteca/Biblioteca'));
const Solicitudes = lazy(() => import('./features/solicitudes/Solicitudes'));
const SeleccionarRol = lazy(() => import('./features/seleccionar-rol/SeleccionarRol'));

/** Wraps element with RoleGuard if the path has a role restriction in nav-items. */
function guarded(path: string, element: ReactElement): ReactElement {
  const roles = ROLES_POR_RUTA[path];
  if (!roles) return element;
  return <RoleGuard roles={roles}>{element}</RoleGuard>;
}

/**
 * Exported so the Axios error interceptor can call router.navigate('/forbidden')
 * outside the React tree (hooks/useNavigate unavailable in interceptors).
 */
export const router = createBrowserRouter([
  {
    // AuthGuard: shows AppLoader while Keycloak initializes, then renders Outlet
    element: <AuthGuard />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        // AppLayout: shell with Header + conditional Sidebar
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'fichas-perfil', element: guarded('fichas-perfil', <FichasPerfil />) },
          { path: 'proyectos-grado', element: guarded('proyectos-grado', <ProyectosGrado />) },
          { path: 'artefactos', element: guarded('artefactos', <Artefactos />) },
          { path: 'entregables', element: guarded('entregables', <Entregables />) },
          { path: 'evaluaciones', element: guarded('evaluaciones', <Evaluaciones />) },
          { path: 'mapas-ruta', element: guarded('mapas-ruta', <MapasRuta />) },
          { path: 'repositorio-artefactos', element: guarded('repositorio-artefactos', <RepositorioArtefactos />) },
          { path: 'biblioteca', element: guarded('biblioteca', <Biblioteca />) },
          { path: 'solicitudes', element: guarded('solicitudes', <Solicitudes />) },
          { path: 'seleccionar-rol', element: <SeleccionarRol /> },
          { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
  { path: 'forbidden', element: <ForbiddenPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);
