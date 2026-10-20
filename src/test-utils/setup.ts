import '@testing-library/jest-dom';
import { vi } from 'vitest';

// useAuth y session importan el registro de proveedores, que arrastra config/env.ts y exige estas variables al cargar.
vi.stubEnv('VITE_API_URL', 'http://localhost:8080/api');
vi.stubEnv('VITE_KEYCLOAK_URL', 'http://localhost:8180');
vi.stubEnv('VITE_KEYCLOAK_REALM', 'arquisoft');
vi.stubEnv('VITE_KEYCLOAK_CLIENT_ID', 'arquisoft-frontend');
