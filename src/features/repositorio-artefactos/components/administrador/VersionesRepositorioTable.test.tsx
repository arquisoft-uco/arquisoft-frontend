import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../test-utils/render';
import type { VersionRepositorioArtefacto } from '../../../../shared/models/VersionRepositorioArtefacto';
import VersionesRepositorioTable from './VersionesRepositorioTable';

const CON_HUELLA: VersionRepositorioArtefacto = {
  id: 'v-1',
  nombreDocumento: 'Manual de usuario',
  numeroVersion: 3,
  fechaCreacion: '2026-03-15T14:30:00Z',
  tipoContenido: 'application/pdf',
  tamanoBytes: 2048,
  nombreArchivo: 'manual.pdf',
  hashSha256: 'abcdef0123456789abcdef',
};

const SIN_HUELLA: VersionRepositorioArtefacto = {
  ...CON_HUELLA,
  id: 'v-2',
  nombreDocumento: 'Guía técnica',
  numeroVersion: 1,
  hashSha256: undefined,
};

describe('VersionesRepositorioTable', () => {
  it('muestra documento, versión, tamaño legible y "No disponible" cuando falta la huella', () => {
    // Act
    render(<VersionesRepositorioTable versiones={[CON_HUELLA, SIN_HUELLA]} cargando={false} />);

    // Assert
    expect(screen.getAllByText('Manual de usuario').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Versión 3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2.0 KB').length).toBeGreaterThan(0);
    expect(screen.getAllByText('No disponible').length).toBeGreaterThan(0);
  });

  it('sin versiones muestra el estado vacío', () => {
    // Act
    render(<VersionesRepositorioTable versiones={[]} cargando={false} />);

    // Assert
    expect(screen.getByText('Este repositorio aún no tiene versiones')).toBeInTheDocument();
  });
});
