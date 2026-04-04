import { useState, Suspense } from 'react';
import { Outlet } from 'react-router';
import { useRolActivo } from '../hooks/useAuth';
import Header from './Header';
import Sidebar from './Sidebar';
import PageSkeleton from '../shared/components/PageSkeleton';
import { ChunkErrorBoundary } from '../shared/components/ChunkErrorBoundary';

export default function AppLayout() {
  const rolActivo = useRolActivo();
  const [sidenavOpen, setSidenavOpen] = useState(true);

  // Sidebar is hidden until the user has an active role (matches design spec).
  const showSidebar = sidenavOpen && rolActivo !== null;

  return (
    <div className="flex h-full">
      {showSidebar && (
        <aside
          className="w-[260px] shrink-0 animate-slide-in-left overflow-y-auto border-r border-border bg-surface"
          role="navigation"
          aria-label="Navegación principal"
        >
          <Sidebar />
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuToggle={() => setSidenavOpen((v) => !v)} />
        <main
          className="flex-1 overflow-y-auto bg-background p-6 lg:p-8"
          id="main-content"
        >
          <ChunkErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </ChunkErrorBoundary>
        </main>
      </div>
    </div>
  );
}
