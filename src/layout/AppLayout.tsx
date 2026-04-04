import { useState, useCallback, useEffect, Suspense } from 'react';
import { Outlet } from 'react-router';
import Header from './Header';
import Sidebar from './Sidebar';
import PageSkeleton from '../shared/components/PageSkeleton';
import { ChunkErrorBoundary } from '../shared/components/ChunkErrorBoundary';

export default function AppLayout() {
  // On desktop the sidebar starts open; on mobile it starts closed.
  const [sidenavOpen, setSidenavOpen] = useState(() => window.innerWidth >= 1024);

  const closeSidenav = useCallback(() => setSidenavOpen(false), []);

  // Close sidebar on Escape key (accessibility)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidenavOpen && window.innerWidth < 1024) {
        closeSidenav();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [sidenavOpen, closeSidenav]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Mobile backdrop overlay — lg:hidden handles desktop via CSS */}
      {sidenavOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] animate-fade-in lg:hidden"
          aria-hidden
          onClick={closeSidenav}
        />
      )}

      {/* Sidebar — fixed drawer on mobile, static column on desktop */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-surface transition-transform duration-300 ease-out',
          'lg:static lg:z-auto lg:w-[260px] lg:translate-x-0',
          sidenavOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full',
        ].join(' ')}
        role="navigation"
        aria-label="Navegación principal"
        aria-hidden={!sidenavOpen}
      >
        <Sidebar onClose={closeSidenav} />
      </aside>

      {/* Main content column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidenavOpen((v) => !v)} />
        <main
          className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8"
          id="main-content"
        >
          {/* Skip-to-content anchor target */}
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

