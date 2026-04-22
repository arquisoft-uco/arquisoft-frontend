import { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialPath?: string;
}

function AllProviders({
  children,
  initialPath = '/',
}: {
  children: React.ReactNode;
  initialPath?: string;
}) {
  return (
    <QueryClientProvider client={makeQueryClient()}>
      <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { initialPath, ...rest } = options;
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialPath={initialPath}>{children}</AllProviders>
    ),
    ...rest,
  });
}

export * from '@testing-library/react';
export { customRender as render };
