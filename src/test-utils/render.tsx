import { type ReactElement } from 'react';
import {
  render,
  renderHook,
  type RenderHookOptions,
  type RenderOptions,
} from '@testing-library/react';
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
    wrapper: ({ children }) => <AllProviders initialPath={initialPath}>{children}</AllProviders>,
    ...rest,
  });
}

function customRenderHook<Result, Props>(
  hook: (props: Props) => Result,
  options: RenderHookOptions<Props> & { initialPath?: string } = {},
) {
  const { initialPath, wrapper, ...rest } = options;
  const queryClient = makeQueryClient();
  return renderHook(hook, {
    wrapper:
      wrapper ??
      (({ children }) => (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[initialPath ?? '/']}>{children}</MemoryRouter>
        </QueryClientProvider>
      )),
    ...rest,
  });
}

export * from '@testing-library/react';
export { customRender as render, customRenderHook as renderHook };
