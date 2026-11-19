import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { Rol } from '../../../shared/models/rol';
import { ROLES_CONTABLES, dashboardService } from './dashboardService';

vi.mock('../../../api/axiosInstance', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);

describe('dashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consultarFichasPorEvaluar filtra por estadoFicha IN [DISPONIBLE_PARA_EVALUACION] con tamaño 5 y traduce las filas', async () => {
    // Arrange
    post.mockResolvedValue({
      data: {
        content: [
          {
            id: 'f-1',
            tituloProyecto: 'Titulo',
            asesorFicha: { nombre: 'Asesor', email: 'a@x.co' },
            estado: { id: 'E1', nombre: 'Disponible', fechaActualizacion: '2026-01-02T00:00:00Z' },
          },
        ],
        totalElements: 9,
      },
    });

    // Act
    const pagina = await dashboardService.consultarFichasPorEvaluar();

    // Assert
    expect(post).toHaveBeenCalledWith('/fichas-perfil/coordinador', {
      pagina: 0,
      tamanio: 5,
      ordenamiento: ['tituloProyecto:ASC'],
      filtros: {
        tipo: 'PREDICADO_MULTIVALOR',
        campo: 'estadoFicha',
        operador: 'IN',
        valores: ['DISPONIBLE_PARA_EVALUACION'],
      },
    });
    expect(pagina.totalElements).toBe(9);
    expect(pagina.content[0]).toEqual({
      id: 'f-1',
      titulo: 'Titulo',
      asesorNombre: 'Asesor',
      asesorEmail: 'a@x.co',
      estadoId: 'E1',
      estadoNombre: 'Disponible',
      fechaActualizacion: '2026-01-02T00:00:00Z',
    });
  });

  it('contarUsuarios arma el predicado simple de vigencia y el GRUPO AND por rol, y devuelve totalElements', async () => {
    // Arrange
    post.mockResolvedValue({ data: { totalElements: 4 } });

    // Act
    const soloVigencia = await dashboardService.contarUsuarios({ vigente: false });
    const porRol = await dashboardService.contarUsuarios({ vigente: true, rol: Rol.Asesor });

    // Assert
    expect(soloVigencia).toBe(4);
    expect(porRol).toBe(4);
    expect(post).toHaveBeenNthCalledWith(1, '/usuarios/administrador', {
      pagina: 0,
      tamanio: 1,
      filtros: { tipo: 'PREDICADO', campo: 'vigente', operador: 'ES', valor: 'false' },
    });
    expect(post).toHaveBeenNthCalledWith(2, '/usuarios/administrador', {
      pagina: 0,
      tamanio: 1,
      filtros: {
        tipo: 'GRUPO',
        conector: 'AND',
        nodos: [
          { tipo: 'PREDICADO', campo: 'vigente', operador: 'ES', valor: 'true' },
          { tipo: 'PREDICADO', campo: 'esAsesor', operador: 'ES', valor: 'true' },
        ],
      },
    });
  });

  it('ROLES_CONTABLES no incluye jurado', () => {
    expect(ROLES_CONTABLES).toHaveLength(7);
    expect(ROLES_CONTABLES).not.toContain(Rol.Jurado);
  });

  it('contarFichas pide una página de tamaño 1 sin filtro y devuelve totalElements', async () => {
    post.mockResolvedValue({ data: { totalElements: 31 } });

    const total = await dashboardService.contarFichas();

    expect(post).toHaveBeenCalledWith('/fichas-perfil/coordinador', { pagina: 0, tamanio: 1 });
    expect(total).toBe(31);
  });

  it('consultarFichasEstudiante traduce los estudiantes a nombres de integrantes', async () => {
    get.mockResolvedValue({
      data: [
        {
          idFichaPerfil: 'f-7',
          titulo: 'Mi ficha',
          asesor: { id: 'a', nombre: 'Asesor', email: 'a@x.co' },
          estado: { id: 'E2', nombre: 'Borrador', fechaActualizacion: '2026-02-01T00:00:00Z' },
          estudiantes: [
            { estudianteId: 'e1', nombre: 'Uno', email: 'u@x.co', vigente: true },
            { estudianteId: 'e2', nombre: 'Dos', email: 'd@x.co', vigente: true },
          ],
        },
      ],
    });

    const fichas = await dashboardService.consultarFichasEstudiante();

    expect(get).toHaveBeenCalledWith('/fichas-perfil/estudiante');
    expect(fichas[0]).toMatchObject({ id: 'f-7', titulo: 'Mi ficha', integrantes: ['Uno', 'Dos'] });
  });

  it('contar pide una página de tamaño 1 a la ruta del recurso y devuelve totalElements', async () => {
    // Arrange
    post.mockResolvedValue({ data: { content: [], totalElements: 12 } });

    // Act
    const total = await dashboardService.contar('solicitudes-novedad-asesor-recibidas');

    // Assert
    expect(post).toHaveBeenCalledWith('/solicitudes/novedad-asesor/recibidas', {
      pagina: 0,
      tamanio: 1,
    });
    expect(total).toBe(12);
  });

  it('consultarEvaluacionesPorEvaluar filtra por estadoJurado PENDIENTE_POR_EVALUAR y aplana el entregable', async () => {
    // Arrange
    post.mockResolvedValue({
      data: {
        content: [
          {
            id: 'ej-1',
            estado: { id: 'PENDIENTE_POR_EVALUAR', nombre: 'Pendiente por evaluar' },
            evaluacion: { id: 'ev-1', estado: { id: 'X', nombre: 'X' } },
            entregable: { id: 'en-1', proyecto: 'Riego', version: 2 },
          },
        ],
        totalElements: 3,
      },
    });

    // Act
    const pagina = await dashboardService.consultarEvaluacionesPorEvaluar();

    // Assert
    expect(post).toHaveBeenCalledWith('/evaluaciones/evaluaciones-jurado/jurado', {
      pagina: 0,
      tamanio: 5,
      filtros: {
        tipo: 'PREDICADO_MULTIVALOR',
        campo: 'estadoJurado',
        operador: 'IN',
        valores: ['PENDIENTE_POR_EVALUAR'],
      },
    });
    expect(pagina.totalElements).toBe(3);
    expect(pagina.content[0]).toEqual({
      id: 'ej-1',
      proyecto: 'Riego',
      versionEntregable: 2,
      estadoId: 'PENDIENTE_POR_EVALUAR',
      estadoNombre: 'Pendiente por evaluar',
    });
  });

  it('consultarArtefactosSinAvance envía 15 días y solo proyectos habilitados, del más antiguo al más reciente', async () => {
    // Arrange
    post.mockResolvedValue({ data: { content: [], totalElements: 0 } });

    // Act
    await dashboardService.consultarArtefactosSinAvance();

    // Assert
    expect(post).toHaveBeenCalledWith('/artefactos/asesor/sin-avance', {
      diasSinAvance: 15,
      criterio: {
        pagina: 0,
        tamanio: 5,
        ordenamiento: ['fechaUltimaVersion:ASC'],
        filtros: {
          tipo: 'GRUPO',
          conector: 'AND',
          nodos: [
            { tipo: 'PREDICADO', campo: 'proyectoFinalizado', operador: 'ES', valor: 'false' },
            { tipo: 'PREDICADO', campo: 'proyectoCancelado', operador: 'ES', valor: 'false' },
          ],
        },
      },
    });
  });

  it('consultarEntregablesPorPublicar deja solo el nombre de cada autor', async () => {
    // Arrange
    post.mockResolvedValue({
      data: {
        content: [
          {
            id: 'd-1',
            proyectoGrado: 'p-1',
            tituloProyecto: 'Riego',
            versionEntregable: 1,
            nombreArchivo: 'riego.zip',
            autores: [
              { id: 'a', identificador: '1', nombre: 'Ana' },
              { id: 'b', identificador: '2', nombre: 'Luis' },
            ],
          },
        ],
        totalElements: 1,
      },
    });

    // Act
    const pagina = await dashboardService.consultarEntregablesPorPublicar();

    // Assert
    expect(post).toHaveBeenCalledWith('/biblioteca/entregables-proyecto-grado/consultar', {
      pagina: 0,
      tamanio: 5,
    });
    expect(pagina.content[0]).toEqual({
      id: 'd-1',
      tituloProyecto: 'Riego',
      versionEntregable: 1,
      autores: ['Ana', 'Luis'],
    });
  });
});
