import { vi } from 'vitest';

export const mockKeycloak = {
  init: vi.fn().mockResolvedValue(true),
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  updateToken: vi.fn().mockResolvedValue(true),
  loadUserProfile: vi.fn().mockResolvedValue({ username: 'test-user', firstName: 'Test' }),
  authenticated: true,
  token: 'mock-token',
  tokenParsed: {
    sub: 'user-id',
    preferred_username: 'test-user',
    resource_access: {
      'angular-app': { roles: ['ESTUDIANTE'] },
    },
  },
  onTokenExpired: null as (() => void) | null,
  onAuthRefreshError: null as (() => void) | null,
};

vi.mock('../keycloak', () => ({
  keycloak: mockKeycloak,
  scheduleRefresh: vi.fn().mockReturnValue(vi.fn()),
}));
