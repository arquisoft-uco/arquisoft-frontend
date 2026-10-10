import { describe, it, expect } from 'vitest';
import type { FichaPerfil } from '../models/FichaPerfil';
import { resumenConAsesor, resumenDeFicha } from './resumen-ficha';

const FICHA: FichaPerfil = {
  id: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  asesorFicha: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  estado: { id: 'e-1', nombre: 'En revisión', fechaActualizacion: '2026-10-01T15:30:00' },
};

describe('resumen-ficha', () => {
  it('traduce título y estado de la ficha y, con asesor, suma su nombre y correo', () => {
    // Act
    const sinAsesor = resumenDeFicha(FICHA);
    const conAsesor = resumenConAsesor(FICHA);

    // Assert
    expect(sinAsesor).toEqual({
      id: 'f-1',
      titulo: 'Sistema de monitoreo',
      estadoId: 'e-1',
      estadoNombre: 'En revisión',
      fechaActualizacion: '2026-10-01T15:30:00',
    });
    expect(conAsesor).toEqual({
      ...sinAsesor,
      asesorId: 'a-1',
      asesorNombre: 'Ana Pérez',
      asesorEmail: 'ana@uco.edu.co',
    });
  });
});
